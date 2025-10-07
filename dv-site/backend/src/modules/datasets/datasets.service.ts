import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RnaSeqEntity } from './entities/rna-seq.entity';

/**
 * Datasets Service
 * 
 * This service handles all business logic for RNA-seq dataset operations.
 * It replaces the static CSV imports with dynamic database queries.
 * 
 * Key NestJS Concepts:
 * - @Injectable() makes this class available for dependency injection
 * - @InjectDataSource() injects the database connection
 * - Contains business logic separate from controllers
 * - Uses raw SQL queries for flexible table access
 */
@Injectable()
export class DatasetsService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Get all available dataset comparisons
   * This will replace your static chartDataMapping keys
   */
  async getAvailableDatasets(): Promise<string[]> {
    // TODO: Query database to get list of available tables
    // For now, return hardcoded list (we'll make this dynamic later)
    return [
      'eIF5A_DDvsWT_EC',
      'DHS_DOHHvsTar4_EC',
      'DHS_DOHHvsWT_EC',
      'K50A_DDvsTar4_EC',
      'Tar4_ECvsWT_EC',
    ];
  }

  /**
   * Get basic dataset information
   * This will replace your static dataset metadata
   */
  async getDatasetInfo(comparison: string): Promise<{ name: string; totalGenes: number }> {
    try {
      // Use raw SQL to count genes in the specific table
      const result = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM "${comparison}"`
      );

      const totalGenes = parseInt(result[0].count);

      return {
        name: comparison,
        totalGenes,
      };
    } catch (error) {
      // If table doesn't exist, return 0
      return {
        name: comparison,
        totalGenes: 0,
      };
    }
  }

  /**
   * Get genes from a specific dataset
   * This will replace your static gene data loading
   */
  async getGenes(comparison: string, limit: number = 100): Promise<RnaSeqEntity[]> {
    try {
      // Use raw SQL to query the specific comparison table
      // This gives us flexibility for dynamic columns while maintaining type safety for core columns
      const query = `
        SELECT gene_id, gene_name, gene_chr, gene_start, gene_end, gene_strand, 
               gene_length, gene_biotype, gene_description, tf_family,
               log2foldchange, pvalue, padj, log10_padj
        FROM "${comparison}"
        ORDER BY padj ASC
        LIMIT $1
      `;

      const results = await this.dataSource.query(query, [limit]);
      
      // Map raw results to our entity structure
      return results.map((row: any) => ({
        geneId: row.gene_id,
        geneName: row.gene_name,
        geneChr: row.gene_chr,
        geneStart: row.gene_start,
        geneEnd: row.gene_end,
        geneStrand: row.gene_strand,
        geneLength: row.gene_length,
        geneBiotype: row.gene_biotype,
        geneDescription: row.gene_description,
        tfFamily: row.tf_family,
        log2FoldChange: row.log2foldchange,
        pvalue: row.pvalue,
        padj: row.padj,
        log10Padj: row.log10_padj,
      }));
    } catch (error) {
      // If table doesn't exist, return empty array
      return [];
    }
  }
}
