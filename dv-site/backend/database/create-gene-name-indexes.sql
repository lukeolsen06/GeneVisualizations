-- Create indexes on gene_name column for all RNA-seq comparison tables
-- This will significantly speed up ILIKE searches on gene names
-- 
-- Index Type: B-tree with text_pattern_ops
-- - B-tree: Standard PostgreSQL index (good for equality and range queries)
-- - text_pattern_ops: Optimizes LIKE/ILIKE pattern matching
--
-- Performance Impact:
-- - Search queries: 10-100x faster on large datasets
-- - Index size: ~5-10% of table size
-- - Insert/Update: Slightly slower (usually negligible)

-- Create indexes for all comparison tables
CREATE INDEX IF NOT EXISTS idx_dhs_dohhvswt_ec_gene_name ON "DHS_DOHHvsWT_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_k50a_ddvsdhs_dohh_gene_name ON "K50A_DDvsDHS_DOHH" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_k50a_ddvstar4_ec_gene_name ON "K50A_DDvsTar4_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_k50a_ddvswt_ec_gene_name ON "K50A_DDvsWT_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_tar4_ecvswt_ec_gene_name ON "Tar4_ECvsWT_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5a_ddvsdhs_dohh_gene_name ON "eIF5A_DDvsDHS_DOHH" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5a_ddvsk50a_dd_gene_name ON "eIF5A_DDvsK50A_DD" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5a_ddvstar4_ec_gene_name ON "eIF5A_DDvsTar4_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5a_ddvswt_ec_gene_name ON "eIF5A_DDvsWT_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5a_ddvseif5a_gene_name ON "eIF5A_DDvseIF5A" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5avstar4_ec_gene_name ON "eIF5AvsTar4_EC" (gene_name text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_eif5avswt_ec_gene_name ON "eIF5AvsWT_EC" (gene_name text_pattern_ops);

-- Verify indexes were created
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%_gene_name'
ORDER BY tablename;

