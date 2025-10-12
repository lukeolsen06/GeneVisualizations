/**
 * Enrichment Entity
 * 
 * TypeORM entity that maps to the 'enrichment_data' table in PostgreSQL.
 * Represents gene enrichment analysis results from KEGG, Reactome, and WikiPathways.
 * 
 * Purpose:
 *   - Define the database schema for enrichment data
 *   - Enable type-safe database queries
 *   - Support API responses with consistent structure
 * 
 * Usage:
 *   - Used by EnrichmentService for database operations
 *   - Returned by API endpoints as response data
 * 
 * Related:
 *   - Database table: enrichment_data (created by create-enrichment-table.sql)
 *   - Migration: migrate_enrichment_data.py
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Enrichment entity class
 * 
 * Maps to the enrichment_data table with the following structure:
 * - Core identifiers: comparison, database, term_id
 * - Pathway info: term_description, genes_mapped
 * - Statistics: enrichment_score, false_discovery_rate, direction, method
 * - Matching genes: protein IDs and labels
 * - Timestamps: created_at, updated_at
 */
@Entity('enrichment_data')
export class EnrichmentEntity {
  /**
   * Primary key (auto-increment)
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Dataset comparison name
   * Example: 'eIF5A_DDvsWT_EC', 'DHS_DOHHvsTar4_EC'
   * 
   * Used for filtering enrichment results by dataset
   */
  @Column({ name: 'comparison', type: 'varchar', length: 100 })
  comparison!: string;

  /**
   * Source database name
   * Values: 'KEGG', 'Reactome', 'WikiPathways'
   * 
   * Identifies which enrichment database the pathway comes from
   */
  @Column({ name: 'database', type: 'varchar', length: 50 })
  database!: string;

  /**
   * Pathway/term identifier
   * Examples: 'mmu03010' (KEGG), 'R-MMU-156842' (Reactome), 'WP1254' (WikiPathways)
   * 
   * Unique identifier for the pathway within its source database
   */
  @Column({ name: 'term_id', type: 'varchar', length: 50 })
  termId!: string;

  /**
   * Human-readable pathway description
   * Examples: 'Ribosome', 'Oxidative phosphorylation', 'Apoptosis'
   * 
   * The name of the biological pathway or process
   */
  @Column({ name: 'term_description', type: 'text' })
  termDescription!: string;

  /**
   * Number of genes mapped to this pathway
   * 
   * Indicates how many genes from the dataset are associated with this pathway
   */
  @Column({ name: 'genes_mapped', type: 'integer' })
  genesMapped!: number;

  /**
   * Statistical enrichment score
   * 
   * Measures the strength of enrichment (higher = more enriched)
   * Calculation method depends on the statistical test used
   */
  @Column({ name: 'enrichment_score', type: 'double precision' })
  enrichmentScore!: number;

  /**
   * Direction of enrichment
   * Values: 'bottom', 'top', 'both ends', or empty string
   * 
   * Indicates whether the pathway is enriched in:
   * - 'bottom': down-regulated genes
   * - 'top': up-regulated genes
   * - 'both ends': both directions
   */
  @Column({ name: 'direction', type: 'varchar', length: 20, nullable: true })
  direction!: string;

  /**
   * False Discovery Rate (FDR)
   * Range: 0.0 to 1.0
   * 
   * Statistical significance measure (lower = more significant)
   * Typically, FDR < 0.05 is considered significant
   */
  @Column({ name: 'false_discovery_rate', type: 'double precision' })
  falseDiscoveryRate!: number;

  /**
   * Statistical method used
   * Values: 'ks' (Kolmogorov-Smirnov), 'afc' (area under curve), or empty
   * 
   * The statistical test used to calculate enrichment
   */
  @Column({ name: 'method', type: 'varchar', length: 20, nullable: true })
  method!: string;

  /**
   * Matching protein IDs (comma-separated)
   * Example: '10090.ENSMUSP00000000756,10090.ENSMUSP00000002844,...'
   * 
   * List of protein IDs from the dataset that match this pathway
   * Useful for detailed gene-level analysis
   */
  @Column({ name: 'matching_protein_ids', type: 'text', nullable: true })
  matchingProteinIds!: string | null;

  /**
   * Matching protein labels/gene names (comma-separated)
   * Example: 'Rpl13,Mrpl2,Mrpl4,Rps11,...'
   * 
   * Human-readable gene names corresponding to the protein IDs
   * Easier to interpret than protein IDs
   */
  @Column({ name: 'matching_protein_labels', type: 'text', nullable: true })
  matchingProteinLabels!: string | null;

  /**
   * Timestamp when the record was created
   * Auto-set by database on INSERT
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  /**
   * Timestamp when the record was last updated
   * Auto-updated by database on UPDATE
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

