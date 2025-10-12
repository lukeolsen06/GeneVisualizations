import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";
import "./PlotlyGraph.css";

const VolcanoPlot = ({
  data,
  threshold,
  method,
  foldChange,
  handlePlotlyClick,
  statMethod,
  highlightedGene,
}) => {
  const plotContainerRef = useRef(null);
  const [showTextTraces, setShowTextTraces] = useState(false);
  const [significantCount, setSignificantCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [nonSignificantSampleSize, setNonSignificantSampleSize] =
    useState(4500);
  const [validatedThreshold, setValidatedThreshold] = useState(threshold);
  const [validatedFoldChange, setValidatedFoldChange] = useState(foldChange);

  const sampleNonSignificantPoints = (points, sampleSize) => {
    if (points.length <= sampleSize) {
      return points;
    }

    // Define grid size
    const gridSize = 20; // Adjust this as needed
    const grid = {};

    // Place points into grid cells
    points.forEach((point) => {
      const xCell = Math.floor(point.log2FoldChange * gridSize);
      const yCell = Math.floor(point["-log10(pvalue)"] * gridSize);
      const key = `${xCell}-${yCell}`;
      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(point);
    });

    // Sample points from each grid cell, prioritizing higher y-values
    const sampledPoints = [];
    const sortedKeys = Object.keys(grid).sort((a, b) => {
      const yA = parseInt(a.split("-")[1], 10);
      const yB = parseInt(b.split("-")[1], 10);
      return yB - yA; // Sort in descending order
    });

    sortedKeys.forEach((key) => {
      const cellPoints = grid[key];
      const numPointsToSample = Math.min(
        cellPoints.length,
        Math.ceil(sampleSize / sortedKeys.length)
      );
      const shuffled = cellPoints.sort(() => 0.5 - Math.random());
      sampledPoints.push(...shuffled.slice(0, numPointsToSample));
    });

    // If still under sampleSize, randomly sample from the remaining points
    if (sampledPoints.length < sampleSize) {
      const remainingPoints = points.filter(
        (point) => !sampledPoints.includes(point)
      );
      const additionalPoints = remainingPoints
        .sort(() => 0.5 - Math.random())
        .slice(0, sampleSize - sampledPoints.length);
      sampledPoints.push(...additionalPoints);
    }

    return sampledPoints;
  };

  useEffect(() => {
    if (data && plotContainerRef.current) {
      let pValueThreshold;
      let foldChangeThreshold;

      if (method === true) {
        pValueThreshold = -Math.log10(validatedThreshold);
        foldChangeThreshold = 0;
      } else if (method === false) {
        pValueThreshold = -Math.log10(validatedThreshold);
        foldChangeThreshold = validatedFoldChange;
      }

      const processedData = data.map((d) => {
        let pValue, log10PValue, isSignificant;

        switch (statMethod) {
          default:
            pValue = method === true ? d.padj : d.pvalue;
            log10PValue = -Math.log10(pValue);
            isSignificant =
              method === true
                ? pValue < validatedThreshold
                : pValue < validatedThreshold &&
                  Math.abs(d.log2FoldChange) > foldChangeThreshold;
            break;
        }

        return {
          ...d,
          "-log10(pvalue)": log10PValue,
          Category: isSignificant
            ? d.log2FoldChange > 0
              ? "Up Regulated"
              : "Down Regulated"
            : "Non-Significant",
        };
      });

      const significantGenes = processedData.filter(
        (d) => d.Category !== "Non-Significant"
      );
      const nonSignificantGenes = processedData.filter(
        (d) => d.Category === "Non-Significant"
      );

      const sampledNonSignificantGenes = sampleNonSignificantPoints(
        nonSignificantGenes,
        nonSignificantSampleSize
      );

      setSignificantCount(significantGenes.length);

      const categories = ["Non-Significant", "Up Regulated", "Down Regulated"];
      const colors = ["lightslategray", "blue", "red"];

      // Static layer for non-significant points
      const staticTraces = [
        {
          x: sampledNonSignificantGenes.map((d) => d.log2FoldChange),
          y: sampledNonSignificantGenes.map((d) => d["-log10(pvalue)"]),
          mode: "markers",
          marker: {
            color: "lightgray",
            size: 4.5,
            symbol: "circle",
            opacity: 1,
          },
          type: "scattergl",
          hoverinfo: "none",
          name: "Non-Significant",
        },
      ];

      // Dynamic layer for significant points
      const dynamicTraces = categories.map((category, index) => {
        const categoryData = [
          ...significantGenes.filter((d) => d.Category === category),
        ];

        return {
          x: categoryData.map((d) => d.log2FoldChange),
          y: categoryData.map((d) => d["-log10(pvalue)"]),
          mode:
            showTextTraces && category !== "Non-Significant"
              ? "markers+text"
              : "markers",
          marker: {
            color: colors[index],
            size: 4.5,
            symbol: "circle",
            opacity: 0.5,
          },
          type: "scattergl",
          text:
            showTextTraces && category !== "Non-Significant"
              ? categoryData.map((d) => d.gene_name)
              : [],
          textposition: "top center",
          customdata: categoryData.map((d) => [
            d.gene_name,
            d.gene_id,
            d.gene_biotype,
            d.gene_description,
          ]),
          hovertemplate:
            category === "Non-Significant"
              ? "gene_name=%{customdata[0]}<br>-log10(pvalue)=%{y}<br>log2FoldChange=%{x}<br>gene_id=%{customdata[1]}<extra></extra>"
              : "gene_name=%{customdata[0]}<br>-log10(pvalue)=%{y}<extra></extra>",
          name: category,
        };
      });

      const searchTrace = searchQuery
        ? processedData
            .filter(
              (d) => d.gene_name.toLowerCase() === searchQuery.toLowerCase()
            )
            .map((d) => ({
              x: [d.log2FoldChange],
              y: [d["-log10(pvalue)"]],
              mode: "markers",
              marker: {
                color: "rgb(17, 157, 255)",
                opacity: 1,
                size: 10,
                line: {
                  color: "rgb(231, 99, 250)",
                  width: 2.5,
                },
              },
              type: "scattergl",
              text: [d.gene_name],
              textposition: "top center",
              hoverinfo: "text",
              name: "Searched Gene",
            }))
        : [];

      // Highlighted gene trace (from search bar selection)
      // Creates a two-layer effect: background glow + foreground marker
      const highlightedGeneTrace = highlightedGene
        ? (() => {
            const geneData = processedData.find(
              (d) => d.geneName && d.geneName.toLowerCase() === highlightedGene.geneName.toLowerCase()
            );
            
            if (!geneData) return [];
            
            return [
              // Layer 2: Foreground star with label
              {
                x: [geneData.log2FoldChange],
                y: [geneData["-log10(pvalue)"]],
                mode: "markers+text",
                marker: {
                  color: "green",
                  opacity: 1,
                  size: 5,
                  line: {
                    color: "green",
                    width: 3,
                  },
                  symbol: "hexagon",
                },
                type: "scattergl",
                text: [geneData.geneName],
                textposition: "top center",
                textfont: {
                  size: 14,
                  color: "black",
                  family: "Arial Black, sans-serif",
                },
                hovertemplate: `<b>${geneData.geneName}</b><br>Log2FC: ${geneData.log2FoldChange?.toFixed(3)}<br>p-value: ${geneData.pvalue?.toExponential(2)}<br>padj: ${geneData.padj?.toExponential(2)}<extra></extra>`,
                showlegend: true,
                name: `Selected: ${geneData.geneName}`,
              },
            ];
          })()
        : [];

      const layout = {
        shapes: [
          {
            type: "line",
            x0: 0,
            x1: 1,
            y0: pValueThreshold,
            y1: pValueThreshold,
            xref: "paper",
            yref: "y",
            line: {
              color: "red",
              width: 1,
              dash: "dot",
            },
          },
          {
            type: "line",
            x0: foldChangeThreshold,
            x1: foldChangeThreshold,
            y0: 0,
            y1: 1,
            xref: "x",
            yref: "paper",
            line: {
              color: "blue",
              width: 1,
              dash: "dot",
            },
          },
          {
            type: "line",
            x0: -foldChangeThreshold,
            x1: -foldChangeThreshold,
            y0: 0,
            y1: 1,
            xref: "x",
            yref: "paper",
            line: {
              color: "blue",
              width: 1,
              dash: "dot",
            },
          },
        ],
        xaxis: {
          title: "Log2 Fold Change",
          showgrid: true,
          gridwidth: 0.5,
          gridcolor: "lightgrey",
          zeroline: true,
          zerolinecolor: "grey",
          zerolinewidth: 1,
        },
        yaxis: {
          title: "-Log10(pvalue)",
          showgrid: true,
          gridwidth: 0.5,
          gridcolor: "lightgrey",
        },
        plot_bgcolor: "white",
        autosize: true,
        margin: { l: 30, r: 0, t: 20, b: 30 },
        showlegend: true,
        modebar: {
          orientation: "v",
          activecolor: "gray",
        },
      };

      const config = {
        displayModeBar: true,
      };

      Plotly.purge(plotContainerRef.current);
      Plotly.newPlot(
        plotContainerRef.current,
        [...staticTraces, ...dynamicTraces, ...searchTrace, ...highlightedGeneTrace],
        layout,
        config
      );
    }

    const resizeObserver = new ResizeObserver(() => {
      if (plotContainerRef.current) {
        Plotly.relayout(plotContainerRef.current, {
          autosize: true,
        });
      }
    });

    if (plotContainerRef.current) {
      resizeObserver.observe(plotContainerRef.current);
    }

    return () => {
      if (plotContainerRef.current) {
        Plotly.purge(plotContainerRef.current);
        resizeObserver.unobserve(plotContainerRef.current);
      }
    };
  }, [
    validatedThreshold,
    method,
    data,
    showTextTraces,
    validatedFoldChange,
    statMethod,
    searchQuery,
    nonSignificantSampleSize,
    highlightedGene,
  ]);

  const validateAndSetThreshold = (value) => {
    const numericValue = parseFloat(value);
    if (numericValue > 0 && numericValue <= 0.05) {
      setValidatedThreshold(numericValue);
    }
  };

  const validateAndSetFoldChange = (value) => {
    const numericValue = parseFloat(value);
    if (numericValue >= 0 && numericValue <= 1) {
      setValidatedFoldChange(numericValue);
    }
  };

  const toggleTextTraces = () => {
    setShowTextTraces((prev) => !prev);
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSampleSizeChange = (event) => {
    setNonSignificantSampleSize(Number(event.target.value));
  };

  return (
    <>
      <div
        style={{
          textAlign: "center",
          alignItems: "center",
          justifyContent: "row",
        }}
      >
        <input
          style={{
            margin: "10px",
          }}
          type="number"
          step="0.001"
          min="0"
          max="0.05"
          placeholder="p-value"
          onChange={(e) => validateAndSetThreshold(e.target.value)}
          className="threshold-input-style"
        />

        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          placeholder="log2FC"
          onChange={(e) => validateAndSetFoldChange(e.target.value)}
          className="threshold-input-style"
        />
      </div>
      {/* <input
        type="text"
        placeholder="Search gene..."
        value={searchQuery}
        onChange={handleSearchInputChange}
      /> */}
      <button className="trace-button" onClick={toggleTextTraces}>
        {showTextTraces ? "Hide" : "Show"} Gene Names
      </button>
      <div>
        <h3 style={{ color: "black" }}>
          Significant Genes: {significantCount}
        </h3>
      </div>
      <div
        ref={plotContainerRef}
        style={{
          width: "100%",
          maxWidth: 1000,
          maxHeight: 600,
          marginTop: 10,
          marginBottom: 30,
          height: "100%",
        }}
      />
    </>
  );
};

export default VolcanoPlot;
