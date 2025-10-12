import "./DEGListDatasets.css";
import React, { useState, useEffect } from "react";
import PlotlyJSPlot from "../../graphs/PlotlyJSPlot";
import "../../graphs/PlotlyGraph.css";
import Toggle from "../ToggleGraphComponent";
import DatasetService from "../../services/DatasetService";

import { chartDataMapping, plotDataMapping } from "./imports";

export default function DEGListDatasets({ currentDropdown, highlightedGene }) {
  const [selectedDropdown, setSelectedDropdown] = useState("-- choose --");
  const [dataFromChild, setDataFromChild] = useState("All Genes");
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [selectedPlotData, setSelectedPlotData] = useState(null);
  const [mainCategory, setMainCategory] = useState("DHS_DOHHvsWT_EC");
  const [subCategory, setSubCategory] = useState("KEGG");
  const [pValueThreshold, setpValThreshold] = useState("0.05");
  const [tempThreshold, setTempThreshold] = useState("0.05");
  const [graphModule, setGraphModule] = useState(null);

  const [method, setMethod] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [log2FoldThreshold, setLog2FoldThreshold] = useState("0");
  const [tempLog2Fold, setTempLog2Fold] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mainCategory =
      selectedDropdown !== "-- choose --" ? selectedDropdown : null;
    if (mainCategory) {
      const chartData = chartDataMapping[mainCategory]?.[subCategory];
      setSelectedChartData(chartData);
    } else {
      setSelectedChartData(null);
    }
    setSelectedDropdown(currentDropdown);
  }, [selectedDropdown, subCategory, currentDropdown]);

  useEffect(() => {
    const plotData = plotDataMapping[mainCategory]?.[subCategory];
    setSelectedPlotData(plotData); // Update selectedPlotData based on mainCategory and subCategory
  }, [selectedDropdown, subCategory, mainCategory, selectedPlotData]);

  //   const handleMainCategoryChange = (e) => {
  //     const value = e.target.value;
  //     setSelectedDropdown(value);
  //     setMainCategory(value);
  //   };

  useEffect(() => {
    if (method === false) {
      setDisableInput(false);
      setLog2FoldThreshold(0);
      setTempLog2Fold(0);
      setTempThreshold("0.05"); // Reset the temporary threshold input
      setpValThreshold("0.05"); // Reset the p-value threshold to default
    } else {
      setDisableInput(true);
      setLog2FoldThreshold(0);
      setTempLog2Fold(0);
      setTempThreshold("0.05"); // Reset the temporary threshold input
      setpValThreshold("0.05");
    }
  }, [method]);

  useEffect(() => {
    async function loadGraphData() {
      if (dataFromChild === "All Genes" && selectedDropdown !== "-- choose --") {
        setLoading(true);
        setError(null);
        
        try {
          // Fetch volcano plot data from the backend API
          // Using a limit of 10000 for comprehensive volcano plot visualization
          const data = await DatasetService.getVolcanoPlotData(selectedDropdown, 10000);
          setGraphModule(data);
        } catch (err) {
          console.error("Failed to load gene data:", err);
          setError(err.message || "Failed to load data from server");
          setGraphModule(null);
        } finally {
          setLoading(false);
        }
      }
    }
    loadGraphData();
  }, [dataFromChild, selectedDropdown]);

  return (
    <div className="DEG-container-expanded">
      {dataFromChild === "All Genes" && (
        <>
          <div className="DEG-box">
            {selectedChartData && (
              <>
                <div className="chart-container">
                  <div className="sub-chart-container">
                    <Toggle
                      toggleState={method}
                      onToggle={() => setMethod(!method)}
                    />
                  </div>
                </div>
                <p
                  style={{
                    color: "black",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  {selectedDropdown}
                </p>

                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100px",
                      color: "black",
                      fontSize: "30px",
                      textAlign: "center",
                    }}
                  >
                    Loading data from server...
                  </div>
                ) : error ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100px",
                      color: "red",
                      fontSize: "20px",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    Error: {error}
                  </div>
                ) : graphModule ? (
                  <>
                    <PlotlyJSPlot
                      data={graphModule}
                      threshold={pValueThreshold}
                      foldChange={log2FoldThreshold}
                      method={method}
                      highlightedGene={highlightedGene}
                    />
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100px",
                      color: "black",
                      fontSize: "30px",
                      textAlign: "center",
                    }}
                  >
                    Select a dataset to visualize
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
