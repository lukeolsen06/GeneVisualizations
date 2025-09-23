import React, { useState, useEffect } from 'react';
import GeneSetSelector from './GeneSetSelector';
import StringNetworkRenderer from './StringNetworkRenderer';
import NetworkInfoPanel from './NetworkInfoPanel';
import GeneEnrichmentService from '../services/GeneEnrichmentService';
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
  // State for the analysis workflow
  const [selectedComparison, setSelectedComparison] = useState('-- choose --');
  const [filteredGenes, setFilteredGenes] = useState([]);
  const [enrichedGenes, setEnrichedGenes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for network visualization
  const [networkData, setNetworkData] = useState(null);
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

  // Enrich genes with STRING API data using the service
  const enrichGenesWithStringData = async (geneObjects) => {
    if (geneObjects.length === 0) return [];

    setIsLoading(true);
    setError(null);

    try {
      const enrichedGenes = await GeneEnrichmentService.enrichGenesWithStringData(geneObjects);
      
      // Get enrichment statistics
      const enrichmentStats = GeneEnrichmentService.getEnrichmentStats(geneObjects, enrichedGenes);
      
      // Update analysis stats
      setAnalysisStats(prev => ({
        ...prev,
        stringResolvedGenes: enrichmentStats.resolvedGenes,
        filteredGenes: geneObjects.length
      }));

      return enrichedGenes;

    } catch (error) {
      console.error('Error enriching genes with STRING data:', error);
      setError(`Failed to enrich genes with STRING data: ${error.message}`);
      return geneObjects; // Return original genes if enrichment fails
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filtered genes from GeneSetSelector
  const handleFilteredGenes = async (geneObjects) => {
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
    setNetworkData(network);
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

  return (
    <div className="string-analysis-section">
      {/* Header */}
      <div className="string-analysis-header">
        <h2>STRING Network Analysis</h2>
        <p>Analyze protein-protein interactions for differentially expressed genes</p>
      </div>

      {/* Gene Set Selection */}
      <GeneSetSelector
        selectedComparison={selectedComparison}
        onComparisonChange={handleComparisonChange}
        onFilteredGenes={handleFilteredGenes}
        onLoadingChange={handleLoadingChange}
        onError={handleError}
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
          selectedComparison={selectedComparison}
          onNetworkData={handleNetworkData}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onLoadingChange={handleLoadingChange}
          onError={handleError}
        />
      )}

      {/* Information Panel */}
      {(selectedNode || selectedEdge) && (
        <NetworkInfoPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onClose={clearSelections}
        />
      )}
    </div>
  );
};

export default StringAnalysisSection;
