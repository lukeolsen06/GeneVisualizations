-- RNA-seq Database Schema
-- This script creates tables that match the CSV file structure exactly

-- Create a table for RNA-seq differential expression data
CREATE TABLE IF NOT EXISTS rna_seq_data (
    -- Gene identification
    gene_id VARCHAR(50) PRIMARY KEY,
    gene_name VARCHAR(100),
    gene_chr VARCHAR(10),
    gene_start BIGINT,
    gene_end BIGINT,
    gene_strand VARCHAR(1),
    gene_length INTEGER,
    gene_biotype VARCHAR(50),
    gene_description TEXT,
    tf_family VARCHAR(50),
    
    -- Sample expression values (SHEF samples)
    shef21 DOUBLE PRECISION,
    shef22 DOUBLE PRECISION,
    shef24 DOUBLE PRECISION,
    shef25 DOUBLE PRECISION,
    shef1 DOUBLE PRECISION,
    shef2 DOUBLE PRECISION,
    shef3 DOUBLE PRECISION,
    shef4 DOUBLE PRECISION,
    shef5 DOUBLE PRECISION,
    
    -- Statistical analysis results
    log2foldchange DOUBLE PRECISION,
    pvalue DOUBLE PRECISION,
    padj DOUBLE PRECISION,
    log10_padj DOUBLE PRECISION,
    
    -- Read counts for each sample
    shef21_readcount INTEGER,
    shef22_readcount INTEGER,
    shef24_readcount INTEGER,
    shef25_readcount INTEGER,
    shef1_readcount INTEGER,
    shef2_readcount INTEGER,
    shef3_readcount INTEGER,
    shef4_readcount INTEGER,
    shef5_readcount INTEGER,
    
    -- FPKM values for each sample
    shef21_fpkm DOUBLE PRECISION,
    shef22_fpkm DOUBLE PRECISION,
    shef24_fpkm DOUBLE PRECISION,
    shef25_fpkm DOUBLE PRECISION,
    shef1_fpkm DOUBLE PRECISION,
    shef2_fpkm DOUBLE PRECISION,
    shef3_fpkm DOUBLE PRECISION,
    shef4_fpkm DOUBLE PRECISION,
    shef5_fpkm DOUBLE PRECISION,
    
    -- Metadata
    comparison_name VARCHAR(100), -- e.g., 'eIF5A_DDvsWT_EC'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rna_seq_gene_name ON rna_seq_data(gene_name);
CREATE INDEX IF NOT EXISTS idx_rna_seq_chromosome ON rna_seq_data(gene_chr);
CREATE INDEX IF NOT EXISTS idx_rna_seq_comparison ON rna_seq_data(comparison_name);
CREATE INDEX IF NOT EXISTS idx_rna_seq_padj ON rna_seq_data(padj);
CREATE INDEX IF NOT EXISTS idx_rna_seq_log2fc ON rna_seq_data(log2foldchange);

-- Create a table to track different comparisons
CREATE TABLE IF NOT EXISTS comparisons (
    id SERIAL PRIMARY KEY,
    comparison_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some example comparisons (you can modify these)
INSERT INTO comparisons (comparison_name, description) VALUES 
    ('eIF5A_DDvsWT_EC', 'eIF5A DD vs Wild Type EC comparison'),
    ('DHS_DOHHvsWT_EC', 'DHS DOHH vs Wild Type EC comparison'),
    ('K50A_DDvsTar4_EC', 'K50A DD vs Tar4 EC comparison')
ON CONFLICT (comparison_name) DO NOTHING;

-- Create a view for easier querying of significant genes
CREATE OR REPLACE VIEW significant_genes AS
SELECT 
    gene_id,
    gene_name,
    gene_chr,
    gene_start,
    gene_end,
    gene_strand,
    gene_biotype,
    gene_description,
    log2foldchange,
    pvalue,
    padj,
    comparison_name,
    CASE 
        WHEN padj < 0.05 AND log2foldchange > 1 THEN 'Upregulated'
        WHEN padj < 0.05 AND log2foldchange < -1 THEN 'Downregulated'
        ELSE 'Not Significant'
    END as significance_status
FROM rna_seq_data
WHERE padj IS NOT NULL AND log2foldchange IS NOT NULL;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO gene_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO gene_admin;
