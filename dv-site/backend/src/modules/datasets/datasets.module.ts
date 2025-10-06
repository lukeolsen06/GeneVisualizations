import { Module } from '@nestjs/common';
import { DatasetsController } from './datasets.controller';
import { DatasetsService } from './datasets.service';

/**
 * Datasets Module
 * 
 * This module organizes all dataset-related functionality:
 * - DatasetsController: Handles HTTP requests
 * - DatasetsService: Contains business logic
 * 
 * Key NestJS Concepts:
 * - @Module() decorator defines a module
 * - controllers: Array of controllers this module provides
 * - providers: Array of services this module provides
 * - exports: Services that other modules can import (none for now)
 */
@Module({
  controllers: [DatasetsController], // Register our controller
  providers: [DatasetsService],      // Register our service
  exports: [],                       // No services exported (yet)
})
export class DatasetsModule {}
