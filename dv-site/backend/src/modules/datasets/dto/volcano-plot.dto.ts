import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Volcano Plot DTO (Data Transfer Object)
 * 
 * This DTO is optimized for volcano plot visualizations.
 * Volcano plots show ALL genes (not just significant ones) to give
 * a complete picture of differential expression.
 * 
 * Key Differences from FilterGenesDto:
 * - No filtering by pvalue/padj/log2fc (we want ALL genes)
 * - Only need minimal fields for plotting (gene name, fold change, pvalue)
 * - Higher default limit since volcano plots show thousands of genes
 * 
 * Purpose:
 * - Keep response size manageable
 * - Provide exactly what the frontend plotting library needs
 * - Fast queries for interactive visualizations
 */
export class VolcanoPlotDto {
  /**
   * Maximum number of genes to return
   * Default: 5000 (typical volcano plot shows all or most genes)
   * 
   * Note: Volcano plots work best with ALL genes, but we limit
   * to prevent extremely large responses
   */
  @ApiProperty({
    description: 'Maximum number of genes to return for volcano plot',
    required: false,
    example: 5000,
    minimum: 1,
    maximum: 20000,
    default: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20000)
  limit?: number;
}

/**
 * Volcano Plot Response Interface
 * 
 * This defines the lightweight response structure for volcano plots.
 * We only include the fields needed for plotting:
 * - geneId: For tooltips and linking
 * - geneName: For display in tooltips
 * - log2FoldChange: X-axis value
 * - pvalue: For calculating -log10(pvalue) (Y-axis)
 * - padj: For coloring significant genes
 * 
 * We intentionally EXCLUDE:
 * - geneChr, geneStart, geneEnd, geneStrand (not needed for volcano plot)
 * - geneLength, geneBiotype, geneDescription (too heavy for 5000+ genes)
 * - tfFamily (optional metadata)
 */
export interface VolcanoPlotResponse {
  geneId: string;
  geneName: string;
  log2FoldChange: number;
  pvalue: number;
  padj: number;
}

