import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * RNA-seq Entity
 * 
 * This entity represents the core structure of RNA-seq data tables.
 * It includes all the common columns that exist across all comparison tables.
 * 
 * For dynamic columns (like different SHEF samples), we'll use raw SQL queries.
 * This approach provides type safety for core columns while maintaining flexibility.
 */
@Entity()
export class RnaSeqEntity {
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

// Type for dynamic data (for when we need to handle unknown columns)
export interface DynamicRnaSeqData extends RnaSeqEntity {
  [key: string]: any; // Allows for dynamic SHEF columns
}

// Helper type for query results with dynamic columns
export type RnaSeqQueryResult = RnaSeqEntity & Record<string, any>;
