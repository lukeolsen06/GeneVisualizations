#!/usr/bin/env python3
"""
SQL Schema Definitions for RNA-seq Data Migration
Contains table creation SQL and related database operations
"""

def get_create_table_sql(comparison_name, columns=None):
    """Get the CREATE TABLE SQL for a specific comparison with dynamic columns"""
    
    # Base columns that are always present
    base_columns = [
        "-- Gene identification",
        "gene_id VARCHAR(50) PRIMARY KEY",
        "gene_name VARCHAR(100)",
        "gene_chr VARCHAR(10)",
        "gene_start BIGINT",
        "gene_end BIGINT",
        "gene_strand VARCHAR(1)",
        "gene_length INTEGER",
        "gene_biotype VARCHAR(50)",
        "gene_description TEXT",
        "tf_family VARCHAR(50)",
        "",
        "-- Statistical analysis results",
        "log2foldchange DOUBLE PRECISION",
        "pvalue DOUBLE PRECISION",
        "padj DOUBLE PRECISION",
        "log10_padj DOUBLE PRECISION",
        "",
        "-- Metadata",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    ]
    
    # If columns are provided, add dynamic columns for samples
    if columns:
        sample_columns = []
        readcount_columns = []
        fpkm_columns = []
        
        for col in columns:
            col_lower = col.lower()
            if col_lower.startswith('shef') and not any(suffix in col_lower for suffix in ['_readcount', '_fpkm', 'readcount', 'fpkm']):
                # Expression values
                sample_columns.append(f"{col_lower} DOUBLE PRECISION")
            elif '_readcount' in col_lower or col_lower.endswith('readcount'):
                # Read counts
                readcount_columns.append(f"{col_lower} INTEGER")
            elif '_fpkm' in col_lower or col_lower.endswith('fpkm'):
                # FPKM values
                fpkm_columns.append(f"{col_lower} DOUBLE PRECISION")
        
        # Combine all columns in logical order
        all_columns = []
        all_columns.extend(base_columns[:10])  # Gene identification
        
        if sample_columns:
            all_columns.append("")
            all_columns.append("-- Sample expression values")
            all_columns.extend(sample_columns)
        
        all_columns.extend(base_columns[10:16])  # Statistical analysis
        
        if readcount_columns:
            all_columns.append("")
            all_columns.append("-- Read counts for each sample")
            all_columns.extend(readcount_columns)
        
        if fpkm_columns:
            all_columns.append("")
            all_columns.append("-- FPKM values for each sample")
            all_columns.extend(fpkm_columns)
        
        all_columns.extend(base_columns[16:])  # Metadata
        
        # Filter out empty strings and comments for the actual SQL
        sql_columns = [col for col in all_columns if col and not col.startswith('--')]
    else:
        # Default columns if none provided (fallback to original schema)
        sql_columns = [
            "gene_id VARCHAR(50) PRIMARY KEY",
            "gene_name VARCHAR(100)",
            "gene_chr VARCHAR(10)",
            "gene_start BIGINT",
            "gene_end BIGINT",
            "gene_strand VARCHAR(1)",
            "gene_length INTEGER",
            "gene_biotype VARCHAR(50)",
            "gene_description TEXT",
            "tf_family VARCHAR(50)",
            "shef21 DOUBLE PRECISION",
            "shef22 DOUBLE PRECISION",
            "shef24 DOUBLE PRECISION",
            "shef25 DOUBLE PRECISION",
            "shef1 DOUBLE PRECISION",
            "shef2 DOUBLE PRECISION",
            "shef3 DOUBLE PRECISION",
            "shef4 DOUBLE PRECISION",
            "shef5 DOUBLE PRECISION",
            "log2foldchange DOUBLE PRECISION",
            "pvalue DOUBLE PRECISION",
            "padj DOUBLE PRECISION",
            "log10_padj DOUBLE PRECISION",
            "shef21_readcount INTEGER",
            "shef22_readcount INTEGER",
            "shef24_readcount INTEGER",
            "shef25_readcount INTEGER",
            "shef1_readcount INTEGER",
            "shef2_readcount INTEGER",
            "shef3_readcount INTEGER",
            "shef4_readcount INTEGER",
            "shef5_readcount INTEGER",
            "shef21_fpkm DOUBLE PRECISION",
            "shef22_fpkm DOUBLE PRECISION",
            "shef24_fpkm DOUBLE PRECISION",
            "shef25_fpkm DOUBLE PRECISION",
            "shef1_fpkm DOUBLE PRECISION",
            "shef2_fpkm DOUBLE PRECISION",
            "shef3_fpkm DOUBLE PRECISION",
            "shef4_fpkm DOUBLE PRECISION",
            "shef5_fpkm DOUBLE PRECISION",
            "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        ]
    
    columns_sql = ",\n        ".join(sql_columns)
    
    return f"""
    CREATE TABLE IF NOT EXISTS "{comparison_name}" (
        {columns_sql}
    );
    """

def get_create_indexes_sql(comparison_name):
    """Get the CREATE INDEX SQL for a specific comparison"""
    
    return f"""
    CREATE INDEX IF NOT EXISTS idx_{comparison_name.lower()}_gene_name ON "{comparison_name}"(gene_name);
    CREATE INDEX IF NOT EXISTS idx_{comparison_name.lower()}_chromosome ON "{comparison_name}"(gene_chr);
    CREATE INDEX IF NOT EXISTS idx_{comparison_name.lower()}_padj ON "{comparison_name}"(padj);
    CREATE INDEX IF NOT EXISTS idx_{comparison_name.lower()}_log2fc ON "{comparison_name}"(log2foldchange);
    """

def get_grant_permissions_sql(comparison_name):
    """Get the GRANT permissions SQL for a specific comparison"""
    
    return f'GRANT ALL PRIVILEGES ON TABLE "{comparison_name}" TO gene_admin;'

def get_insert_sql(comparison_name, columns):
    """Get the INSERT SQL for a specific comparison table"""
    
    column_names = ', '.join(columns)
    placeholders = ', '.join(['%s'] * len(columns))
    
    return f"""
    INSERT INTO "{comparison_name}" ({column_names})
    VALUES ({placeholders})
    ON CONFLICT (gene_id) DO UPDATE SET
        gene_name = EXCLUDED.gene_name
    """

def get_count_rows_sql(comparison_name):
    """Get the COUNT SQL for a specific comparison table"""
    
    return f'SELECT COUNT(*) FROM "{comparison_name}"'

def get_table_exists_sql(comparison_name):
    """Check if a table exists"""
    
    return f"""
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '{comparison_name}'
    );
    """
