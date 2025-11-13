import React, { useState, useEffect, useRef } from 'react';
import './ThresholdInputControls.css';

/**
 * ThresholdInputControls Component
 * Provides manual input controls for fold change and p-value thresholds
 * Similar to the controls used in volcano plot visualizations
 */
const ThresholdInputControls = ({ 
  onThresholdsChange, 
  onClearNetwork,
  onApplyThresholds,
  initialLog2FC = 1.5, 
  initialPadj = 0.1 
}) => {
  const [log2fcThreshold, setLog2fcThreshold] = useState(initialLog2FC);
  const [padjThreshold, setPadjThreshold] = useState(initialPadj);
  const [tempLog2fc, setTempLog2fc] = useState(initialLog2FC.toString());
  const [tempPadj, setTempPadj] = useState(initialPadj.toString());

  // Validate and set log2FC threshold (without notifying parent)
  // Range: 0 to 3, step: 0.5
  const validateAndSetLog2FC = (value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= 3) {
      // Round to nearest 0.5 step
      const roundedValue = Math.round(numericValue * 2) / 2;
      setLog2fcThreshold(Math.max(0, Math.min(3, roundedValue)));
    }
  };

  // Validate and set p-value threshold (without notifying parent)
  // Range: 0.01 to 0.1, step: 0.01
  const validateAndSetPadj = (value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0.01 && numericValue <= 0.1) {
      // Round to nearest 0.01 step
      const roundedValue = Math.round(numericValue * 100) / 100;
      setPadjThreshold(Math.max(0.01, Math.min(0.1, roundedValue)));
    }
  };

  // Handle input changes with temporary state
  const handleLog2FCChange = (e) => {
    setTempLog2fc(e.target.value);
  };

  const handlePadjChange = (e) => {
    setTempPadj(e.target.value);
  };

  // Apply thresholds when user presses Enter or loses focus
  const handleLog2FCBlur = () => {
    validateAndSetLog2FC(tempLog2fc);
  };

  const handlePadjBlur = () => {
    validateAndSetPadj(tempPadj);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (e.target.name === 'log2fc') {
        validateAndSetLog2FC(tempLog2fc);
      } else if (e.target.name === 'padj') {
        validateAndSetPadj(tempPadj);
      }
    }
  };

  // Apply current thresholds
  const applyThresholds = () => {
    const thresholds = {
      log2fc: log2fcThreshold,
      padj: padjThreshold
    };
    onThresholdsChange(thresholds);
    onApplyThresholds(thresholds);
  };

  // Reset to default values
  const resetToDefaults = () => {
    setLog2fcThreshold(1.5);
    setPadjThreshold(0.1);
    setTempLog2fc('1.5');
    setTempPadj('0.1');
    // Apply the reset values immediately
    const thresholds = {
      log2fc: 1.5,
      padj: 0.1
    };
    onThresholdsChange(thresholds);
    onApplyThresholds(thresholds);
  };

  return (
    <div className="threshold-input-controls">
      <div className="controls-header">
        <h4>Filtering Thresholds</h4>
        <p>Adjust the fold change and p-value thresholds to filter genes for STRING analysis</p>
      </div>
      
      <div className="input-controls">
        <div className="input-group">
          <label htmlFor="log2fc-input">Log2 Fold Change:</label>
          <div className="input-container">
            <input
              id="log2fc-input"
              name="log2fc"
              type="number"
              step="0.5"
              min="0"
              max="3"
              value={tempLog2fc}
              onChange={handleLog2FCChange}
              onBlur={handleLog2FCBlur}
              onKeyPress={handleKeyPress}
              placeholder="1.5"
              className="threshold-input"
            />
            <span className="input-suffix">|log2FC| &gt; threshold</span>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="padj-input">Adjusted P-value:</label>
          <div className="input-container">
            <input
              id="padj-input"
              name="padj"
              type="number"
              step="0.01"
              min="0.01"
              max="0.1"
              value={tempPadj}
              onChange={handlePadjChange}
              onBlur={handlePadjBlur}
              onKeyPress={handleKeyPress}
              placeholder="0.1"
              className="threshold-input"
            />
            <span className="input-suffix">padj &lt; threshold</span>
          </div>
        </div>

        <div className="control-actions">
          <button 
            type="button" 
            onClick={applyThresholds}
            className="apply-button"
          >
            Set Changes
          </button>
          <button 
            type="button" 
            onClick={resetToDefaults}
            className="reset-button"
          >
            Reset to Defaults
          </button>
          <button 
            type="button" 
            onClick={onClearNetwork}
            className="clear-network-button"
          >
            Clear Network
          </button>
        </div>
      </div>

    </div>
  );
};

export default ThresholdInputControls;
