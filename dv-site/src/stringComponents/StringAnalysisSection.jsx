import React, { useState, useEffect, useCallback, useRef } from 'react';
import GeneSetSelector from './GeneSetSelector';
import StringNetworkRenderer from './StringNetworkRenderer';
import ThresholdInputControls from './ThresholdInputControls';
import EnhancedGeneEnrichmentService from '../services/EnhancedGeneEnrichmentService';
import './StringAnalysisSection.css';

/**
 * Main STRING Analysis Section Component
 * Orchestrates the complete STRING analysis workflow:
 * 1. Gene set selection and filtering
 * 2. STRING API integration
 * 3. Network visualization with expression overlay
 * 4. Interactive node/edge information display
 */
const StringAnalysisSection = () => {
  // Refs
  const geneSetSelectorRef = useRef(null);
  
  // State for the analysis workflow
  const [selectedComparison, setSelectedComparison] = useState('-- choose --');
  const [filteredGenes, setFilteredGenes] = useState([]);
  const [enrichedGenes, setEnrichedGenes] = useState([]);
  const [networkData, setNetworkData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for custom thresholds
  const [customThresholds, setCustomThresholds] = useState({
    log2fc: 1.0,
    padj: 0.1
  });
  
  
  // State for network visualization
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  
  // State for analysis results
  const [analysisStats, setAnalysisStats] = useState({
    totalGenes: 0,
    filteredGenes: 0,
    stringResolvedGenes: 0,
    networkNodes: 0,
    networkEdges: 0
  });

  // Handle comparison selection from GeneSetSelector
  const handleComparisonChange = (comparison) => {
    setSelectedComparison(comparison);
    setFilteredGenes([]);
    setEnrichedGenes([]);
    setNetworkData(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    setError(null);
  };

  // Enrich genes with STRING API data using the enhanced service
  const enrichGenesWithStringData = useCallback(async (geneObjects) => {
    if (geneObjects.length === 0) return [];

    setIsLoading(true);
    setError(null);

    try {
      // Use the enhanced service which includes network creation
      const enrichmentResult = await EnhancedGeneEnrichmentService.enrichGenesWithStringData(
        geneObjects,
        selectedComparison,
        { confidenceThreshold: 400, networkType: 'full' }
      );
      
      // Store network data for the renderer
      setNetworkData(enrichmentResult.rawNetworkData);
      
      // Update analysis stats with comprehensive data
      setAnalysisStats(prev => ({
        ...prev,
        stringResolvedGenes: enrichmentResult.stats.resolvedGenes,
        networkNodes: enrichmentResult.stats.networkNodes,
        networkEdges: enrichmentResult.stats.networkEdges,
        filteredGenes: geneObjects.length
      }));

      // Return enriched genes (network data is handled separately)
      return enrichmentResult.enrichedGenes;

    } catch (error) {
      console.error('Error enriching genes with STRING data:', error);
      setError(`Failed to enrich genes with STRING data: ${error.message}`);
      return geneObjects; // Return original genes if enrichment fails
    } finally {
      setIsLoading(false);
    }
  }, [selectedComparison]);

  // Handle filtered genes from GeneSetSelector
  const handleFilteredGenes = async (geneObjects) => {
    // Ignore calls when comparison is "-- choose --" (this prevents re-enrichment after clear)
    if (selectedComparison === '-- choose --') {
      return;
    }
    
    setFilteredGenes(geneObjects);
    setNetworkData(null);
    setSelectedNode(null);
    setSelectedEdge(null);

    // Enrich genes with STRING data
    const enriched = await enrichGenesWithStringData(geneObjects);
    setEnrichedGenes(enriched);
  };

  // Handle network data from StringNetworkRenderer
  const handleNetworkData = (network, stats) => {
    // Don't overwrite networkData with Cytoscape instance - we already have raw data
    setAnalysisStats(prev => ({
      ...prev,
      ...stats
    }));
  };

  // Handle node selection
  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
    setSelectedEdge(null);
  };

  // Handle edge selection
  const handleEdgeClick = (edgeData) => {
    setSelectedEdge(edgeData);
    setSelectedNode(null);
  };

  // Handle loading state changes
  const handleLoadingChange = (loading) => {
    setIsLoading(loading);
  };

  // Handle error state
  const handleError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  // Clear selections
  const clearSelections = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Handle threshold changes - use useCallback to prevent infinite re-renders
  const handleThresholdsChange = useCallback((thresholds) => {
    setCustomThresholds(thresholds);
  }, []);

  // Handle threshold application - trigger re-filtering in GeneSetSelector
  const handleApplyThresholds = useCallback((thresholds) => {
    if (selectedComparison === '-- choose --') {
      return;
    }
    
    // Clear current network state
    setNetworkData(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    
    // Trigger re-filtering in GeneSetSelector
    if (geneSetSelectorRef.current) {
      geneSetSelectorRef.current.reFilterGenes();
    }
  }, [selectedComparison]);

  // Handle clear network - reset everything to initial state
  const handleClearNetwork = useCallback(() => {
    // Reset all state
    setSelectedComparison('-- choose --');
    setCustomThresholds({
      log2fc: 1.0,
      padj: 0.1
    });
    setFilteredGenes([]);
    setEnrichedGenes([]);
    setNetworkData(null);
    setSelectedNode(null);
    setSelectedEdge(null);
    setError(null);
    setAnalysisStats({
      totalGenes: 0,
      filteredGenes: 0,
      stringResolvedGenes: 0,
      networkNodes: 0,
      networkEdges: 0
    });
  }, []);

  return (
    <div className="string-analysis-section">
      {/* Header */}
      <div className="string-analysis-header">
        <h2>STRING Network Analysis</h2>
        <p>Analyze protein-protein interactions for differentially expressed genes</p>
      </div>

      {/* Threshold Input Controls */}
      <ThresholdInputControls
        onThresholdsChange={handleThresholdsChange}
        onApplyThresholds={handleApplyThresholds}
        onClearNetwork={handleClearNetwork}
        initialLog2FC={customThresholds.log2fc}
        initialPadj={customThresholds.padj}
      />

      {/* Gene Set Selection */}
      <GeneSetSelector
        ref={geneSetSelectorRef}
        selectedComparison={selectedComparison}
        onComparisonChange={handleComparisonChange}
        onFilteredGenes={handleFilteredGenes}
        onLoadingChange={handleLoadingChange}
        onError={handleError}
        customThresholds={customThresholds}
      />

      {/* Analysis Statistics */}
      {analysisStats.totalGenes > 0 && (
        <div className="analysis-stats">
          <h3>Analysis Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Genes:</span>
              <span className="stat-value">{analysisStats.totalGenes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Filtered DEGs:</span>
              <span className="stat-value">{analysisStats.filteredGenes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">STRING Resolved:</span>
              <span className="stat-value">{analysisStats.stringResolvedGenes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Network Nodes:</span>
              <span className="stat-value">{analysisStats.networkNodes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Network Edges:</span>
              <span className="stat-value">{analysisStats.networkEdges}</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading network data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <h4>Analysis Error</h4>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Network Visualization */}
      {enrichedGenes.length > 0 && (
        <StringNetworkRenderer
          geneObjects={enrichedGenes}
          networkData={networkData}
          selectedComparison={selectedComparison}
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onNetworkData={handleNetworkData}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onClearSelection={clearSelections}
          onLoadingChange={handleLoadingChange}
          onError={handleError}
        />
      )}
      
    </div>
  );
};

export default StringAnalysisSection;
