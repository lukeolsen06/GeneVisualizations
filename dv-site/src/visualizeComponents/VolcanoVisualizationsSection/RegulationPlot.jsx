import "./DEGListDatasets.css";
import React, { useState, useEffect } from "react";
import PlotlyJSPlot from "../../graphs/PlotlyJSploWLabels";
import "../../graphs/PlotlyGraph.css";
import Toggle from "../ToggleGraphComponent";

import { chartDataMapping, plotDataMapping } from "./imports";

export default function DEGListDatasets({ currentDropdown, labels }) {
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
      if (dataFromChild === "All Genes" && selectedDropdown != "-- choose --") {
        let module;
        switch (selectedDropdown) {
          case "DHS_DOHHvsWT_EC":
            module = await import(
              "../../graphs/DHS_DOHHvsWT_EC/DHS_DOHHvsWT_EC.DEG.all.json"
            );

            break;
          case "DHS_DOHHvsTar4_EC":
            module = await import(
              "../../graphs/DHS_DOHHvsTar4_EC/DHS_DOHHvsTar4_EC.DEG.all.json"
            );
            break;
          case "eIF5A_DDvsDHS_DOHH":
            module = await import(
              "../../graphs/eIF5A_DDvsDHS_DOHH/eIF5A_DDvsDHS_DOHH.DEG.all.json"
            );
            break;

          case "eIF5A_DDvseIF5A":
            module = await import(
              "../../graphs/eIF5A_DDvseIF5A/eIF5A_DDvseIF5A.DEG.all.json"
            );
            break;
          case "eIF5A_DDvsK50A_DD":
            module = await import(
              "../../graphs/eIF5A_DDvsK50A_DD/eIF5A_DDvsK50A_DD.DEG.all.json"
            );
            break;
          case "eIF5A_DDvsTar4_EC":
            module = await import(
              "../../graphs/eIF5A_DDvsTar4_EC/eIF5A_DDvsTar4_EC.DEG.all.json"
            );
            break;
          case "eIF5A_DDvsWT_EC":
            module = await import(
              "../../graphs/eIF5A_DDvsWT_EC/eIF5A_DDvsWT_EC.DEG.all.json"
            );
            break;
          case "eIF5AvsTar4_EC":
            module = await import(
              "../../graphs/eIF5AvsTar4_EC/eIF5AvsTar4_EC.DEG.all.json"
            );
            break;
          case "eIF5AvsWT_EC":
            module = await import(
              "../../graphs/eIF5AvsWT_EC/eIF5AvsWT_EC.DEG.all.json"
            );
            break;
          case "K50A_DDvsDHS_DOHH":
            module = await import(
              "../../graphs/K50A_DDvsDHS_DOHH/K50A_DDvsDHS_DOHH.DEG.all.json"
            );
            break;
          case "K50A_DDvsTar4_EC":
            module = await import(
              "../../graphs/K50A_DDvsTar4_EC/K50A_DDvsTar4_EC.DEG.all.json"
            );
            break;
          case "K50A_DDvsWT_EC":
            module = await import(
              "../../graphs/K50A_DDvsWT_EC/K50A_DDvsWT_EC.DEG.all.json"
            );
            break;
          case "Tar4_ECvsWT_EC":
            module = await import(
              "../../graphs/Tar4_ECvsWT_EC/Tar4_ECvsWT_EC.DEG.all.json"
            );
            break;
          default:
            module = null;
        }

        setGraphModule(module.default);
      }
    }
    loadGraphData();
  }, [dataFromChild, selectedDropdown, graphModule]);

  return (
    <div>
      {dataFromChild === "All Genes" && (
        <>
          <div
            style={{
              minWidth: "450px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {selectedChartData && (
              <>
                {/* <div className="chart-container">
                  <div className="sub-chart-container">
                    <Toggle
                      toggleState={method}
                      onToggle={() => setMethod(!method)}
                    />
                  </div>
                </div> */}
                {/* <p
                  style={{
                    color: "black",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  {selectedDropdown}
                </p> */}

                {graphModule ? (
                  <>
                    <PlotlyJSPlot
                      data={graphModule}
                      threshold={pValueThreshold}
                      foldChange={log2FoldThreshold}
                      method={method}
                      labels={labels}
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
                    Loading...
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
