#!/usr/bin/env python3
"""
RNA-seq Data Migration Script
Migrates CSV data from your graphs directory to PostgreSQL database

Usage:
    python migrate_rna_seq_data.py [comparison_name]
    
Example:
    python migrate_rna_seq_data.py eIF5A_DDvsWT_EC
"""

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import sys
from pathlib import Path

# Database connection settings
DB_CONFIG = {
    'host': 'localhost',
    'port': 5431,
    'database': 'gene_visualizations',
    'user': 'gene_admin',
    'password': 'gene_password_2024'
}

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ Successfully connected to database")
        return conn
    except psycopg2.Error as e:
        print(f"❌ Error connecting to database: {e}")
        sys.exit(1)

def read_csv_file(csv_path):
    """Read and prepare CSV data for database insertion"""
    try:
        print(f"📖 Reading CSV file: {csv_path}")
        df = pd.read_csv(csv_path)
        print(f"   Found {len(df)} rows and {len(df.columns)} columns")
        
        # Display first few column names to verify structure
        print(f"   Sample columns: {list(df.columns[:5])}...")
        
        return df
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        sys.exit(1)

def map_csv_to_database_columns(df):
    """Map CSV column names to database column names"""
    
    # Column mapping from CSV headers to database columns
    column_mapping = {
        # Gene information
        'gene_id': 'gene_id',
        'gene_name': 'gene_name',
        'gene_chr': 'gene_chr',
        'gene_start': 'gene_start',
        'gene_end': 'gene_end',
        'gene_strand': 'gene_strand',
        'gene_length': 'gene_length',
        'gene_biotype': 'gene_biotype',
        'gene_description': 'gene_description',
        'tf_family': 'tf_family',
        
        # Expression values (SHEF samples)
        'SHEF21': 'shef21',
        'SHEF22': 'shef22',
        'SHEF24': 'shef24',
        'SHEF25': 'shef25',
        'SHEF1': 'shef1',
        'SHEF2': 'shef2',
        'SHEF3': 'shef3',
        'SHEF4': 'shef4',
        'SHEF5': 'shef5',
        
        # Statistical analysis
        'log2FoldChange': 'log2foldchange',
        'pvalue': 'pvalue',
        'padj': 'padj',
        '-log10(padj)': 'log10_padj',
        
        # Read counts
        'SHEF21_readcount': 'shef21_readcount',
        'SHEF22_readcount': 'shef22_readcount',
        'SHEF24_readcount': 'shef24_readcount',
        'SHEF25_readcount': 'shef25_readcount',
        'SHEF1_readcount': 'shef1_readcount',
        'SHEF2_readcount': 'shef2_readcount',
        'SHEF3_readcount': 'shef3_readcount',
        'SHEF4_readcount': 'shef4_readcount',
        'SHEF5_readcount': 'shef5_readcount',
        
        # FPKM values
        'SHEF21_fpkm': 'shef21_fpkm',
        'SHEF22_fpkm': 'shef22_fpkm',
        'SHEF24_fpkm': 'shef24_fpkm',
        'SHEF25_fpkm': 'shef25_fpkm',
        'SHEF1_fpkm': 'shef1_fpkm',
        'SHEF2_fpkm': 'shef2_fpkm',
        'SHEF3_fpkm': 'shef3_fpkm',
        'SHEF4_fpkm': 'shef4_fpkm',
        'SHEF5_fpkm': 'shef5_fpkm',
    }
    
    # Rename columns to match database schema
    df_renamed = df.rename(columns=column_mapping)
    
    return df_renamed

def insert_data_to_database(conn, df, comparison_name):
    """Insert data into PostgreSQL database"""
    
    # Add comparison_name column to the dataframe
    df['comparison_name'] = comparison_name
    
    # Prepare the INSERT statement
    columns = list(df.columns)
    placeholders = ', '.join(['%s'] * len(columns))
    column_names = ', '.join(columns)
    
    insert_sql = f"""
    INSERT INTO rna_seq_data ({column_names})
    VALUES ({placeholders})
    ON CONFLICT (gene_id) DO UPDATE SET
        gene_name = EXCLUDED.gene_name,
        comparison_name = EXCLUDED.comparison_name
    """
    
    try:
        cursor = conn.cursor()
        
        print(f"🔄 Inserting {len(df)} rows into database...")
        
        # Convert DataFrame to list of tuples for batch insert
        data_tuples = [tuple(row) for row in df.values]
        
        # Execute batch insert
        cursor.executemany(insert_sql, data_tuples)
        
        # Commit the transaction
        conn.commit()
        
        print(f"✅ Successfully inserted {len(df)} rows")
        
        # Get count of total rows
        cursor.execute("SELECT COUNT(*) FROM rna_seq_data WHERE comparison_name = %s", (comparison_name,))
        total_count = cursor.fetchone()[0]
        print(f"📊 Total rows for {comparison_name}: {total_count}")
        
        cursor.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error inserting data: {e}")
        conn.rollback()
        sys.exit(1)

def get_available_comparisons():
    """Get list of available comparison directories"""
    graphs_dir = Path("../../src/graphs")
    if not graphs_dir.exists():
        return []
    
    comparisons = []
    for item in graphs_dir.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            # Check if it has CSV files
            csv_files = list(item.glob("*.csv"))
            if csv_files:
                comparisons.append(item.name)
    
    return sorted(comparisons)

def main():
    """Main migration function"""
    print("🚀 Starting RNA-seq Data Migration")
    print("=" * 50)
    
    # Get comparison name from command line argument or use default
    if len(sys.argv) > 1:
        comparison_name = sys.argv[1]
    else:
        # Show available comparisons
        available = get_available_comparisons()
        if not available:
            print("❌ No comparison directories found with CSV files")
            sys.exit(1)
        
        print("Available comparisons:")
        for i, comp in enumerate(available, 1):
            print(f"  {i}. {comp}")
        
        print(f"\nUsing default: {available[0]}")
        comparison_name = available[0]
    
    # Construct CSV file path
    csv_path = Path(f"../../src/graphs/{comparison_name}/{comparison_name}.DEG.all.csv")
    
    # Check if file exists
    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        print(f"   Looking for: {comparison_name}.DEG.all.csv")
        sys.exit(1)
    
    # Connect to database
    conn = connect_to_database()
    
    try:
        # Read CSV file
        df = read_csv_file(csv_path)
        
        # Map columns to database schema
        df_mapped = map_csv_to_database_columns(df)
        
        # Insert data into database
        insert_data_to_database(conn, df_mapped, comparison_name)
        
        print("\n🎉 Migration completed successfully!")
        print("   You can now view the data in DBeaver:")
        print("   1. Refresh your database connection")
        print("   2. Navigate to Tables → rna_seq_data")
        print("   3. Right-click → View Data")
        print(f"   4. Filter by comparison_name = '{comparison_name}'")
        
    finally:
        conn.close()
        print("🔌 Database connection closed")

if __name__ == "__main__":
    main()
