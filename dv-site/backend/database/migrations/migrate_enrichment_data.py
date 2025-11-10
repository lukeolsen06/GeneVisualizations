#!/usr/bin/env python3
"""
================================================================================
Enrichment Data Migration Script
================================================================================

Purpose:
    Migrate gene enrichment analysis data from static JSON files to PostgreSQL.
    This enables dynamic API-based access instead of bundling all data in the
    frontend application.

Source Data:
    - Location: dv-site/src/barCharts/**/enrichment.*.json
    - Format: JSON arrays of enrichment pathway objects
    - Databases: KEGG, Reactome (RCTM), WikiPathways
    - Comparisons: ~13 dataset comparisons (e.g., eIF5A_DDvsWT_EC)

Target:
    - Table: enrichment_data
    - Database: gene_visualizations (PostgreSQL)
    - Records: ~2,000 enrichment pathway records

Usage:
    python3 migrate_enrichment_data.py [--dry-run] [--verbose]

Options:
    --dry-run    : Parse files and show what would be inserted (no DB writes)
    --verbose    : Show detailed progress information
    --clear      : Clear existing enrichment data before inserting

Examples:
    # Test without writing to database
    python3 migrate_enrichment_data.py --dry-run --verbose
    
    # Actually migrate the data
    python3 migrate_enrichment_data.py
    
    # Clear and re-migrate
    python3 migrate_enrichment_data.py --clear

================================================================================
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime

# Database imports
try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extras import execute_batch
except ImportError:
    print("Error: psycopg2 not installed.")
    print("Install it with: pip install psycopg2-binary")
    sys.exit(1)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Database connection settings
# These should match your docker-compose.yml settings
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 5431)),  # External port from docker-compose
    'database': os.getenv('DB_NAME', 'gene_visualizations'),
    'user': os.getenv('DB_USERNAME', 'gene_admin'),
    'password': os.getenv('DB_PASSWORD', 'gene_password_2024'),
    'sslmode': os.getenv('DB_SSLMODE', 'prefer')
}

# Path to the source JSON files (relative to script location)
# This assumes the script is in: backend/database/
# And JSON files are in: dv-site/src/barCharts/
SOURCE_DIR = Path(__file__).parent.parent.parent.parent / 'src' / 'barCharts'

# Database name mapping
# Maps filename patterns to standardized database names
DATABASE_MAPPING = {
    'KEGG': 'KEGG',
    'RCTM': 'Reactome',          # RCTM files are actually Reactome
    'WikiPathways': 'WikiPathways'
}

# ============================================================================
# DATABASE CONNECTION
# ============================================================================

def configure_db_from_args(args: argparse.Namespace):
    """Override DB config using CLI arguments."""
    DB_CONFIG['host'] = args.host
    DB_CONFIG['port'] = args.port
    DB_CONFIG['database'] = args.database
    DB_CONFIG['user'] = args.user
    DB_CONFIG['password'] = args.password
    DB_CONFIG['sslmode'] = args.sslmode


def get_db_connection():
    """
    Create and return a PostgreSQL database connection.
    
    Returns:
        psycopg2.connection: Active database connection
        
    Raises:
        psycopg2.Error: If connection fails
    """
    try:
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            sslmode=DB_CONFIG['sslmode']
        )
        return conn
    except psycopg2.Error as e:
        print(f"❌ Failed to connect to database: {e}")
        print(f"   Config: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
        sys.exit(1)

# ============================================================================
# FILE SCANNING
# ============================================================================

def find_enrichment_files(base_dir: Path, verbose: bool = False) -> List[Dict[str, Any]]:
    """
    Scan the source directory for enrichment JSON files.
    
    Expected file structure:
        barCharts/
        ├── DHS_DOHHvsTar4_EC/
        │   ├── enrichment.KEGG.json
        │   ├── enrichment.RCTM.json
        │   └── enrichment.WikiPathways.json
        ├── eIF5A_DDvsWT_EC/
        │   └── ...
        
    Args:
        base_dir: Path to the barCharts directory
        verbose: Print detailed progress information
        
    Returns:
        List of dicts containing file metadata:
        [
            {
                'path': Path object,
                'comparison': 'eIF5A_DDvsWT_EC',
                'database': 'KEGG'
            },
            ...
        ]
    """
    if not base_dir.exists():
        print(f"❌ Source directory not found: {base_dir}")
        sys.exit(1)
    
    files = []
    
    # Scan all subdirectories for enrichment.*.json files
    for comparison_dir in base_dir.iterdir():
        if not comparison_dir.is_dir():
            continue
            
        # Skip directories that don't look like dataset comparisons
        # (e.g., skip 'testNetwork' directory)
        if 'test' in comparison_dir.name.lower():
            if verbose:
                print(f"   Skipping test directory: {comparison_dir.name}")
            continue
        
        comparison_name = comparison_dir.name
        
        # Look for enrichment JSON files
        for json_file in comparison_dir.glob('enrichment.*.json'):
            # Extract database name from filename
            # e.g., "enrichment.KEGG.json" -> "KEGG"
            filename_parts = json_file.stem.split('.')
            if len(filename_parts) != 2:
                if verbose:
                    print(f"   Skipping file with unexpected name: {json_file.name}")
                continue
            
            raw_database = filename_parts[1]
            
            # Map to standardized database name
            database = DATABASE_MAPPING.get(raw_database, raw_database)
            
            files.append({
                'path': json_file,
                'comparison': comparison_name,
                'database': database
            })
            
            if verbose:
                print(f"   Found: {comparison_name} / {database}")
    
    return files

# ============================================================================
# DATA PARSING
# ============================================================================

def parse_enrichment_file(file_info: Dict[str, Any], verbose: bool = False) -> List[Dict[str, Any]]:
    """
    Parse a single enrichment JSON file into database records.
    
    Input JSON structure:
        [
            {
                "#term ID": "mmu03010",
                "term description": "Ribosome",
                "genes mapped": 73,
                "enrichment score": 1.47706,
                "direction": "bottom",
                "false discovery rate": 5.84e-24,
                "method": "ks",
                "matching proteins in your input (IDs)": "10090.ENSMUSP...",
                "matching proteins in your input (labels)": "Rpl13,Mrpl2,..."
            },
            ...
        ]
    
    Args:
        file_info: Dict with 'path', 'comparison', 'database'
        verbose: Print detailed progress
        
    Returns:
        List of dicts ready for database insertion
    """
    path = file_info['path']
    comparison = file_info['comparison']
    database = file_info['database']
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {path}: {e}")
        return []
    except Exception as e:
        print(f"❌ Error reading {path}: {e}")
        return []
    
    if not isinstance(data, list):
        print(f"❌ Expected array in {path}, got {type(data)}")
        return []
    
    records = []
    
    for item in data:
        try:
            # Map JSON keys to database columns
            record = {
                'comparison': comparison,
                'database': database,
                'term_id': item.get('#term ID', ''),
                'term_description': item.get('term description', ''),
                'genes_mapped': item.get('genes mapped', 0),
                'enrichment_score': item.get('enrichment score', 0.0),
                'direction': item.get('direction', ''),
                'false_discovery_rate': item.get('false discovery rate', 1.0),
                'method': item.get('method', ''),
                'matching_protein_ids': item.get('matching proteins in your input (IDs)', ''),
                'matching_protein_labels': item.get('matching proteins in your input (labels)', '')
            }
            
            # Validate required fields
            if not record['term_id'] or not record['term_description']:
                if verbose:
                    print(f"   Skipping record with missing term_id or description")
                continue
            
            records.append(record)
            
        except Exception as e:
            if verbose:
                print(f"   Error parsing record in {path}: {e}")
            continue
    
    return records

# ============================================================================
# DATA INSERTION
# ============================================================================

def insert_enrichment_data(conn, records: List[Dict[str, Any]], verbose: bool = False):
    """
    Insert enrichment records into the database.
    
    Uses batch insertion for performance.
    
    Args:
        conn: psycopg2 connection
        records: List of enrichment records to insert
        verbose: Print detailed progress
        
    Returns:
        Number of records successfully inserted
    """
    if not records:
        return 0
    
    cursor = conn.cursor()
    
    # SQL insert statement
    insert_query = """
        INSERT INTO enrichment_data (
            comparison, database, term_id, term_description,
            genes_mapped, enrichment_score, direction,
            false_discovery_rate, method,
            matching_protein_ids, matching_protein_labels
        ) VALUES (
            %(comparison)s, %(database)s, %(term_id)s, %(term_description)s,
            %(genes_mapped)s, %(enrichment_score)s, %(direction)s,
            %(false_discovery_rate)s, %(method)s,
            %(matching_protein_ids)s, %(matching_protein_labels)s
        )
        ON CONFLICT (comparison, database, term_id) DO UPDATE SET
            term_description = EXCLUDED.term_description,
            genes_mapped = EXCLUDED.genes_mapped,
            enrichment_score = EXCLUDED.enrichment_score,
            direction = EXCLUDED.direction,
            false_discovery_rate = EXCLUDED.false_discovery_rate,
            method = EXCLUDED.method,
            matching_protein_ids = EXCLUDED.matching_protein_ids,
            matching_protein_labels = EXCLUDED.matching_protein_labels,
            updated_at = CURRENT_TIMESTAMP;
    """
    
    try:
        # Use execute_batch for better performance (processes records in batches)
        execute_batch(cursor, insert_query, records, page_size=100)
        conn.commit()
        
        inserted_count = len(records)
        if verbose:
            print(f"   ✓ Inserted {inserted_count} records")
        
        return inserted_count
        
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Database error during insertion: {e}")
        return 0
    finally:
        cursor.close()

def clear_enrichment_data(conn, verbose: bool = False):
    """
    Clear all existing enrichment data from the table.
    
    Args:
        conn: psycopg2 connection
        verbose: Print detailed progress
    """
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM enrichment_data;")
        conn.commit()
        
        if verbose:
            print("   ✓ Cleared existing enrichment data")
            
    except psycopg2.Error as e:
        conn.rollback()
        print(f"❌ Error clearing data: {e}")
    finally:
        cursor.close()

# ============================================================================
# MAIN MIGRATION FUNCTION
# ============================================================================

def migrate_enrichment_data(dry_run: bool = False, verbose: bool = False, clear: bool = False):
    """
    Main migration function.
    
    Orchestrates the entire migration process:
    1. Find all enrichment JSON files
    2. Parse each file
    3. Insert data into database
    4. Report statistics
    
    Args:
        dry_run: If True, parse files but don't write to database
        verbose: Print detailed progress information
        clear: Clear existing data before inserting
    """
    print("================================================================================")
    print("🧬 Enrichment Data Migration")
    print("================================================================================")
    print(f"Source: {SOURCE_DIR}")
    print(f"Target: {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Mode: {'DRY RUN (no database writes)' if dry_run else 'LIVE MIGRATION'}")
    print("================================================================================\n")
    
    # Step 1: Find all enrichment files
    print("📂 Step 1: Scanning for enrichment files...")
    files = find_enrichment_files(SOURCE_DIR, verbose=verbose)
    print(f"   Found {len(files)} enrichment files\n")
    
    if not files:
        print("❌ No enrichment files found. Exiting.")
        return
    
    # Step 2: Parse all files
    print("📖 Step 2: Parsing enrichment data...")
    all_records = []
    
    for file_info in files:
        if verbose:
            print(f"\n   Processing: {file_info['comparison']} / {file_info['database']}")
        
        records = parse_enrichment_file(file_info, verbose=verbose)
        all_records.extend(records)
    
    print(f"   Parsed {len(all_records)} total enrichment records\n")
    
    if not all_records:
        print("❌ No valid records parsed. Exiting.")
        return
    
    # Step 3: Insert into database (unless dry run)
    if dry_run:
        print("🔍 DRY RUN: Skipping database insertion")
        print(f"   Would insert {len(all_records)} records")
        
        # Show sample record
        if all_records and verbose:
            print("\n   Sample record:")
            sample = all_records[0]
            for key, value in sample.items():
                display_value = str(value)[:80] + '...' if len(str(value)) > 80 else value
                print(f"      {key}: {display_value}")
    else:
        print("💾 Step 3: Inserting data into database...")
        
        # Connect to database
        conn = get_db_connection()
        
        try:
            # Clear existing data if requested
            if clear:
                print("   Clearing existing enrichment data...")
                clear_enrichment_data(conn, verbose=verbose)
            
            # Insert records
            inserted_count = insert_enrichment_data(conn, all_records, verbose=verbose)
            
            print(f"\n✅ Migration complete!")
            print(f"   Inserted: {inserted_count} records")
            
        finally:
            conn.close()
    
    # Step 4: Summary statistics
    print("\n================================================================================")
    print("📊 Migration Summary")
    print("================================================================================")
    
    # Count by comparison
    comparisons = {}
    for record in all_records:
        comp = record['comparison']
        comparisons[comp] = comparisons.get(comp, 0) + 1
    
    print(f"Total files processed: {len(files)}")
    print(f"Total records: {len(all_records)}")
    print(f"Unique comparisons: {len(comparisons)}")
    
    if verbose:
        print("\nRecords by comparison:")
        for comp, count in sorted(comparisons.items()):
            print(f"   {comp}: {count} records")
    
    print("================================================================================\n")

# ============================================================================
# CLI ENTRY POINT
# ============================================================================

def main():
    """
    Command-line interface for the migration script.
    """
    parser = argparse.ArgumentParser(
        description='Migrate enrichment data from JSON files to PostgreSQL',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test migration without database writes
  python3 migrate_enrichment_data.py --dry-run --verbose
  
  # Run actual migration
  python3 migrate_enrichment_data.py
  
  # Clear and re-migrate
  python3 migrate_enrichment_data.py --clear --verbose
        """
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Parse files and show what would be inserted (no database writes)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed progress information'
    )
    
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear existing enrichment data before inserting'
    )

    parser.add_argument('--host', default=DB_CONFIG['host'], help='Database host')
    parser.add_argument('--port', type=int, default=DB_CONFIG['port'], help='Database port')
    parser.add_argument('--database', default=DB_CONFIG['database'], help='Database name')
    parser.add_argument('--user', default=DB_CONFIG['user'], help='Database user')
    parser.add_argument('--password', default=DB_CONFIG['password'], help='Database password')
    parser.add_argument(
        '--sslmode',
        default=DB_CONFIG['sslmode'],
        help='PostgreSQL sslmode (disable, allow, prefer, require, verify-full)'
    )
    
    args = parser.parse_args()

    configure_db_from_args(args)
    
    try:
        migrate_enrichment_data(
            dry_run=args.dry_run,
            verbose=args.verbose,
            clear=args.clear
        )
    except KeyboardInterrupt:
        print("\n\n⚠️  Migration interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()

