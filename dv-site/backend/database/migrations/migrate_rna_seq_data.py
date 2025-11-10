#!/usr/bin/env python3
"""
RNA-seq Data Migration Script
Migrates CSV data from your graphs directory to PostgreSQL database
Creates separate tables for each comparison

Usage:
    python migrate_rna_seq_data.py [comparison_name]
    python migrate_rna_seq_data.py --all  # Migrate all available comparisons
    
Example:
    python migrate_rna_seq_data.py eIF5A_DDvsWT_EC
    python migrate_rna_seq_data.py --all
"""

import argparse
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import sys
from pathlib import Path
from schema_definitions import (
    get_create_table_sql,
    get_create_indexes_sql,
    get_grant_permissions_sql,
    get_insert_sql,
    get_count_rows_sql
)

# Database connection settings
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5431)),
    'database': os.getenv('DB_NAME', 'gene_visualizations'),
    'user': os.getenv('DB_USERNAME', 'gene_admin'),
    'password': os.getenv('DB_PASSWORD', 'gene_password_2024'),
    'sslmode': os.getenv('DB_SSLMODE', 'prefer')
}


def configure_db_from_args(args: argparse.Namespace):
    """Update DB config using CLI arguments."""
    DB_CONFIG['host'] = args.host
    DB_CONFIG['port'] = args.port
    DB_CONFIG['database'] = args.database
    DB_CONFIG['user'] = args.user
    DB_CONFIG['password'] = args.password
    DB_CONFIG['sslmode'] = args.sslmode

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            sslmode=DB_CONFIG['sslmode']
        )
        print("✅ Successfully connected to database")
        return conn
    except psycopg2.Error as e:
        print(f"❌ Error connecting to database: {e}")
        sys.exit(1)

def create_comparison_table(conn, comparison_name, columns=None):
    """Create a table for a specific comparison using schema definitions"""
    
    try:
        cursor = conn.cursor()
        
        # Create table using schema definitions with dynamic columns
        create_table_sql = get_create_table_sql(comparison_name, columns)
        cursor.execute(create_table_sql)
        print(f"✅ Created table '{comparison_name}' with {len(columns) if columns else 'default'} columns")
        
        # Create indexes using schema definitions
        create_indexes_sql = get_create_indexes_sql(comparison_name)
        cursor.execute(create_indexes_sql)
        print(f"✅ Created indexes for '{comparison_name}'")
        
        # Grant permissions using schema definitions
        grant_sql = get_grant_permissions_sql(comparison_name)
        cursor.execute(grant_sql)
        
        conn.commit()
        cursor.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error creating table '{comparison_name}': {e}")
        conn.rollback()
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
    """Map CSV column names to database column names dynamically"""
    
    # Start with a copy of the dataframe
    df_renamed = df.copy()
    
    # Create a dynamic column mapping
    column_mapping = {}
    
    for col in df.columns:
        col_lower = col.lower()
        
        # Standard mappings that are always the same
        if col == 'log2FoldChange':
            column_mapping[col] = 'log2foldchange'
        elif col == '-log10(padj)':
            column_mapping[col] = 'log10_padj'
        else:
            # For all other columns, just convert to lowercase
            # This handles dynamic SHEF sample names and other columns
            column_mapping[col] = col_lower
    
    # Rename columns to match database schema
    df_renamed = df_renamed.rename(columns=column_mapping)
    
    return df_renamed

def insert_data_to_database(conn, df, comparison_name):
    """Insert data into PostgreSQL database using schema definitions"""
    
    # Prepare the INSERT statement using schema definitions
    columns = list(df.columns)
    insert_sql = get_insert_sql(comparison_name, columns)
    
    try:
        cursor = conn.cursor()
        
        print(f"🔄 Inserting {len(df)} rows into '{comparison_name}' table...")
        
        # Convert DataFrame to list of tuples for batch insert
        data_tuples = [tuple(row) for row in df.values]
        
        # Execute batch insert
        cursor.executemany(insert_sql, data_tuples)
        
        # Commit the transaction
        conn.commit()
        
        print(f"✅ Successfully inserted {len(df)} rows")
        
        # Get count of total rows using schema definitions
        count_sql = get_count_rows_sql(comparison_name)
        cursor.execute(count_sql)
        total_count = cursor.fetchone()[0]
        print(f"📊 Total rows in '{comparison_name}': {total_count}")
        
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

