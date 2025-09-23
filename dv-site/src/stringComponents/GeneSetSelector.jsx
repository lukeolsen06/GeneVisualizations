import React, { useState, useEffect } from 'react';
import Dropdown from '../visualizeComponents/DropDown';
import { dropdownOptions } from '../visualizeComponents/VolcanoVisualizationsSection/imports';
import './GeneSetSelector.css';

/**
 * GeneSetSelector Component
 * Handles comparison selection and DEG filtering for STRING analysis
 * 
 * Functionality:
 * 1. Loads CSV data from src/graphs/[comparison]/[comparison].DEG.all.csv
 * 2. Applies filtering logic: |log2FC| > 3 AND padj < 0.05
 * 3. Extracts gene names and converts to lowercase
 * 4. Reports statistics to parent component
 */
const GeneSetSelector = ({ 
  selectedComparison, 
  onComparisonChange, 
  onFilteredGenes, 
  onLoadingChange, 
  onError 
}) => {
  const [csvData, setCsvData] = useState(null);
  const [filteredGenes, setFilteredGenes] = useState([]);
  const [filteringStats, setFilteringStats] = useState({
    totalGenes: 0,
    filteredGenes: 0,
    upregulatedGenes: 0,
    downregulatedGenes: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load CSV data when comparison changes
  useEffect(() => {
    if (selectedComparison === '-- choose --') {
      setCsvData(null);
      setFilteredGenes([]);
      setFilteringStats({
        totalGenes: 0,
        filteredGenes: 0,
        upregulatedGenes: 0,
        downregulatedGenes: 0
      });
      return;
    }

    loadCsvData(selectedComparison);
  }, [selectedComparison]);

  // Filter genes when CSV data changes
  useEffect(() => {
    if (csvData) {
      filterGenes(csvData);
    }
  }, [csvData]);

  // Load CSV data from the graphs directory
  const loadCsvData = async (comparison) => {
    setIsLoading(true);
    onLoadingChange(true);
    
    try {
      const csvPath = `/src/graphs/${comparison}/${comparison}.DEG.all.csv`;
      const response = await fetch(csvPath);
      
      if (!response.ok) {
        throw new Error(`Failed to load data for ${comparison}: ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const parsedData = parseCsvData(csvText);
      setCsvData(parsedData);
      
    } catch (error) {
      console.error('Error loading CSV data:', error);
      onError(`Failed to load comparison data: ${error.message}`);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  // Parse CSV data into array of objects
  const parseCsvData = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  // Filter genes based on criteria: (log2FC > 3 OR log2FC < -3) AND padj < 0.05
  const filterGenes = (data) => {
    const log2fcThreshold = 3;
    const padjThreshold = 0.05;
    
    const filtered = data.filter(gene => {
      const log2fc = parseFloat(gene.log2FoldChange);
      const padj = parseFloat(gene.padj);
      
      return (log2fc > log2fcThreshold || log2fc < -log2fcThreshold) && padj < padjThreshold;
    });

    // Separate upregulated and downregulated genes with proper thresholds
    const upregulated = filtered.filter(gene => parseFloat(gene.log2FoldChange) > log2fcThreshold);
    const downregulated = filtered.filter(gene => parseFloat(gene.log2FoldChange) < -log2fcThreshold);

    // Create gene objects with expression data for color coding
    const geneObjects = filtered.map(gene => ({
      geneName: gene.gene_name?.toLowerCase(),
      log2fc: parseFloat(gene.log2FoldChange),
      padj: parseFloat(gene.padj),
      expression: parseFloat(gene.log2FoldChange) > log2fcThreshold ? 'upregulated' : 'downregulated',
      // Keep original data for reference
      originalData: {
        gene_id: gene.gene_id,
        gene_name: gene.gene_name,
        gene_description: gene.gene_description,
        gene_chr: gene.gene_chr,
        gene_biotype: gene.gene_biotype
      }
    })).filter(gene => gene.geneName); // Remove any undefined gene names

    const stats = {
      totalGenes: data.length,
      filteredGenes: filtered.length,
      upregulatedGenes: upregulated.length,
      downregulatedGenes: downregulated.length
    };

    setFilteredGenes(geneObjects); // Now passing full gene objects instead of just names
    setFilteringStats(stats);
    
    // Notify parent component with both gene names and full objects
    onFilteredGenes(geneObjects);
  };

  // Handle comparison dropdown change
  const handleComparisonChange = (e) => {
    const comparison = e.target.value;
    onComparisonChange(comparison);
  };

  return (
    <div className="gene-set-selector">
      <div className="selector-header">
        <h3>Select Gene Set for STRING Analysis</h3>
        <p>Choose a pairwise comparison to analyze protein-protein interactions</p>
      </div>

      <div className="selector-controls">
        <div className="dropdown-container">
          <label htmlFor="comparison-dropdown">Comparison:</label>
          <Dropdown
            id="comparison-dropdown"
            className="comparison-dropdown"
            selectedDropdown={selectedComparison}
            onChange={handleComparisonChange}
            options={dropdownOptions}
          />
        </div>

        <div className="filtering-criteria">
          <h4>Filtering Criteria</h4>
          <div className="criteria-list">
            <div className="criterion">
              <span className="criterion-label">Log2 Fold Change:</span>
              <span className="criterion-value">log2FC &gt; 3 OR log2FC &lt; -3</span>
            </div>
            <div className="criterion">
              <span className="criterion-label">Adjusted P-value:</span>
              <span className="criterion-value">padj &lt; 0.05</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading comparison data...</p>
        </div>
      )}

      {/* Results Display */}
      {filteredGenes.length > 0 && (
        <div className="filtering-results">
          <h4>Filtering Results</h4>
          <div className="results-grid">
            <div className="result-item">
              <span className="result-label">Total Genes:</span>
              <span className="result-value">{filteringStats.totalGenes.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Filtered DEGs:</span>
              <span className="result-value">{filteringStats.filteredGenes.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Upregulated:</span>
              <span className="result-value upregulated">{filteringStats.upregulatedGenes.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Downregulated:</span>
              <span className="result-value downregulated">{filteringStats.downregulatedGenes.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="gene-preview">
            <h5>Gene Names (first 10):</h5>
            <div className="gene-list">
              {filteredGenes.slice(0, 10).map((gene, index) => (
                <span 
                  key={index} 
                  className={`gene-tag ${gene.expression}`}
                  title={`${gene.geneName} (log2FC: ${gene.log2fc.toFixed(2)}, padj: ${gene.padj.toExponential(2)})`}
                >
                  {gene.geneName}
                </span>
              ))}
              {filteredGenes.length > 10 && (
                <span className="gene-tag more">+{filteredGenes.length - 10} more</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Selection State */}
      {selectedComparison === '-- choose --' && (
        <div className="no-selection">
          <p>Please select a comparison to begin STRING analysis</p>
        </div>
      )}
    </div>
  );
};

export default GeneSetSelector;
