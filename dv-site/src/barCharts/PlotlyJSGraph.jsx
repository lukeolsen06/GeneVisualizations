import React, { useEffect, useRef, useState } from "react";
import Plotly from "plotly.js-dist-min";
import "./PlotlyJS.css";

const PlotlyBarChart = ({ chart, handleChartClick }) => {
  const plotContainerRef = useRef(null);
  const [category, setCategory] = useState("all");
  const [hasDirection, setHasDirection] = useState(false);
  const numTerms = 200;
  useEffect(() => {
    const normalizeData = (data) => {
      return data.map((item) => {
        // Handle both old JSON format (with spaces) and new API format (camelCase)
        const enrichmentScore = item["enrichment score"] !== undefined ? item["enrichment score"] : item.enrichmentScore;
        
        if (enrichmentScore !== undefined) {
          return {
            termId: item["#term ID"] || item.termId,
            termDescription: item["term description"] || item.termDescription,
            genesMapped: item["genes mapped"] || item.genesMapped,
            enrichmentScore: enrichmentScore,
            direction: item.direction,
            falseDiscoveryRate: item["false discovery rate"] || item.falseDiscoveryRate,
            method: item.method,
            matchingProteinsIds: item["matching proteins in your input (IDs)"] || item.matchingProteinIds,
            matchingProteinsLabels: item["matching proteins in your input (labels)"] || item.matchingProteinLabels,
          };
        } else {
          // Fallback for items without enrichment score
          return {
            termId: item["#term ID"] || item.termId,
            termDescription: item["term description"] || item.termDescription,
            genesMapped: item["observed gene count"] || item.genesMapped,
            enrichmentScore: item["strength"] || item.enrichmentScore,
            direction: "all",
            falseDiscoveryRate: item["false discovery rate"] || item.falseDiscoveryRate,
            method: "default",
            matchingProteinsIds: item["matching proteins in your network (IDs)"] || item.matchingProteinIds,
            matchingProteinsLabels: item["matching proteins in your network (labels)"] || item.matchingProteinLabels,
          };
        }
      });
    };

    const checkForDirection = (data) => {
      return data.some((item) => item.direction !== undefined);
    };

    const createBarChart = (data, category) => {
      let normalizedData = normalizeData(data);

      let filteredData = normalizedData;
      if (category !== "all") {
        filteredData = normalizedData.filter(
          (item) => item.direction === category
        );
      }

      filteredData.sort(
        (a, b) =>
          parseFloat(b["enrichmentScore"]) - parseFloat(a["enrichmentScore"])
      );

      const topTerms = filteredData.slice(0, numTerms);

      const enrichmentScores = new Map();
      
      topTerms.forEach((item, index) => {
        // Defensive check for enrichmentScore
        if (!item || typeof item["enrichmentScore"] !== 'number' || isNaN(item["enrichmentScore"])) {
          console.warn('Skipping item with invalid enrichmentScore:', item);
          return;
        }
        
        const score = item["enrichmentScore"].toFixed(2);
        if (!enrichmentScores.has(score)) {
          enrichmentScores.set(score, []);
        }
        enrichmentScores.get(score).push(item);
      });

      const yLabels = [];
      const xValues = [];
      const hoverText = [];
      const customData = [];

      enrichmentScores.forEach((items, score) => {
        items.forEach((item, index) => {
          const longDescription = item["termDescription"];
          const baseDescription = shortenDescription(item["termDescription"]);
          const uniqueDescriptor = `${baseDescription} (${score})`;
          yLabels.push(`${uniqueDescriptor}${index > 0 ? " " + index : ""}`);
          xValues.push(parseFloat(score));
          hoverText.push(
            `${item["termDescription"]}<br>Enrichment Score: ${score}<extra></extra>`
          );
          customData.push(item);
        });
      });

      // Check if there are 6 or fewer bars
      const barWidth = yLabels.length <= 8 ? 0.8 : null; // Set width to 0.4 if 6 or fewer bars, else use default
      const barGap = yLabels.length <= 6 ? 0.1 : 0.2; // Reduce bargap if 6 or fewer bars, else keep default
      const yDomain = yLabels.length <= 8 ? [0.5, 1] : [0, 1]; // Position bars in the upper half if 6 or fewer bars

      const trace = {
        y: yLabels,
        x: xValues,
        customdata: customData,
        hovertemplate: hoverText,
        type: "bar",
        orientation: "h",
        marker: {
          color: "darkblue",
          opacity: 0.75,
        },
        width: barWidth, // Apply conditional bar width
      };

      const layout = {
        title: `Regulations (${category})`,
        autosize: true,
        margin: {
          t: 25,
          l: 210,
          b: 100,
          r: 100,
        },
        plot_bgcolor: "white",
        xaxis: {
          title: {
            text: "log2foldchange",
          },
          showgrid: true,
          gridwidth: 1,
          gridcolor: "lightgrey",
          griddash: "dot",
          ticks: "outside",
          tickwidth: 2,
          tickcolor: "black",
        },
        yaxis: {
          title: {
            text: "Enrichment Score",
          },
          autorange: "reversed",
          showgrid: true,
          gridwidth: 1,
          gridcolor: "lightgrey",
          griddash: "dot",
          ticks: "outside",
          tickwidth: 2,
          tickcolor: "black",
          domain: yDomain, // Apply conditional y-axis domain
        },
        bargap: barGap, // Apply conditional bargap
        modebar: {
          orientation: "v",
          activecolor: "gray",
        },
      };

      const config = {
        displayModeBar: true,
      };

      Plotly.newPlot(plotContainerRef.current, [trace], layout, config, {
        responsive: true,
      });
      plotContainerRef.current.on("plotly_click", handleChartClick);
    };

    setHasDirection(checkForDirection(chart));
    createBarChart(chart, category);

    const resizeObserver = new ResizeObserver(() => {
      Plotly.relayout(plotContainerRef.current, {
        autosize: true,
      });
    });

    if (plotContainerRef.current) {
      resizeObserver.observe(plotContainerRef.current);
    }

    return () => {
      if (plotContainerRef.current) {
        resizeObserver.unobserve(plotContainerRef.current);
      }
    };
  }, [numTerms, chart, category]);

  const shortenDescription = (description) => {
    const maxLength = 20;
    if (description.length > maxLength) {
      return description.substring(0, maxLength - 3) + "...";
    } else {
      return description;
    }
  };

  return (
    <>
      {hasDirection && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",

            marginBottom: 20,
          }}
        >
          {/* <div style={{ display: "flex", flexDirection: "column" }}>
            <p
              style={{
                color: "black",
                fontSize: "20px",
                textAlign: "center",
                justifyContent: "center",
                paddingTop: "5px",
              }}
            >
              Filter by direction
            </p>
          </div> */}
          <button
            style={{
              padding: "0px",
              height: "30px",
              width: "80px",
              margin: "2px",
              marginTop: "10px",
            }}
            className="general-button"
            onClick={() => setCategory("all")}
          >
            All
          </button>
          <button
            style={{
              padding: "0px",
              height: "30px",
              width: "80px",
              margin: "2px",
              marginTop: "10px",
            }}
            className="general-button"
            onClick={() => setCategory("top")}
          >
            Top
          </button>
          <button
            style={{
              padding: "0px",
              height: "30px",
              width: "80px",
              margin: "2px",
              marginTop: "10px",
            }}
            className="general-button"
            onClick={() => setCategory("bottom")}
          >
            Bottom
          </button>
          <button
            style={{
              padding: "0px",
              height: "30px",
              width: "80px",
              margin: "2px",
              marginTop: "10px",
            }}
            className="general-button"
            onClick={() => setCategory("both ends")}
          >
            Both Ends
          </button>

          <span className="tooltip">
            ?
            <span className="tooltip-text">
              Filter pathways by direction, "Top" indicates a pathway's
              association with upregulated genes. "Bottom" indicates a pathway's
              association with downregulated genes. "Both Ends" indicates a
              pathway's potential involvement in both upregulated and
              downregulated processes.
            </span>
          </span>
        </div>
      )}
      <div
        ref={plotContainerRef}
        style={{
          width: "60vw",
          minWidth: "500px",
          maxWidth: 1500,
          minHeight: 900,
          marginTop: 60,
          height: "100%",
        }}
      ></div>
    </>
  );
};

export default PlotlyBarChart;
