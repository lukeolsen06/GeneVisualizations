import "./DEGListDatasets.css";
import React, { useState, useEffect } from "react";
// import PlotlyGraph from "../../graphs/PlotlyGraph";
import Dropdown from "../DropDown";
import MultiStateToggle from "../MultiStateToggle";
import "../../graphs/PlotlyGraph.css";
import ToggleCharts from "./ToggleCharts";
import DotPlot from "../../barCharts/testNetwork/DotPlot";
import Toggle from "../ToggleGraphComponent";
import Scatter from "./ScatterPlot";
import StringAnalysisSection from "../../stringComponents/StringAnalysisSection";
import GeneSearchBar from "../GeneSearchBar";

import {
  chartDataMapping,
  dropdownOptions,
  DEGdropdownLength,
  plotDataMapping,
} from "./imports";

export default function DEGListDatasets() {
  const [selectedDropdown, setSelectedDropdown] = useState("-- choose --");
  const [dataFromChild, setDataFromChild] = useState("All Genes");
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [selectedPlotData, setSelectedPlotData] = useState(null);
  const [mainCategory, setMainCategory] = useState("DHS_DOHHvsWT_EC");
  const [subCategory, setSubCategory] = useState("KEGG");
  const [pValueThreshold, setpValThreshold] = useState("0.05");
  const [tempThreshold, setTempThreshold] = useState("0.05");

  const [method, setMethod] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [log2FoldThreshold, setLog2FoldThreshold] = useState("0");
  const [tempLog2Fold, setTempLog2Fold] = useState("1");
  
  // State for selected gene from search (for highlighting on plot)
  const [selectedGene, setSelectedGene] = useState(null);

  const handleDataFromChild = (data) => {
    if (data !== "KEGG" && data !== "Reactome" && data !== "STRING") {
      setSubCategory("WikiPathways");
    } else {
      setSubCategory(data);
    }
    setDataFromChild(data);
    if (data === "All Genes") {
      setpValThreshold(0.05);
    } else {
      setSelectedDropdown("DHS_DOHHvsWT_EC");
    }
  };

  useEffect(() => {
    const mainCategory =
      selectedDropdown !== "-- choose --" ? selectedDropdown : null;
    if (mainCategory) {
      const chartData = chartDataMapping[mainCategory]?.[subCategory];
      setSelectedChartData(chartData);
    } else {
      setSelectedChartData(null);
    }
  }, [selectedDropdown, subCategory]);

  useEffect(() => {
    const plotData = plotDataMapping[mainCategory]?.[subCategory];
    setSelectedPlotData(plotData); // Update selectedPlotData based on mainCategory and subCategory
  }, [selectedDropdown, subCategory, mainCategory, selectedPlotData]);

  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedDropdown(value);
    setMainCategory(value);
    // Clear selected gene when changing datasets
    setSelectedGene(null);
  };
  
  /**
   * Handle gene selection from search bar
   * Stores the gene for highlighting on the volcano plot
   */
  const handleGeneSelect = (gene) => {
    console.log('Selected gene:', gene);
    setSelectedGene(gene);
  };

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

  return (
    <div className="DEG-container-expanded">
      <MultiStateToggle sendDataToParent={handleDataFromChild} />
      {dataFromChild === "All Genes" && (
        <>
          <div className="all-genes-container">
            <div className="view-pathway">
              <h3 style={{ margin: 30 }}>
                explore five in vivo mouse models and compare <br />
                gene expression values with and without eIF5A hypusination
              </h3>
            </div>
          </div>

          <div className="DEG-box">
            <div className="droptown-tooltip-container">
              <Dropdown
                className={DEGdropdownLength}
                selectedDropdown={selectedDropdown}
                onChange={handleMainCategoryChange}
                options={dropdownOptions}
              />
              <span className="tooltip">
                ?
                <span className="tooltip-text">
                  Enter a statistical threshold and toggle between DESeq2 and
                  edgeR to apply statistical methods based on experimental setup
                  criteria. DESeq2 uses an adjusted P-value threshold {"<"} 0.05
                  to control the False Discovery Rate {"(FDR)"}. edgeR employs a
                  corrected P-value threshold {"<"} 0.05 and fold change
                  criterion {"<"} 1 to identify genes that exhibit substantial
                  expression changes despite the absence of replicates.
                </span>
              </span>
            </div>

            {/* Gene Search Bar - only show when a dataset is selected */}
            {selectedDropdown !== "-- choose --" && (
              <div style={{ margin: "20px 0" }}>
                <GeneSearchBar 
                  comparison={selectedDropdown}
                  onGeneSelect={handleGeneSelect}
                  placeholder="Search for a gene (e.g., Prl, Brca1)..."
                  maxResults={10}
                />
              </div>
            )}

            {selectedChartData && (
              <>
                <Scatter 
                  currentDropdown={selectedDropdown}
                  highlightedGene={selectedGene}
                />
              </>
            )}
          </div>
        </>
      )}
      {dataFromChild === "KEGG" && (
        <>
          <div className="all-genes-container">
            <div className="view-pathway">
              <h3 style={{ margin: 30 }}>
                Explore regulatory interactions between eIF5A hypusination
                <br /> and pathways found in the KEGG database
              </h3>
            </div>
          </div>
          <ToggleCharts subCategory={subCategory} />
        </>
      )}
      {dataFromChild === "Wiki\nPathways" && (
        <>
          <div className="all-genes-container">
            <div className="view-pathway">
              <h3 style={{ margin: 30 }}>
                Explore regulatory interactions between eIF5A hypusination
                <br /> and pathways found in the WikiPathways database
              </h3>
            </div>
          </div>
          <ToggleCharts subCategory={subCategory} currentPlot={null} />
        </>
      )}
      {dataFromChild === "Reactome" && (
        <>
          <div className="all-genes-container">
            <div className="view-pathway">
              <h3 style={{ margin: 30 }}>
                Explore regulatory interactions between eIF5A hypusination
                <br /> and pathways found in the Reactome database
              </h3>
            </div>
          </div>
          <ToggleCharts subCategory={subCategory} currentPlot={null} />
          {/* {selectedPlotData ? <DotPlot plot={selectedPlotData} /> : <div></div>} */}
        </>
      )}
      {dataFromChild === "STRING" && (
        <>
          <div className="all-genes-container">
            <div className="view-pathway">
              <h3 style={{ margin: 30 }}>
                <br />
              </h3>
            </div>
          </div>
          <div style={{ 
            margin: "30px",
            height: "800px",
            width: "100%"
          }}>
            <StringAnalysisSection />
          </div>
        </>
      )}
    </div>
  );
}
