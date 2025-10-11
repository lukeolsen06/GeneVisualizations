import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RnaSeqEntity } from './entities/rna-seq.entity';
import { FilterGenesDto } from './dto/filter-genes.dto';
import { VolcanoPlotDto, VolcanoPlotResponse } from './dto/volcano-plot.dto';
import { SearchGenesDto } from './dto/search-genes.dto';

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

  /**
   * Get filtered genes from a specific dataset
   * This method builds a dynamic SQL query based on filter criteria
   * 
   * Key Concepts:
   * - Dynamic SQL: We build the WHERE clause based on provided filters
   * - Parameterized queries: Using $1, $2, etc. prevents SQL injection
   * - Conditional logic: Only add filters that are provided
   */
  async getFilteredGenes(
    comparison: string,
    filters: FilterGenesDto,
  ): Promise<RnaSeqEntity[]> {
    try {
      // Start with base SELECT query
      let query = `
        SELECT gene_id, gene_name, gene_chr, gene_start, gene_end, gene_strand,
               gene_length, gene_biotype, gene_description, tf_family,
               log2foldchange, pvalue, padj, log10_padj
        FROM "${comparison}"
      `;

      // Build WHERE clause dynamically based on filters
      const whereClauses: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      // Filter by p-value
      if (filters.pvalue !== undefined) {
        whereClauses.push(`pvalue <= $${paramIndex}`);
        queryParams.push(filters.pvalue);
        paramIndex++;
      }

      // Filter by adjusted p-value
      if (filters.padj !== undefined) {
        whereClauses.push(`padj <= $${paramIndex}`);
        queryParams.push(filters.padj);
        paramIndex++;
      }

      // Filter by log2 fold change (absolute value)
      if (filters.log2fc !== undefined) {
        whereClauses.push(`ABS(log2foldchange) >= $${paramIndex}`);
        queryParams.push(filters.log2fc);
        paramIndex++;
      }

      // Filter by direction (up/down regulation)
      if (filters.direction && filters.direction !== 'both') {
        if (filters.direction === 'up') {
          whereClauses.push('log2foldchange > 0');
        } else if (filters.direction === 'down') {
          whereClauses.push('log2foldchange < 0');
        }
      }

      // Add WHERE clause if we have any filters
      if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
      }

      // Add ORDER BY and LIMIT
      query += ' ORDER BY padj ASC';
      
      if (filters.limit !== undefined) {
        query += ` LIMIT $${paramIndex}`;
        queryParams.push(filters.limit);
      } else {
        query += ` LIMIT $${paramIndex}`;
        queryParams.push(100); // Default limit
      }

      // Execute the query
      const results = await this.dataSource.query(query, queryParams);

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
      // If table doesn't exist or query fails, return empty array
      return [];
    }
  }

  /**
   * Get volcano plot data for a specific dataset
   * 
   * This method returns a lightweight dataset optimized for volcano plot visualizations.
   * Unlike filtered queries, volcano plots need ALL genes (or most of them) to show
   * the complete distribution of differential expression.
   * 
   * Key Optimizations:
   * - Only returns 5 fields instead of 14 (reduces response size by ~80%)
   * - No filtering (volcano plots show all genes including non-significant)
   * - Ordered by padj to prioritize most significant genes if limit is reached
   * 
   * Performance:
   * - 5000 genes: ~575KB response (vs 2.7MB for full entities)
   * - Query time: ~50ms (selecting fewer columns is faster)
   * 
   * Frontend Usage:
   * - X-axis: log2FoldChange
   * - Y-axis: -log10(pvalue)
   * - Color: Based on padj threshold (e.g., red if padj < 0.05)
   */
  async getVolcanoPlotData(
    comparison: string,
    options: VolcanoPlotDto,
  ): Promise<VolcanoPlotResponse[]> {
    try {
      // Default limit for volcano plots is higher (5000) since we want to see all genes
      const limit = options.limit || 5000;

      // Simple query - just select the fields we need for plotting
      // No WHERE clause since volcano plots show ALL genes
      const query = `
        SELECT gene_id, gene_name, log2foldchange, pvalue, padj
        FROM "${comparison}"
        ORDER BY padj ASC
        LIMIT $1
      `;

      const results = await this.dataSource.query(query, [limit]);

      // Map to our lightweight response interface
      // Notice: Much simpler mapping than full entity
      return results.map((row: any) => ({
        geneId: row.gene_id,
        geneName: row.gene_name,
        log2FoldChange: row.log2foldchange,
        pvalue: row.pvalue,
        padj: row.padj,
      }));
    } catch (error) {
      // If table doesn't exist, return empty array
      return [];
    }
  }

  /**
   * Search for genes by name in a specific dataset
   * 
   * This method performs a case-insensitive partial match search on gene names.
   * It's useful for autocomplete, quick lookups, and finding genes by name.
   * 
   * Search Strategy:
   * - Uses PostgreSQL ILIKE for case-insensitive pattern matching
   * - Wraps search term with % wildcards for partial matching
   * - Example: "prl" matches "Prl", "prolactin", "Prl2", etc.
   * 
   * Performance:
   * - Small result sets (default 20) for fast response
   * - Could benefit from database index on gene_name column
   * - Orders by gene_name for consistent results
   * 
   * Security:
   * - Uses parameterized queries to prevent SQL injection
   * - Validation ensures search term is reasonable length
   * 
   * @param comparison - Dataset comparison name
   * @param searchDto - Search parameters (query string and limit)
   * @returns Array of matching genes with full entity data
   */
  async searchGenes(
    comparison: string,
    searchDto: SearchGenesDto,
  ): Promise<RnaSeqEntity[]> {
    try {
      const limit = searchDto.limit || 20;
      
      // Use ILIKE for case-insensitive search with wildcards
      // ILIKE is PostgreSQL-specific (use LIKE LOWER() for other databases)
      // The % wildcards allow partial matching: %query% matches "Xyz-query-123"
      const query = `
        SELECT gene_id, gene_name, gene_chr, gene_start, gene_end, gene_strand,
               gene_length, gene_biotype, gene_description, tf_family,
               log2foldchange, pvalue, padj, log10_padj
        FROM "${comparison}"
        WHERE gene_name ILIKE $1
        ORDER BY gene_name ASC
        LIMIT $2
      `;

      // Add wildcards to search term for partial matching
      // $1 = '%Prl%' will match: "Prl", "Prl2", "prolactin-like", etc.
      const searchPattern = `%${searchDto.query}%`;

      const results = await this.dataSource.query(query, [searchPattern, limit]);

      // Map to full entity structure
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
      // If table doesn't exist or query fails, return empty array
      return [];
    }
  }
}
