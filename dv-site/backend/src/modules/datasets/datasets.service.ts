import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createRnaSeqEntity, BaseRnaSeqEntity } from './entities/rna-seq.entity';

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
 * - Uses our dynamic entity factory for flexible table queries
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
    // Create entity for this specific comparison
    const Entity = createRnaSeqEntity(comparison);
    const repository = this.dataSource.getRepository(Entity);

    // Count total genes in this dataset
    const totalGenes = await repository.count();

    return {
      name: comparison,
      totalGenes,
    };
  }

  /**
   * Get genes from a specific dataset
   * This will replace your static gene data loading
   */
  async getGenes(comparison: string, limit: number = 100): Promise<BaseRnaSeqEntity[]> {
    // Create entity for this specific comparison
    const Entity = createRnaSeqEntity(comparison);
    const repository = this.dataSource.getRepository(Entity);

    // Query genes with pagination
    const genes = await repository.find({
      take: limit,
      order: {
        padj: 'ASC', // Order by most significant first
      },
    });

    return genes;
  }
}
