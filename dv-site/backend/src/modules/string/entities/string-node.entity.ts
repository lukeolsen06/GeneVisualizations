import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

/**
 * Entity representing a node (protein/gene) in a STRING network
 * 
 * This entity stores individual protein information including STRING identifiers,
 * expression data from RNA-seq analysis, and functional annotations.
 */
@Entity('string_nodes')
@Index(['networkId', 'stringId'], { unique: true }) // Ensure unique nodes per network
export class StringNodeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Reference to the parent network
   */
  @Column({ type: 'integer', nullable: false })
  networkId!: number;

  /**
   * STRING database identifier (e.g., '10090.ENSMUSP00000000001')
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  stringId!: string;

  /**
   * Preferred gene name (e.g., 'Gnai3')
   * This is the display name used in visualizations
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  preferredName!: string;

  /**
   * Gene annotation from STRING database
   * Brief description of gene function
   */
  @Column({ type: 'text', nullable: true })
  annotation?: string;

  /**
   * Log2 fold change from RNA-seq analysis
   * Expression change between conditions
   */
  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  log2fc?: number;

  /**
   * Adjusted p-value from RNA-seq analysis
   * Statistical significance of expression change
   */
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  padj?: number;

  /**
   * Expression direction ('upregulated', 'downregulated', 'unchanged')
   * Categorical expression change
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  expression?: string;

  /**
   * Functional terms associated with this protein
   * Stored as JSON array of {term, description} objects
   */
  @Column({ type: 'jsonb', nullable: true })
  functionalTerms?: Array<{term: string; description: string}>;

  /**
   * Normalized degree centrality score
   * Network topology measure (0-1 scale)
   */
  @Column({ type: 'decimal', precision: 6, scale: 4, nullable: true })
  normalizedDegreeCentrality?: number;

  /**
   * Raw degree (number of connections) in the network
   */
  @Column({ type: 'integer', nullable: true })
  degree?: number;

  /**
   * Reference to parent network
   */
  @ManyToOne('StringNetworkEntity', 'nodes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'networkId' })
  network?: any;
}
