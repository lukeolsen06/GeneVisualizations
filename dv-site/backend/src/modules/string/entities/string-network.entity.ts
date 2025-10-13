import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

/**
 * Entity representing a STRING protein-protein interaction network
 * 
 * This entity stores metadata about a complete STRING network analysis,
 * including the gene set used, confidence thresholds, and analysis parameters.
 * The actual network data (nodes and edges) are stored in related entities.
 */
@Entity('string_networks')
export class StringNetworkEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Dataset comparison name (e.g., 'eIF5A_DDvsWT_EC')
   * Links the network to a specific RNA-seq comparison
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  comparison!: string;

  /**
   * Hash of the gene set used for this network
   * Used for deduplication and caching - same gene set = same network
   */
  @Column({ type: 'varchar', length: 64, nullable: false })
  geneSetHash!: string;

  /**
   * JSON array of gene names used in this network
   * Stored for reference and debugging purposes
   */
  @Column({ type: 'jsonb', nullable: false })
  geneSet!: string[];

  /**
   * Confidence threshold used for network construction (0-1000 scale)
   * From STRING API required_score parameter
   */
  @Column({ type: 'integer', nullable: false })
  confidenceThreshold!: number;

  /**
   * Network type from STRING API (e.g., 'full', 'physical', 'functional')
   */
  @Column({ type: 'varchar', length: 50, nullable: false, default: 'full' })
  networkType!: string;

  /**
   * Number of nodes in the network
   * Cached for quick access without joining
   */
  @Column({ type: 'integer', nullable: false, default: 0 })
  nodeCount!: number;

  /**
   * Number of edges in the network
   * Cached for quick access without joining
   */
  @Column({ type: 'integer', nullable: false, default: 0 })
  edgeCount!: number;

  /**
   * Number of genes from the original gene set that were resolved by STRING
   * Useful for calculating resolution rates
   */
  @Column({ type: 'integer', nullable: false, default: 0 })
  resolvedGeneCount!: number;

  /**
   * Whether this network was successfully created
   * Some gene sets may fail to generate networks
   */
  @Column({ type: 'boolean', nullable: false, default: true })
  isSuccessful!: boolean;

  /**
   * Error message if network creation failed
   */
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  /**
   * Timestamp when this network was created
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Timestamp when this network was last updated
   */
  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Related nodes in this network
   */
  @OneToMany('StringNodeEntity', 'network', { cascade: true })
  nodes?: any[];

  /**
   * Related edges in this network
   */
  @OneToMany('StringEdgeEntity', 'network', { cascade: true })
  edges?: any[];
}
