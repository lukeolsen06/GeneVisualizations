-- ============================================================================
-- STRING Network Analysis Database Schema
-- ============================================================================
-- This script creates the database tables for storing STRING protein-protein
-- interaction network data, including nodes, edges, and network metadata.
--
-- Tables created:
-- 1. string_networks - Network metadata and configuration
-- 2. string_nodes - Individual proteins/genes in networks
-- 3. string_edges - Protein-protein interactions
-- ============================================================================

-- Create string_networks table
CREATE TABLE IF NOT EXISTS string_networks (
    id SERIAL PRIMARY KEY,
    comparison VARCHAR(255) NOT NULL,
    gene_set_hash VARCHAR(64) NOT NULL,
    gene_set JSONB NOT NULL,
    confidence_threshold INTEGER NOT NULL,
    network_type VARCHAR(50) NOT NULL DEFAULT 'full',
    node_count INTEGER NOT NULL DEFAULT 0,
    edge_count INTEGER NOT NULL DEFAULT 0,
    resolved_gene_count INTEGER NOT NULL DEFAULT 0,
    is_successful BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create string_nodes table
CREATE TABLE IF NOT EXISTS string_nodes (
    id SERIAL PRIMARY KEY,
    network_id INTEGER NOT NULL REFERENCES string_networks(id) ON DELETE CASCADE,
    string_id VARCHAR(255) NOT NULL,
    preferred_name VARCHAR(255) NOT NULL,
    annotation TEXT,
    log2fc DECIMAL(10,4),
    padj DECIMAL(10,8),
    expression VARCHAR(50),
    functional_terms JSONB,
    normalized_degree_centrality DECIMAL(6,4),
    degree INTEGER
);

-- Create string_edges table
CREATE TABLE IF NOT EXISTS string_edges (
    id SERIAL PRIMARY KEY,
    network_id INTEGER NOT NULL REFERENCES string_networks(id) ON DELETE CASCADE,
    source_string_id VARCHAR(255) NOT NULL,
    target_string_id VARCHAR(255) NOT NULL,
    interaction_score DECIMAL(5,3) NOT NULL,
    confidence_level VARCHAR(20) NOT NULL,
    interaction_type VARCHAR(50),
    evidence_sources JSONB
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Indexes for string_networks
CREATE INDEX IF NOT EXISTS idx_string_networks_comparison ON string_networks(comparison);
CREATE INDEX IF NOT EXISTS idx_string_networks_gene_set_hash ON string_networks(gene_set_hash);
CREATE INDEX IF NOT EXISTS idx_string_networks_created_at ON string_networks(created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_string_networks_unique ON string_networks(comparison, gene_set_hash, confidence_threshold, network_type);

-- Indexes for string_nodes
CREATE INDEX IF NOT EXISTS idx_string_nodes_network_id ON string_nodes(network_id);
CREATE INDEX IF NOT EXISTS idx_string_nodes_string_id ON string_nodes(string_id);
CREATE INDEX IF NOT EXISTS idx_string_nodes_preferred_name ON string_nodes(preferred_name);
CREATE INDEX IF NOT EXISTS idx_string_nodes_expression ON string_nodes(expression);
CREATE INDEX IF NOT EXISTS idx_string_nodes_centrality ON string_nodes(normalized_degree_centrality);
CREATE UNIQUE INDEX IF NOT EXISTS idx_string_nodes_unique ON string_nodes(network_id, string_id);

-- Indexes for string_edges
CREATE INDEX IF NOT EXISTS idx_string_edges_network_id ON string_edges(network_id);
CREATE INDEX IF NOT EXISTS idx_string_edges_source ON string_edges(source_string_id);
CREATE INDEX IF NOT EXISTS idx_string_edges_target ON string_edges(target_string_id);
CREATE INDEX IF NOT EXISTS idx_string_edges_score ON string_edges(interaction_score);
CREATE INDEX IF NOT EXISTS idx_string_edges_confidence ON string_edges(confidence_level);
CREATE UNIQUE INDEX IF NOT EXISTS idx_string_edges_unique ON string_edges(network_id, source_string_id, target_string_id);

-- ============================================================================
-- CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Constraints for string_networks
ALTER TABLE string_networks ADD CONSTRAINT IF NOT EXISTS chk_confidence_threshold 
    CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1000);

ALTER TABLE string_networks ADD CONSTRAINT IF NOT EXISTS chk_node_count 
    CHECK (node_count >= 0);

ALTER TABLE string_networks ADD CONSTRAINT IF NOT EXISTS chk_edge_count 
    CHECK (edge_count >= 0);

ALTER TABLE string_networks ADD CONSTRAINT IF NOT EXISTS chk_resolved_gene_count 
    CHECK (resolved_gene_count >= 0);

-- Constraints for string_nodes
ALTER TABLE string_nodes ADD CONSTRAINT IF NOT EXISTS chk_padj_range 
    CHECK (padj IS NULL OR (padj >= 0 AND padj <= 1));

ALTER TABLE string_nodes ADD CONSTRAINT IF NOT EXISTS chk_centrality_range 
    CHECK (normalized_degree_centrality IS NULL OR (normalized_degree_centrality >= 0 AND normalized_degree_centrality <= 1));

ALTER TABLE string_nodes ADD CONSTRAINT IF NOT EXISTS chk_degree_positive 
    CHECK (degree IS NULL OR degree >= 0);

-- Constraints for string_edges
ALTER TABLE string_edges ADD CONSTRAINT IF NOT EXISTS chk_interaction_score_range 
    CHECK (interaction_score >= 0 AND interaction_score <= 1000);

ALTER TABLE string_edges ADD CONSTRAINT IF NOT EXISTS chk_confidence_level 
    CHECK (confidence_level IN ('low', 'medium', 'high'));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE string_networks IS 'Metadata for STRING protein-protein interaction networks';
COMMENT ON COLUMN string_networks.comparison IS 'Dataset comparison name (e.g., eIF5A_DDvsWT_EC)';
COMMENT ON COLUMN string_networks.gene_set_hash IS 'Hash of gene set for deduplication and caching';
COMMENT ON COLUMN string_networks.gene_set IS 'JSON array of gene names used in network';
COMMENT ON COLUMN string_networks.confidence_threshold IS 'STRING API confidence threshold (0-1000 scale)';
COMMENT ON COLUMN string_networks.network_type IS 'STRING API network type (full, physical, functional)';

COMMENT ON TABLE string_nodes IS 'Individual proteins/genes in STRING networks';
COMMENT ON COLUMN string_nodes.string_id IS 'STRING database identifier';
COMMENT ON COLUMN string_nodes.preferred_name IS 'Gene name for display';
COMMENT ON COLUMN string_nodes.annotation IS 'Gene function annotation from STRING';
COMMENT ON COLUMN string_nodes.log2fc IS 'Log2 fold change from RNA-seq analysis';
COMMENT ON COLUMN string_nodes.padj IS 'Adjusted p-value from RNA-seq analysis';
COMMENT ON COLUMN string_nodes.expression IS 'Expression direction (upregulated, downregulated, unchanged)';
COMMENT ON COLUMN string_nodes.functional_terms IS 'JSON array of functional terms and descriptions';
COMMENT ON COLUMN string_nodes.normalized_degree_centrality IS 'Network centrality measure (0-1 scale)';

COMMENT ON TABLE string_edges IS 'Protein-protein interactions in STRING networks';
COMMENT ON COLUMN string_edges.source_string_id IS 'STRING ID of source protein';
COMMENT ON COLUMN string_edges.target_string_id IS 'STRING ID of target protein';
COMMENT ON COLUMN string_edges.interaction_score IS 'STRING confidence score (0-1000 scale)';
COMMENT ON COLUMN string_edges.confidence_level IS 'Confidence category (low, medium, high)';
COMMENT ON COLUMN string_edges.interaction_type IS 'Type of interaction (physical, functional, etc.)';
COMMENT ON COLUMN string_edges.evidence_sources IS 'JSON array of evidence sources';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'STRING network tables created successfully!';
    RAISE NOTICE 'Tables: string_networks, string_nodes, string_edges';
    RAISE NOTICE 'Indexes: Performance-optimized indexes created';
    RAISE NOTICE 'Constraints: Data integrity constraints applied';
END $$;
