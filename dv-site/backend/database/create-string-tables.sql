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
    "geneSetHash" VARCHAR(64) NOT NULL,
    "geneSet" JSONB NOT NULL,
    "confidenceThreshold" INTEGER NOT NULL,
    "networkType" VARCHAR(50) NOT NULL DEFAULT 'full',
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "edgeCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedGeneCount" INTEGER NOT NULL DEFAULT 0,
    "isSuccessful" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create string_nodes table
CREATE TABLE IF NOT EXISTS string_nodes (
    id SERIAL PRIMARY KEY,
    "networkId" INTEGER NOT NULL REFERENCES string_networks(id) ON DELETE CASCADE,
    "stringId" VARCHAR(255) NOT NULL,
    "preferredName" VARCHAR(255) NOT NULL,
    annotation TEXT,
    log2fc DECIMAL(10,4),
    padj DECIMAL(10,8),
    expression VARCHAR(50),
    "functionalTerms" JSONB,
    "normalizedDegreeCentrality" DECIMAL(6,4),
    degree INTEGER
);

-- Create string_edges table
CREATE TABLE IF NOT EXISTS string_edges (
    id SERIAL PRIMARY KEY,
    "networkId" INTEGER NOT NULL REFERENCES string_networks(id) ON DELETE CASCADE,
    "sourceStringId" VARCHAR(255) NOT NULL,
    "sourceGeneName" VARCHAR(255) NOT NULL,
    "targetStringId" VARCHAR(255) NOT NULL,
    "targetGeneName" VARCHAR(255) NOT NULL,
    "interactionScore" DECIMAL(5,3) NOT NULL,
    "confidenceLevel" VARCHAR(20) NOT NULL,
    "interactionType" VARCHAR(50),
    "evidenceSources" JSONB
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Indexes for string_networks
CREATE INDEX IF NOT EXISTS idx_string_networks_comparison ON string_networks(comparison);
CREATE INDEX IF NOT EXISTS idx_string_networks_gene_set_hash ON string_networks("geneSetHash");
CREATE INDEX IF NOT EXISTS idx_string_networks_created_at ON string_networks("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS idx_string_networks_unique ON string_networks(comparison, "geneSetHash", "confidenceThreshold", "networkType");

-- Indexes for string_nodes
CREATE INDEX IF NOT EXISTS idx_string_nodes_network_id ON string_nodes("networkId");
CREATE INDEX IF NOT EXISTS idx_string_nodes_string_id ON string_nodes("stringId");
CREATE INDEX IF NOT EXISTS idx_string_nodes_preferred_name ON string_nodes("preferredName");
CREATE INDEX IF NOT EXISTS idx_string_nodes_expression ON string_nodes(expression);
CREATE INDEX IF NOT EXISTS idx_string_nodes_centrality ON string_nodes("normalizedDegreeCentrality");
CREATE UNIQUE INDEX IF NOT EXISTS idx_string_nodes_unique ON string_nodes("networkId", "stringId");

-- Indexes for string_edges
CREATE INDEX IF NOT EXISTS idx_string_edges_network_id ON string_edges("networkId");
CREATE INDEX IF NOT EXISTS idx_string_edges_source ON string_edges("sourceStringId");
CREATE INDEX IF NOT EXISTS idx_string_edges_target ON string_edges("targetStringId");
CREATE INDEX IF NOT EXISTS idx_string_edges_score ON string_edges("interactionScore");
CREATE INDEX IF NOT EXISTS idx_string_edges_confidence ON string_edges("confidenceLevel");
CREATE UNIQUE INDEX IF NOT EXISTS idx_string_edges_unique ON string_edges("networkId", "sourceStringId", "targetStringId");

-- ============================================================================
-- CONSTRAINTS FOR DATA INTEGRITY
-- ============================================================================

-- Constraints for string_networks
ALTER TABLE string_networks ADD CONSTRAINT chk_confidence_threshold 
    CHECK ("confidenceThreshold" >= 0 AND "confidenceThreshold" <= 1000);

ALTER TABLE string_networks ADD CONSTRAINT chk_node_count 
    CHECK ("nodeCount" >= 0);

ALTER TABLE string_networks ADD CONSTRAINT chk_edge_count 
    CHECK ("edgeCount" >= 0);

ALTER TABLE string_networks ADD CONSTRAINT chk_resolved_gene_count 
    CHECK ("resolvedGeneCount" >= 0);

-- Constraints for string_nodes
ALTER TABLE string_nodes ADD CONSTRAINT chk_padj_range 
    CHECK (padj IS NULL OR (padj >= 0 AND padj <= 1));

ALTER TABLE string_nodes ADD CONSTRAINT chk_centrality_range 
    CHECK ("normalizedDegreeCentrality" IS NULL OR ("normalizedDegreeCentrality" >= 0 AND "normalizedDegreeCentrality" <= 1));

ALTER TABLE string_nodes ADD CONSTRAINT chk_degree_positive 
    CHECK (degree IS NULL OR degree >= 0);

-- Constraints for string_edges
ALTER TABLE string_edges ADD CONSTRAINT chk_interaction_score_range 
    CHECK ("interactionScore" >= 0 AND "interactionScore" <= 1000);

ALTER TABLE string_edges ADD CONSTRAINT chk_confidence_level 
    CHECK ("confidenceLevel" IN ('low', 'medium', 'high'));

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE string_networks IS 'Metadata for STRING protein-protein interaction networks';
COMMENT ON COLUMN string_networks.comparison IS 'Dataset comparison name (e.g., eIF5A_DDvsWT_EC)';
COMMENT ON COLUMN string_networks."geneSetHash" IS 'Hash of gene set for deduplication and caching';
COMMENT ON COLUMN string_networks."geneSet" IS 'JSON array of gene names used in network';
COMMENT ON COLUMN string_networks."confidenceThreshold" IS 'STRING API confidence threshold (0-1000 scale)';
COMMENT ON COLUMN string_networks."networkType" IS 'STRING API network type (full, physical, functional)';

COMMENT ON TABLE string_nodes IS 'Individual proteins/genes in STRING networks';
COMMENT ON COLUMN string_nodes."stringId" IS 'STRING database identifier';
COMMENT ON COLUMN string_nodes."preferredName" IS 'Gene name for display';
COMMENT ON COLUMN string_nodes.annotation IS 'Gene function annotation from STRING';
COMMENT ON COLUMN string_nodes.log2fc IS 'Log2 fold change from RNA-seq analysis';
COMMENT ON COLUMN string_nodes.padj IS 'Adjusted p-value from RNA-seq analysis';
COMMENT ON COLUMN string_nodes.expression IS 'Expression direction (upregulated, downregulated, unchanged)';
COMMENT ON COLUMN string_nodes."functionalTerms" IS 'JSON array of functional terms and descriptions';
COMMENT ON COLUMN string_nodes."normalizedDegreeCentrality" IS 'Network centrality measure (0-1 scale)';

COMMENT ON TABLE string_edges IS 'Protein-protein interactions in STRING networks';
COMMENT ON COLUMN string_edges."sourceStringId" IS 'STRING ID of source protein';
COMMENT ON COLUMN string_edges."targetStringId" IS 'STRING ID of target protein';
COMMENT ON COLUMN string_edges."interactionScore" IS 'STRING confidence score (0-1000 scale)';
COMMENT ON COLUMN string_edges."confidenceLevel" IS 'Confidence category (low, medium, high)';
COMMENT ON COLUMN string_edges."interactionType" IS 'Type of interaction (physical, functional, etc.)';
COMMENT ON COLUMN string_edges."evidenceSources" IS 'JSON array of evidence sources';

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
