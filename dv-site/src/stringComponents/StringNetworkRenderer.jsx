import React, { useRef, useEffect, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import StringApiService from '../services/StringApiService';
import { convertToCytoscapeFormat, calculateNormalizedDegreeCentrality } from '../services/StringDataUtils';
import NetworkInfoPanel from './NetworkInfoPanel';
import './StringNetworkRenderer.css';

// Register the fcose layout
cytoscape.use(fcose);

/**
 * StringNetworkRenderer Component
 * Renders interactive protein-protein interaction networks using Cytoscape.js
 * 
 * Features:
 * - Fetches network data from STRING API
 * - Displays nodes colored by expression (up/down regulated)
 * - Shows edges with thickness based on confidence scores
 * - Provides click interactions for nodes and edges
 * - Uses fcose layout for optimal network visualization
 */
const StringNetworkRenderer = ({
  geneObjects,           // Enriched gene objects from parent
  selectedComparison,    // Current comparison name
  selectedNode,          // Currently selected node data
  selectedEdge,          // Currently selected edge data
  onNetworkData,        // Callback: (network, stats) => void
  onNodeClick,          // Callback: (nodeData) => void
  onEdgeClick,          // Callback: (edgeData) => void
  onClearSelection,     // Callback: () => void - clear selected node/edge
  onLoadingChange,      // Callback: (loading) => void
  onError              // Callback: (errorMessage) => void
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkStats, setNetworkStats] = useState({
    nodes: 0,
    edges: 0
  });
  const [centralityData, setCentralityData] = useState(null);

  // Main effect: Fetch network data and render when geneObjects change
  useEffect(() => {
    if (geneObjects.length > 0) {
      fetchAndRenderNetwork();
    } else {
      // Clear existing network
      clearNetwork();
    }
  }, [geneObjects, selectedComparison]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearNetwork();
    };
  }, []);

  /**
   * Clear the current network instance
   */
  const clearNetwork = () => {
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }
    setNetworkStats({ nodes: 0, edges: 0 });
    setCentralityData(null);
  };

  /**
   * Fetch network data from STRING API and render
   */
  const fetchAndRenderNetwork = async () => {
    setIsLoading(true);
    onLoadingChange(true);
    setError(null);

    try {
      // Step 1: Extract STRING IDs from enriched genes
      const stringIds = geneObjects
        .filter(gene => gene.stringId) // Only genes with valid STRING IDs
        .map(gene => gene.stringId);


      if (stringIds.length === 0) {
        throw new Error('No valid STRING IDs found in gene set. The genes may not be present in the STRING database.');
      }

      if (stringIds.length < 2) {
        throw new Error(`Only ${stringIds.length} gene(s) found in STRING database. At least 2 genes are needed to build a network.`);
      }

      console.log(`Fetching network for ${stringIds.length} genes from ${selectedComparison}`);

      // Step 2: Call STRING API to get network data
      const networkData = await StringApiService.getNetwork(stringIds, {
        confidenceThreshold: 400, // Medium confidence
        networkType: 'full'       // Full network including physical and functional interactions
      });

      if (!networkData || networkData.length === 0) {
        throw new Error('No network data found for the selected gene set');
      }

      console.log(`Retrieved ${networkData.length} interactions`);

      // Step 3: Convert to Cytoscape format
      const cytoscapeData = convertToCytoscapeFormat(networkData, geneObjects);

      // Step 4: Initialize or update Cytoscape instance
      await initializeCytoscape(cytoscapeData);

      // Step 5: Update local stats and notify parent
      const stats = {
        networkNodes: cytoscapeData.nodes.length,
        networkEdges: cytoscapeData.edges.length,
        totalGenes: geneObjects.length,
        stringResolvedGenes: stringIds.length
      };

      setNetworkStats({
        nodes: cytoscapeData.nodes.length,
        edges: cytoscapeData.edges.length
      });

      onNetworkData(cyRef.current, stats);

    } catch (error) {
      console.error('Error fetching network data:', error);
      const errorMessage = `Failed to load network: ${error.message}`;
      setError(errorMessage);
      onError(errorMessage);
      
      // Graceful fallback: still notify parent with empty stats
      onNetworkData(null, {
        networkNodes: 0,
        networkEdges: 0,
        totalGenes: geneObjects.length,
        stringResolvedGenes: 0
      });
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  /**
   * Initialize Cytoscape instance with data
   */
  const initializeCytoscape = async (cytoscapeData) => {
    // Destroy existing instance if it exists
    clearNetwork();

    // Initialize Cytoscape instance
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: cytoscapeData,
      style: getCytoscapeStyles(),
      layout: getLayoutConfig(),
      minZoom: 0.1,
      maxZoom: 3,
      wheelSensitivity: 0.1,
      boxSelectionEnabled: false, // Disable box selection for cleaner UX
      autoungrabify: false,
      userPanningEnabled: true,
      userZoomingEnabled: true
    });

    // Set up event handlers
    setupEventHandlers();

    // Run layout
    await runLayout();
  };

  /**
   * Run the layout algorithm
   */
  const runLayout = async () => {
    return new Promise((resolve) => {
      const layout = cyRef.current.layout(getLayoutConfig());
      
      layout.on('layoutstop', () => {
        // Calculate degree centrality after layout is complete
        calculateAndStoreCentrality();
        resolve();
      });
      
      layout.run();
    });
  };

  /**
   * Calculate and store degree centrality data
   */
  const calculateAndStoreCentrality = () => {
    if (cyRef.current) {
      try {
        const centralityResults = calculateNormalizedDegreeCentrality(cyRef.current);
        
        // Create a lookup map for quick access by node ID
        const centralityLookup = new Map();
        centralityResults.forEach(result => {
          centralityLookup.set(result.id, result.normalizedDegreeCentrality);
          centralityLookup.set(result.id + '_degree', result.degree);
        });
        
        setCentralityData(centralityLookup);
        console.log('Degree centrality calculated for', centralityResults.length, 'nodes');
      } catch (error) {
        console.error('Error calculating degree centrality:', error);
        setCentralityData(null);
      }
    }
  };

  /**
   * Get Cytoscape layout configuration
   */
  const getLayoutConfig = () => {
    return {
      name: 'fcose',
      options: {
        quality: 'default',
        randomize: false,
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 30,
        nodeRepulsion: 4000,
        idealEdgeLength: 100,
        edgeElasticity: 0.45,
        nestingFactor: 0.1,
        gravity: 0.25,
        numIter: 2500,
        tile: true,
        tilingPaddingVertical: 10,
        tilingPaddingHorizontal: 10,
        gravityRangeCompound: 1.5,
        gravityCompound: 1.0,
        gravityRange: 3.8,
        initialEnergyOnIncremental: 0.3
      }
    };
  };

  /**
   * Get Cytoscape styling configuration
   */
  const getCytoscapeStyles = () => {
    return [
      {
        selector: 'node',
        style: {
          'shape': 'ellipse',
          'background-color': (node) => {
            const expression = node.data('expression');
            if (expression === 'upregulated') return '#87CEFA'; // Red
            if (expression === 'downregulated') return '#FFE4E1'; // Blue
            return '#888888'; // Gray for no expression data
          },
          'background-opacity': 0.9,
          'background-gradient-direction': 'to-bottom-right',
          'background-gradient-stop-colors': (node) => {
            const expression = node.data('expression');
            if (expression === 'upregulated') {
              return '#E6F7FF #87CEFA #2E86AB'; // Very light to very dark blue
            }
            if (expression === 'downregulated') {
              return '#FFF0F5 #FFE4E1 #D63384'; // Very light to very dark pink
            }
            return '#F5F5F5 #888888 #444444'; // Very light to very dark gray
          },
          'background-gradient-stop-positions': '0% 50% 100%',
          'background-gradient-stop-opacity': 1.0,
          'width': '30px',
          'height': '30px',
          'label': 'data(id)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '5px',
          'font-weight': 'bold',
          'color': '#ffffff',
          'text-outline-width': 1,
          'text-outline-opacity': 0.5,
          'text-outline-color': '#000000',
          'border-width': 2,
          'border-color': '#FFFFFF',
          'border-opacity': 0.9,
          'shadow-opacity': 0.5,
          'shadow-blur': 8,
          'shadow-offset-x': 3,
          'shadow-offset-y': 3,
          'shadow-color': '#000000'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': (edge) => Math.max(1, edge.data('score') / 100),
          'opacity': (edge) => Math.max(0.3, edge.data('score') / 1000),
          'line-color': (edge) => {
            const score = edge.data('score');
            if (score >= 0.7) return '#00ff0080';
            if (score >= 0.4) return '#ffff0080';
            return '#ff000080';
          },
          'target-arrow-color': '#999999',
          'curve-style': 'bezier'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': 4,
          'border-color': (node) => {
            const expression = node.data('expression');
            if (expression === 'upregulated') return '#00ff00'; // Green for upregulated
            if (expression === 'downregulated') return '#ff0000'; // Red for downregulated
            return '#888888'; // Gray for no expression data
          }
        }
      }
    ];
  };

  /**
   * Set up interactive event handlers
   */
  const setupEventHandlers = () => {
    // Node click handler
    cyRef.current.on('tap', 'node', (event) => {
      const node = event.target;
      const nodeData = node.data();
      
      
      // Deselect other nodes
      cyRef.current.nodes().unselect();
      node.select();
      
      // Notify parent component
      onNodeClick(nodeData);
    });

    // Edge click handler
    cyRef.current.on('tap', 'edge', (event) => {
      const edge = event.target;
      const edgeData = edge.data();
      
      // Deselect other edges
      cyRef.current.edges().unselect();
      edge.select();
      
      // Notify parent component
      onEdgeClick(edgeData);
    });

    // Background click handler (deselect all and clear info panel)
    cyRef.current.on('tap', (event) => {
      if (event.target === cyRef.current) {
        cyRef.current.nodes().unselect();
        cyRef.current.edges().unselect();
        // Clear the NetworkInfoPanel
        onClearSelection();
      }
    });
  };

  return (
    <div className="string-network-renderer">
      <div className="network-container">
        {/* Network Container */}
        <div ref={containerRef} className="cytoscape-container" />
        
        {/* Loading State */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading network...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="error-message">
            <h4>Network Error</h4>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {/* Network Stats */}
        {networkStats.nodes > 0 && (
          <div className="network-stats">
            <span className="stat-item">Nodes: {networkStats.nodes}</span>
            <span className="stat-item">Edges: {networkStats.edges}</span>
          </div>
        )}
      </div>
      
      {/* Information Panel */}
      {(selectedNode || selectedEdge) && (
        <NetworkInfoPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          centralityData={centralityData}
          onClose={onClearSelection}
        />
      )}
    </div>
  );
};

export default StringNetworkRenderer;
