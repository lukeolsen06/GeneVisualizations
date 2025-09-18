import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import './StringNetworkVisualization.css';

/**
 * Dynamic STRING Network Visualization Component
 * Replaces static iframe with interactive network visualization
 */
const StringNetworkVisualization = ({ 
  geneList = [], 
  confidenceThreshold = 400,
  networkType = 'full',
  onNodeClick = null,
  onEdgeClick = null 
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkStats, setNetworkStats] = useState(null);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'font-weight': 'bold',
            'color': '#fff',
            'width': '30px',
            'height': '30px',
            'border-width': 2,
            'border-color': '#000'
          }
        },
        {
          selector: 'node[confidence="high"]',
          style: {
            'background-color': '#2E8B57',
            'width': '40px',
            'height': '40px'
          }
        },
        {
          selector: 'node[confidence="medium"]',
          style: {
            'background-color': '#4682B4',
            'width': '35px',
            'height': '35px'
          }
        },
        {
          selector: 'node[confidence="low"]',
          style: {
            'background-color': '#CD853F',
            'width': '30px',
            'height': '30px'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 'data(score)',
            'line-color': '#999',
            'target-arrow-color': '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.8
          }
        },
        {
          selector: 'edge[confidence="high"]',
          style: {
            'line-color': '#2E8B57',
            'target-arrow-color': '#2E8B57',
            'width': 3
          }
        },
        {
          selector: 'edge[confidence="medium"]',
          style: {
            'line-color': '#4682B4',
            'target-arrow-color': '#4682B4',
            'width': 2
          }
        },
        {
          selector: 'edge[confidence="low"]',
          style: {
            'line-color': '#CD853F',
            'target-arrow-color': '#CD853F',
            'width': 1
          }
        }
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0
      },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      selectionType: 'single'
    });

    // Add event listeners
    cyRef.current.on('tap', 'node', (event) => {
      const node = event.target;
      if (onNodeClick) {
        onNodeClick(node.data());
      }
    });

    cyRef.current.on('tap', 'edge', (event) => {
      const edge = event.target;
      if (onEdgeClick) {
        onEdgeClick(edge.data());
      }
    });

    // Cleanup on unmount
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // Load network data when geneList changes
  useEffect(() => {
    if (geneList.length === 0) return;

    const loadNetworkData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Import the service dynamically to avoid circular dependencies
        const StringApiService = (await import('../services/StringApiService')).default;
        
        // Resolve gene identifiers
        const resolvedIds = await StringApiService.resolveIdentifiers(geneList);
        const stringIds = resolvedIds.map(item => item.stringId).filter(Boolean);

        if (stringIds.length === 0) {
          throw new Error('No valid STRING identifiers found for the provided genes');
        }

        // Get network data
        const networkData = await StringApiService.getNetwork(stringIds, {
          confidenceThreshold,
          networkType
        });

        // Get protein information
        const proteinInfo = await StringApiService.getProteinInfo(stringIds);

        // Convert to Cytoscape format
        const cytoscapeData = StringApiService.convertToCytoscapeFormat(networkData, proteinInfo);

        // Update the network
        if (cyRef.current) {
          cyRef.current.json({ elements: cytoscapeData });
          cyRef.current.layout({ name: 'cose' }).run();

          // Calculate network statistics
          const stats = calculateNetworkStats(cytoscapeData);
          setNetworkStats(stats);
        }
      } catch (err) {
        console.error('Error loading network:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadNetworkData();
  }, [geneList, confidenceThreshold, networkType]);

  // Calculate network statistics
  const calculateNetworkStats = (data) => {
    const nodeCount = data.nodes.length;
    const edgeCount = data.edges.length;
    const avgDegree = edgeCount > 0 ? (2 * edgeCount) / nodeCount : 0;
    
    return {
      nodes: nodeCount,
      edges: edgeCount,
      averageDegree: avgDegree.toFixed(2),
      density: nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0
    };
  };

  // Handle confidence threshold change
  const handleConfidenceChange = (event) => {
    const newThreshold = parseInt(event.target.value);
    // This will trigger a re-render with the new threshold
    // In a real implementation, you'd want to debounce this
  };

  return (
    <div className="string-network-container">
      {/* Controls Panel */}
      <div className="network-controls">
        <div className="control-group">
          <label htmlFor="confidence-slider">Confidence Threshold:</label>
          <input
            id="confidence-slider"
            type="range"
            min="150"
            max="900"
            step="50"
            value={confidenceThreshold}
            onChange={handleConfidenceChange}
            className="confidence-slider"
          />
          <span className="confidence-value">{confidenceThreshold}</span>
        </div>
        
        {networkStats && (
          <div className="network-stats">
            <h4>Network Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Nodes:</span>
                <span className="stat-value">{networkStats.nodes}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Edges:</span>
                <span className="stat-value">{networkStats.edges}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Degree:</span>
                <span className="stat-value">{networkStats.averageDegree}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Density:</span>
                <span className="stat-value">{networkStats.density.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
          <h4>Error loading network</h4>
          <p>{error}</p>
        </div>
      )}

      {/* Network Visualization */}
      <div 
        ref={containerRef} 
        className="network-visualization"
        style={{ 
          width: '100%', 
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default StringNetworkVisualization;
