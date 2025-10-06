import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Dynamic RNA-seq Entity Factory
 * 
 * This approach handles the dynamic column structure by:
 * 1. Defining core columns that are always present
 * 2. Using TypeORM's table name mapping for different comparisons
 * 3. Allowing flexible querying of dynamic columns
 * 
 * Key Concepts:
 * - Each comparison gets its own table (eIF5A_DDvsWT_EC, etc.)
 * - Core columns are typed, dynamic columns are accessed via raw queries
 * - TypeORM can map to different table names dynamically
 */

// Core columns that are always present in all datasets
export class BaseRnaSeqEntity {
  // Gene identification
  @PrimaryColumn({ name: 'gene_id', type: 'varchar', length: 50 })
  geneId!: string;

  @Column({ name: 'gene_name', type: 'varchar', length: 100 })
  geneName!: string;

  @Column({ name: 'gene_chr', type: 'varchar', length: 10 })
  geneChr!: string;

  @Column({ name: 'gene_start', type: 'bigint' })
  geneStart!: number;

  @Column({ name: 'gene_end', type: 'bigint' })
  geneEnd!: number;

  @Column({ name: 'gene_strand', type: 'varchar', length: 1 })
  geneStrand!: string;

  @Column({ name: 'gene_length', type: 'integer' })
  geneLength!: number;

  @Column({ name: 'gene_biotype', type: 'varchar', length: 50 })
  geneBiotype!: string;

  @Column({ name: 'gene_description', type: 'text' })
  geneDescription!: string;

  @Column({ name: 'tf_family', type: 'varchar', length: 50 })
  tfFamily!: string;

  // Statistical analysis results (always present)
  @Column({ name: 'log2foldchange', type: 'double precision' })
  log2FoldChange!: number;

  @Column({ name: 'pvalue', type: 'double precision' })
  pvalue!: number;

  @Column({ name: 'padj', type: 'double precision' })
  padj!: number;

  @Column({ name: 'log10_padj', type: 'double precision' })
  log10Padj!: number;
}

// Factory function to create entity for specific comparison
export function createRnaSeqEntity(tableName: string) {
  @Entity({ name: tableName })
  class DynamicRnaSeqEntity extends BaseRnaSeqEntity {
    // Dynamic columns will be handled via raw queries
    // This entity provides the core structure and type safety
  }

  return DynamicRnaSeqEntity;
}

// Type for dynamic data (for when we need to handle unknown columns)
export interface DynamicRnaSeqData extends BaseRnaSeqEntity {
  [key: string]: any; // Allows for dynamic SHEF columns
}

// Helper type for query results with dynamic columns
export type RnaSeqQueryResult = BaseRnaSeqEntity & Record<string, any>;