def migrate_single_comparison(comparison_name):
    """Migrate a single comparison to its own table"""
    print(f"\n🔄 Migrating {comparison_name}...")
    print("-" * 40)
    
    # Construct CSV file path
    csv_path = Path(f"../../src/graphs/{comparison_name}/{comparison_name}.DEG.all.csv")
    
    # Check if file exists
    if not csv_path.exists():
        print(f"❌ CSV file not found: {csv_path}")
        return False
    
    # Connect to database
    conn = connect_to_database()
    
    try:
        # Read CSV file first to get column structure
        df = read_csv_file(csv_path)
        
        # Create table for this comparison with dynamic columns
        create_comparison_table(conn, comparison_name, list(df.columns))
        
        # Map columns to database schema
        df_mapped = map_csv_to_database_columns(df)
        
        # Insert data into database
        insert_data_to_database(conn, df_mapped, comparison_name)
        
        return True
        
    except Exception as e:
        print(f"❌ Error migrating {comparison_name}: {e}")
        return False
    finally:
        conn.close()
        print("🔌 Database connection closed")

def parse_args():
    parser = argparse.ArgumentParser(description="Migrate RNA-seq CSV data into PostgreSQL tables.")
    parser.add_argument('comparison', nargs='?', help="Specific comparison name to migrate")
    parser.add_argument('--all', action='store_true', help="Migrate all available comparisons")
    parser.add_argument('--host', default=DB_CONFIG['host'], help="Database host")
    parser.add_argument('--port', type=int, default=DB_CONFIG['port'], help="Database port")
    parser.add_argument('--database', default=DB_CONFIG['database'], help="Database name")
    parser.add_argument('--user', default=DB_CONFIG['user'], help="Database user")
    parser.add_argument('--password', default=DB_CONFIG['password'], help="Database password")
    parser.add_argument('--sslmode', default=DB_CONFIG['sslmode'], help="PostgreSQL sslmode (disable, allow, prefer, require, verify-full)")
    return parser.parse_args()


def main():
    """Main migration function"""
    print("🚀 Starting RNA-seq Data Migration (Individual Tables)")
    print("=" * 60)

    args = parse_args()
    configure_db_from_args(args)
    
    # Check for --all flag
    if args.all:
        print("📋 Migrating ALL available comparisons...")
        
        # Get all available comparisons
        available = get_available_comparisons()
        if not available:
            print("❌ No comparison directories found with CSV files")
            sys.exit(1)
        
        print(f"Found {len(available)} comparisons to migrate:")
        for i, comp in enumerate(available, 1):
            print(f"  {i}. {comp}")
        
        # Migrate each comparison
        successful = 0
        failed = 0
        
        for comparison_name in available:
            if migrate_single_comparison(comparison_name):
                successful += 1
            else:
                failed += 1
        
        print(f"\n🎉 Migration Summary:")
        print(f"   ✅ Successful: {successful}")
        print(f"   ❌ Failed: {failed}")
        print(f"   📊 Total: {len(available)}")
        
    else:
        # Migrate single comparison
        if args.comparison:
            comparison_name = args.comparison
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
        
        # Migrate single comparison
        if migrate_single_comparison(comparison_name):
            print(f"\n🎉 Migration of '{comparison_name}' completed successfully!")
            print("   You can now view the data in DBeaver:")
            print("   1. Refresh your database connection")
            print("   2. Navigate to Tables")
            print(f"   3. Look for table '{comparison_name}'")
            print("   4. Right-click → View Data")
        else:
            print(f"\n❌ Migration of '{comparison_name}' failed!")
            sys.exit(1)

if __name__ == "__main__":
    main()
