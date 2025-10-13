import React, { useState, useEffect, useCallback } from "react";
import "./DEGListDatasets.css";
import Dropdown from "../DropDown";
import PlotlyBarChart from "../../barCharts/PlotlyJSGraph";
// import { AnimatePresence } from "framer-motion";
import RegulationInfo from "./RegulationInfo";
import Plot from "./RegulationPlot";
import EnrichmentService from "../../services/EnrichmentService";
import {
  dropdownOptions,
  DEGdropdownLength,
  termsLength,
} from "./imports";

export default function ToggleCharts({ subCategory, currentPlot }) {
  const [selectedDropdown, setSelectedDropdown] = useState("-- choose --");
  const [numTerms, setNumTerms] = useState(0);
  const [selectedChartData, setSelectedChartData] = useState(null);
  const [mainCategory, setMainCategory] = useState(currentPlot);
  const [showGeneInfo, setShowGeneInfo] = useState(false);
  const [barChartData, setBarChartData] = useState(null);
  const [showDropdowns, setShowDropdowns] = useState(true);
  const [dataLength, setDataLength] = useState(0); // State to hold the length of data
  
  // New states for API integration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to load enrichment data from API
  const loadEnrichmentData = useCallback(async (comparison, database) => {
    if (!comparison || !database || comparison === "-- choose --") {
      setSelectedChartData(null);
      setDataLength(0);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await EnrichmentService.getEnrichmentData(comparison, database, {
        fdr_threshold: 0.05,
        limit: 50
      });
      
      // Filter out any items with undefined enrichment scores
      const validData = data ? data.filter(item => 
        item && 
        typeof item.enrichmentScore === 'number' && 
        !isNaN(item.enrichmentScore)
      ) : [];
      
      console.log(`Loaded ${validData.length} enrichment terms for ${comparison} - ${database}`);
      setSelectedChartData(validData);
      setDataLength(validData.length);
    } catch (err) {
      console.error("Failed to load enrichment data:", err);
      setError(err.message || "Failed to load data from server");
      setSelectedChartData(null);
      setDataLength(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subCategory === "AllGenes") {
      setShowDropdowns(false);
      setMainCategory(currentPlot);
      setSelectedChartData(null); // No enrichment data for "All Genes"
      setDataLength(0);
    } else {
      setShowDropdowns(true);
      const mainCat = selectedDropdown !== "-- choose --" ? selectedDropdown : currentPlot;
      setMainCategory(mainCat);
      
      // Load data from API instead of static imports
      loadEnrichmentData(mainCat, subCategory);
    }
  }, [selectedDropdown, subCategory, currentPlot, loadEnrichmentData]);

  const handleMainCategoryChange = (e) => {
    setSelectedDropdown(e.target.value);
  };

  const handleCloseClick = () => {
    setShowGeneInfo(false);
  };
  const handleChartClick = (eventData) => {
    const clickedPoint = eventData.points[0];
    const {
      termId,
      termDescription,
      genesMapped,
      enrichmentScore,
      direction,
      falseDiscoveryRate,
      method,
      matchingProteinsIds,
      matchingProteinsLabels,
    } = clickedPoint.customdata;

    console.log("Term ID:", termId);
    console.log("Term Description:", termDescription);
    console.log("Genes Mapped:", genesMapped);
    console.log("Enrichment Score:", enrichmentScore);
    console.log("Direction:", direction);
    console.log("False Discovery Rate:", falseDiscoveryRate);
    console.log("Method:", method);
    console.log("Matching Proteins IDs:", matchingProteinsIds);
    console.log("Matching Proteins Labels:", matchingProteinsLabels);

    setBarChartData({
      termId,
      termDescription,
      genesMapped,
      enrichmentScore,
      direction,
      falseDiscoveryRate,
      method,
      matchingProteinsIds,
      matchingProteinsLabels,
    });
    setShowGeneInfo(true);
  };
  console.log(barChartData);

  // const handleChartClick = (eventData) => {
  //   const clickedPoint = eventData.points[0];
  //   console.log(clickedPoint);
  //   setBarChartData({
  //     barLabel: clickedPoint.label,
  //     xVal: clickedPoint.x,
  //     yVal: clickedPoint.y,
  //     enrichmentScore: clickedPoint.x,
  //   });
  //   setShowGeneInfo(true);
  // };

  // const renderDropdownOptions = () => {
  //   if (dataLength < 50) {
  //     const options = [{ label: "-- choose --", value: "-- choose --" }];
  //     if (dataLength >= 10) options.push({ label: "10", value: 10 });
  //     if (dataLength >= 20) options.push({ label: "20", value: 20 });
  //     if (dataLength >= 50) options.push({ label: "50", value: 50 });
  //     options.push({ label: dataLength, value: dataLength });
  //     return options;
  //   } else {
  //     return [
  //       { label: "-- choose --", value: "-- choose --" },
  //       { label: "10", value: 10 },
  //       { label: "20", value: 20 },
  //       { label: "50", value: 50 },
  //     ];
  //   }
  // };

  return (
    <>
      {showDropdowns && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Dropdown
            className={DEGdropdownLength}
            selectedDropdown={selectedDropdown}
            onChange={handleMainCategoryChange}
            options={dropdownOptions}
          />
          <span className="tooltip">
            ?
            <span className="tooltip-text">
              Select a pairwise comparison. Then select the top number pathways
              in groups of 10, 20, or 50. If the dataset has fewer than 50
              pathways then all data will be displayed. Click a specific pathway
              for additional information
            </span>
          </span>
        </div>
      )}
      {/* <Dropdown
        className={termsLength}
        selectedDropdown={numTerms.toString()}
        onChange={(e) => setNumTerms(parseInt(e.target.value))}
        options={renderDropdownOptions()}
      /> */}
      <div className="more-testing">
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <div>Loading enrichment data from server...</div>
            </div>
          )}
          
          {error && (
            <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
              <div>Error: {error}</div>
            </div>
          )}
          
          {!loading && !error && selectedChartData && selectedChartData.length > 0 && (
            <>
              <PlotlyBarChart
                chart={selectedChartData}
                numTerms={numTerms}
                mainCategory={mainCategory}
                subCategory={subCategory}
                handleChartClick={handleChartClick}
              />
            </>
          )}
          
          {!loading && !error && !selectedChartData && selectedDropdown !== "-- choose --" && subCategory !== "AllGenes" && (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <div>No enrichment data found for {mainCategory} - {subCategory}</div>
            </div>
          )}
        </div>
        {showGeneInfo && (
          // <AnimatePresence>
          <RegulationInfo
            barChartData={barChartData}
            onClose={handleCloseClick}
            selectedDropdown={selectedDropdown}
          />
          // </AnimatePresence>
        )}
      </div>
    </>
  );
}
