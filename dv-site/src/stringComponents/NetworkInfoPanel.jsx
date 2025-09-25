import React from 'react';
import './NetworkInfoPanel.css';

/**
 * NetworkInfoPanel Component
 * Displays detailed information about selected nodes or edges
 * 
 * This is a placeholder implementation that will be enhanced later
 * with proper information display for gene/protein data
 */
const NetworkInfoPanel = ({ selectedNode, selectedEdge, centralityData, onClose }) => {
  if (!selectedNode && !selectedEdge) {
    return null;
  }


  return (
    <div className="network-info-panel">
      <div className="info-panel-content">
        <div className="info-panel-header">
          <h3>
            {selectedNode ? 'Gene Information' : 'Edge Information'}
          </h3>
          <button className="close-button" onClick={onClose} title="Close panel">
            ×
          </button>
        </div>
        
        <div className="info-panel-body">
          {selectedNode && (
            <div className="node-info">
              <h4>Gene: {selectedNode.id}</h4>
              
              {selectedNode.stringId && (
                <p><strong>STRING ID:</strong> {selectedNode.stringId}</p>
              )}
              
              {selectedNode.log2fc !== undefined && (
                <p><strong>Log2 Fold Change:</strong> {selectedNode.log2fc.toFixed(3)}</p>
              )}
              
              {selectedNode.padj !== undefined && (
                <p><strong>Adjusted P-value:</strong> {selectedNode.padj.toExponential(3)}</p>
              )}
              
              {selectedNode.expression && (
                <p><strong>Expression:</strong> 
                  <span className={`expression-tag ${selectedNode.expression}`}>
                    {selectedNode.expression}
                  </span>
                </p>
              )}

              {centralityData && centralityData.has(selectedNode.id) && (
                <>
                  <p><strong>Degree:</strong> 
                    <span className="centrality-value">
                      {centralityData.get(selectedNode.id + '_degree') || 0}
                    </span>
                  </p>
                  <p><strong>Degree Centrality:</strong> 
                    <span className="centrality-value centrality-tooltip">
                      {centralityData.get(selectedNode.id).toFixed(4)}
                      <span className="tooltip-text">
                        <strong>Degree Centrality Calculation:</strong><br/>
                        • Degree (connections): 30% weight<br/>
                        • Confidence scores: 70% weight<br/>
                        • Formula: 0.3 × (degree/max_possible) + 0.7 × (avg_confidence)<br/>
                        • Higher values = more central/important nodes
                      </span>
                    </span>
                  </p>
                </>
              )}
              
              
              {selectedNode.annotation && (
                <p><strong>Annotation:</strong> {selectedNode.annotation}</p>
              )}
              
              {selectedNode.functionalTerms && selectedNode.functionalTerms.length > 0 && (
                <div className="functional-terms">
                  <p><strong>Functional Terms:</strong></p>
                  <ul>
                    {selectedNode.functionalTerms.map((term, index) => (
                      <li key={index}>
                        <strong>{term.term}:</strong> {term.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
            </div>
          )}
          
          {selectedEdge && (
            <div className="edge-info">
              <h4>Interaction: {selectedEdge.source} ↔ {selectedEdge.target}</h4>
              
              {selectedEdge.score !== undefined && (
                <p><strong>Confidence Score:</strong> {selectedEdge.score.toFixed(1)}</p>
              )}
              
              {selectedEdge.confidence && (
                <p><strong>Confidence Level:</strong> 
                  <span className={`confidence-tag ${selectedEdge.confidence}`}>
                    {selectedEdge.confidence}
                  </span>
                </p>
              )}
              
              <div className="confidence-info">
                <p><small>
                  <strong>Confidence Levels:</strong><br/>
                  High: ≥0.7 | Medium: 0.4-0.699 | Low: &lt;0.4
                </small></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkInfoPanel;
