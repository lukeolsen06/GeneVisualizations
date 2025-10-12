/**
 * GeneSearchBar Component
 * 
 * A search input component that allows users to search for genes by name
 * using the backend API. Features include:
 * 
 * - Real-time search with debouncing (300ms delay)
 * - Loading indicator while fetching results
 * - Dropdown list of matching genes
 * - Click to select a gene
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Error handling
 * 
 * Props:
 * @param {string} comparison - Dataset comparison name (e.g., 'eIF5A_DDvsWT_EC')
 * @param {function} onGeneSelect - Callback when a gene is selected: (gene) => void
 * @param {string} [placeholder] - Input placeholder text
 * @param {number} [maxResults] - Maximum number of results to show (default: 10)
 * 
 * Usage Example:
 * <GeneSearchBar 
 *   comparison="eIF5A_DDvsWT_EC"
 *   onGeneSelect={(gene) => console.log('Selected:', gene.geneName)}
 *   placeholder="Search genes (e.g., Prl, Brca1)..."
 *   maxResults={10}
 * />
 */

import React, { useState, useEffect, useRef } from 'react';
import DatasetService from '../services/DatasetService';
import './GeneSearchBar.css';

const GeneSearchBar = ({ 
  comparison, 
  onGeneSelect, 
  placeholder = 'Search genes by name...',
  maxResults = 10 
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Current text in the input field
  const [searchQuery, setSearchQuery] = useState('');
  
  // Array of gene objects returned from the API
  const [results, setResults] = useState([]);
  
  // Is the API call in progress?
  const [loading, setLoading] = useState(false);
  
  // Error message if search fails
  const [error, setError] = useState(null);
  
  // Should we show the dropdown results?
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Which result is currently highlighted (for keyboard navigation)
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // ============================================================================
  // REFS (for timers and DOM elements)
  // ============================================================================
  
  // Timer for debouncing (stores the setTimeout ID)
  const debounceTimer = useRef(null);
  
  // Reference to the container div (for click-outside detection)
  const searchContainerRef = useRef(null);

  // ============================================================================
  // SEARCH FUNCTION
  // ============================================================================

  /**
   * Perform the actual search using the DatasetService
   * 
   * This is called AFTER the debounce delay (300ms of no typing)
   * 
   * Flow:
   * 1. Validate query (must be 2+ characters)
   * 2. Set loading state
   * 3. Call backend API via DatasetService.searchGenes()
   * 4. Update results state
   * 5. Show dropdown if we have results
   * 6. Handle any errors
   */
  const performSearch = async (query) => {
    // Don't search if query is too short
    if (!query || query.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the backend API
      // This hits: GET /api/datasets/{comparison}/genes/search?query={query}&limit={maxResults}
      const searchResults = await DatasetService.searchGenes(
        comparison, 
        query.trim(), 
        maxResults
      );

      setResults(searchResults);
      setShowDropdown(searchResults.length > 0);
      
    } catch (err) {
      console.error('Gene search failed:', err);
      setError('Failed to search genes. Please try again.');
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // EFFECT 1: DEBOUNCED SEARCH
  // ============================================================================

  /**
   * This effect triggers the search with a 300ms delay after user stops typing.
   * 
   * Why debounce?
   * - Without it: typing "BRCA1" = 5 API calls (B, BR, BRC, BRCA, BRCA1)
   * - With it: typing "BRCA1" = 1 API call (after user stops typing)
   * 
   * How it works:
   * 1. User types a letter → clear old timer, start new 300ms timer
   * 2. User types another letter → clear old timer, start new 300ms timer
   * 3. User stops typing → 300ms passes → performSearch() is called
   * 
   * The cleanup function ensures we don't have multiple timers running
   */
  useEffect(() => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer - will execute after 300ms
    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce delay

    // Cleanup: clear timer when component unmounts or query changes
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, comparison]); // Re-run when query or comparison changes

  // ============================================================================
  // EFFECT 2: CLICK OUTSIDE TO CLOSE DROPDOWN
  // ============================================================================

  /**
   * Close the dropdown when user clicks outside the search component
   * 
   * This improves UX - user can dismiss the dropdown by clicking anywhere
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside our component
      if (searchContainerRef.current && 
          !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    // Add event listener when component mounts
    document.addEventListener('mousedown', handleClickOutside);
    
    // Remove event listener when component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array = run once on mount

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle input change (when user types)
   */
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1); // Reset keyboard selection
  };

  /**
   * Handle gene selection (when user clicks a result)
   * 
   * This function:
   * 1. Updates the input to show the selected gene name
   * 2. Closes the dropdown
   * 3. Calls the parent's onGeneSelect callback with the full gene object
   */
  const handleGeneClick = (gene) => {
    setSearchQuery(gene.geneName); // Update input with selected gene
    setShowDropdown(false);        // Close dropdown
    setSelectedIndex(-1);
    
    // Call parent callback with the selected gene object
    if (onGeneSelect) {
      onGeneSelect(gene);
    }
  };

  /**
   * Handle keyboard navigation
   * 
   * Supported keys:
   * - ArrowDown: Move selection down
   * - ArrowUp: Move selection up
   * - Enter: Select the highlighted gene
   * - Escape: Close dropdown
   */
  const handleKeyDown = (e) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleGeneClick(results[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  /**
   * Clear search input (X button)
   */
  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setError(null);
  };

  // ============================================================================
  // FORMATTING HELPERS
  // ============================================================================

  /**
   * Format p-values for display
   * Small values → scientific notation (1.23e-5)
   * Larger values → decimal (0.0023)
   */
  const formatPValue = (pvalue) => {
    if (!pvalue) return 'N/A';
    return pvalue < 0.001 ? pvalue.toExponential(2) : pvalue.toFixed(4);
  };

  /**
   * Format fold change with + sign for positive values
   * Example: 2.34 → "+2.34", -1.56 → "-1.56"
   */
  const formatFoldChange = (fc) => {
    if (fc === undefined || fc === null) return 'N/A';
    const formatted = fc.toFixed(2);
    return fc > 0 ? `+${formatted}` : formatted;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="gene-search-container" ref={searchContainerRef}>
      {/* ===== SEARCH INPUT BOX ===== */}
      <div className="gene-search-input-wrapper">
        <input
          type="text"
          className="gene-search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          aria-label="Gene search"
          autoComplete="off"
        />
        
        {/* Loading Spinner (shows while API call is in progress) */}
        {loading && (
          <span className="gene-search-loading" title="Searching...">
            ⏳
          </span>
        )}

        {/* Clear Button (X icon, shows when there's text) */}
        {searchQuery && !loading && (
          <button 
            className="gene-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* ===== ERROR MESSAGE ===== */}
      {error && (
        <div className="gene-search-error">
          ⚠️ {error}
        </div>
      )}

      {/* ===== RESULTS DROPDOWN ===== */}
      {showDropdown && results.length > 0 && (
        <div className="gene-search-dropdown">
          {/* Header showing result count */}
          <div className="gene-search-results-header">
            Found {results.length}
            {results.length === maxResults ? '+' : ''} 
            {' gene'}
            {results.length !== 1 ? 's' : ''}
          </div>
          
          {/* List of gene results */}
          <ul className="gene-search-results">
            {results.map((gene, index) => (
              <li
                key={gene.geneId}
                className={`gene-search-result-item ${
                  index === selectedIndex ? 'selected' : ''
                }`}
                onClick={() => handleGeneClick(gene)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Gene name and ID */}
                <div className="gene-result-main">
                  <span className="gene-result-name">{gene.geneName}</span>
                  <span className="gene-result-id">{gene.geneId}</span>
                </div>
                
                {/* Statistics (log2FC and p-value) */}
                <div className="gene-result-stats">
                  <span className="gene-result-stat">
                    Log2FC: <strong>{formatFoldChange(gene.log2FoldChange)}</strong>
                  </span>
                  <span className="gene-result-stat">
                    p-value: <strong>{formatPValue(gene.pvalue)}</strong>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== NO RESULTS MESSAGE ===== */}
      {showDropdown && !loading && searchQuery.length >= 2 && results.length === 0 && (
        <div className="gene-search-no-results">
          No genes found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default GeneSearchBar;

