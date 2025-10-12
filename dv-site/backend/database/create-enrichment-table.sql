-- ============================================================================
-- Enrichment Data Table Schema
-- ============================================================================
-- This table stores gene enrichment analysis results from various databases
-- (KEGG, Reactome, WikiPathways) for different dataset comparisons.
--
-- Purpose: Replace static JSON imports with dynamic database queries
-- Used by: /api/enrichment endpoints
--
-- Example data sources:
-- - barCharts/DHS_DOHHvsTar4_EC/enrichment.KEGG.json
-- - barCharts/eIF5A_DDvsWT_EC/enrichment.Reactome.json
-- ============================================================================

-- Drop existing table if it exists (for development only)
DROP TABLE IF EXISTS enrichment_data CASCADE;

-- Create the enrichment_data table
CREATE TABLE enrichment_data (
  -- Primary key
  id SERIAL PRIMARY KEY,
  
  -- Dataset identification
  comparison VARCHAR(100) NOT NULL,          -- e.g., 'DHS_DOHHvsTar4_EC', 'eIF5A_DDvsWT_EC'
  database VARCHAR(50) NOT NULL,             -- 'KEGG', 'Reactome', 'WikiPathways'
  
  -- Pathway/term information
  term_id VARCHAR(50) NOT NULL,              -- e.g., 'mmu03010', 'R-MMU-156842'
  term_description TEXT NOT NULL,            -- e.g., 'Ribosome', 'Oxidative phosphorylation'
  
  -- Statistical results
  genes_mapped INTEGER NOT NULL,             -- Number of genes in this pathway
  enrichment_score DOUBLE PRECISION NOT NULL, -- Statistical enrichment score
  direction VARCHAR(20) NOT NULL,            -- 'bottom', 'top', or 'both ends'
  false_discovery_rate DOUBLE PRECISION NOT NULL, -- FDR value
  method VARCHAR(20) NOT NULL,               -- Statistical method: 'ks' (Kolmogorov-Smirnov) or 'afc' (area under curve)
  
  -- Matching genes (from the dataset)
  matching_protein_ids TEXT,                 -- Comma-separated protein IDs (e.g., '10090.ENSMUSP00000000756,10090.ENSMUSP...')
  matching_protein_labels TEXT,              -- Comma-separated gene names (e.g., 'Rpl13,Mrpl2,Mrpl4,...')
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Index for querying by comparison (most common query pattern)
CREATE INDEX idx_enrichment_comparison ON enrichment_data(comparison);

-- Index for querying by database type (KEGG, Reactome, etc.)
CREATE INDEX idx_enrichment_database ON enrichment_data(database);

-- Index for querying specific terms
CREATE INDEX idx_enrichment_term_id ON enrichment_data(term_id);

-- Composite index for the most common query pattern: comparison + database
CREATE INDEX idx_enrichment_comparison_database ON enrichment_data(comparison, database);

-- Index for filtering by FDR (finding significant pathways)
CREATE INDEX idx_enrichment_fdr ON enrichment_data(false_discovery_rate);

-- ============================================================================
-- Constraints
-- ============================================================================

-- Ensure combination of comparison + database + term_id is unique
-- (prevents duplicate enrichment records)
ALTER TABLE enrichment_data 
  ADD CONSTRAINT unique_enrichment_record 
  UNIQUE (comparison, database, term_id);

-- Ensure valid database values
ALTER TABLE enrichment_data 
  ADD CONSTRAINT check_database_type 
  CHECK (database IN ('KEGG', 'Reactome', 'WikiPathways'));

-- Ensure valid direction values
ALTER TABLE enrichment_data 
  ADD CONSTRAINT check_direction 
  CHECK (direction IN ('bottom', 'top', 'both ends'));

-- Ensure valid method values
ALTER TABLE enrichment_data 
  ADD CONSTRAINT check_method 
  CHECK (method IN ('ks', 'afc'));

-- ============================================================================
-- Comments (PostgreSQL documentation)
-- ============================================================================

COMMENT ON TABLE enrichment_data IS 'Stores gene enrichment analysis results from KEGG, Reactome, and WikiPathways databases';
COMMENT ON COLUMN enrichment_data.comparison IS 'Dataset comparison identifier (e.g., eIF5A_DDvsWT_EC)';
COMMENT ON COLUMN enrichment_data.database IS 'Source database: KEGG, Reactome, or WikiPathways';
COMMENT ON COLUMN enrichment_data.term_id IS 'Pathway/term identifier from the source database';
COMMENT ON COLUMN enrichment_data.term_description IS 'Human-readable pathway name';
COMMENT ON COLUMN enrichment_data.enrichment_score IS 'Statistical enrichment score';
COMMENT ON COLUMN enrichment_data.false_discovery_rate IS 'False Discovery Rate (FDR) - lower is more significant';
COMMENT ON COLUMN enrichment_data.matching_protein_ids IS 'Comma-separated list of matching protein IDs';
COMMENT ON COLUMN enrichment_data.matching_protein_labels IS 'Comma-separated list of matching gene names';

-- ============================================================================
-- Grant Permissions (adjust username as needed)
-- ============================================================================

-- Grant SELECT to the application user
-- GRANT SELECT ON enrichment_data TO your_app_user;

-- ============================================================================
-- Sample Query Examples
-- ============================================================================

-- Example 1: Get all KEGG pathways for a specific comparison
-- SELECT * FROM enrichment_data 
-- WHERE comparison = 'eIF5A_DDvsWT_EC' 
--   AND database = 'KEGG' 
-- ORDER BY false_discovery_rate ASC;

-- Example 2: Get the top 10 most significant pathways (any database)
-- SELECT term_description, enrichment_score, false_discovery_rate, database
-- FROM enrichment_data 
-- WHERE comparison = 'eIF5A_DDvsWT_EC'
-- ORDER BY false_discovery_rate ASC
-- LIMIT 10;

-- Example 3: Count enrichment records by database type
-- SELECT database, COUNT(*) as pathway_count
-- FROM enrichment_data
-- GROUP BY database;

-- ============================================================================
-- End of Schema
-- ============================================================================

