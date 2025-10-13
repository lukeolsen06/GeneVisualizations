import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

/**
 * Entity representing an edge (protein-protein interaction) in a STRING network
 * 
 * This entity stores interaction data between proteins including confidence scores,
 * interaction types, and relationship information from the STRING database.
 */
@Entity('string_edges')
@Index(['networkId', 'sourceStringId', 'targetStringId'], { unique: true }) // Ensure unique edges per network
@Index(['networkId', 'sourceGeneName', 'targetGeneName']) // Index for gene name queries
export class StringEdgeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Reference to the parent network
   */
  @Column({ type: 'integer', nullable: false })
  networkId!: number;

  /**
   * STRING ID of the source protein
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  sourceStringId!: string;

  /**
   * Gene name of the source protein (user-friendly)
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  sourceGeneName!: string;

  /**
   * STRING ID of the target protein
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  targetStringId!: string;

  /**
   * Gene name of the target protein (user-friendly)
   */
  @Column({ type: 'varchar', length: 255, nullable: false })
  targetGeneName!: string;

  /**
   * Interaction confidence score (0-1000 scale from STRING API)
   * Higher scores indicate more confident interactions
   */
  @Column({ type: 'decimal', precision: 5, scale: 3, nullable: false })
  interactionScore!: number;

  /**
   * Confidence level category ('low', 'medium', 'high')
   * Derived from interactionScore for easier filtering
   */
  @Column({ type: 'varchar', length: 20, nullable: false })
  confidenceLevel!: string;

  /**
   * Interaction type from STRING database
   * (e.g., 'physical', 'functional', 'coexpression')
   */
  @Column({ type: 'varchar', length: 50, nullable: true })
  interactionType?: string;

  /**
   * Evidence sources for this interaction
   * JSON array of evidence types (e.g., ['experiments', 'databases'])
   */
  @Column({ type: 'jsonb', nullable: true })
  evidenceSources?: string[];

  /**
   * Reference to parent network
   */
  @ManyToOne('StringNetworkEntity', 'edges', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'networkId' })
  network?: any;
}
