import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';

/**
 * Entity representing a node (protein/gene) in a STRING network
 * 
 * This entity stores individual protein information including STRING identifiers.
 * Expression data and centrality metrics are computed client-side and not stored.
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
   * Reference to parent network
   */
  @ManyToOne('StringNetworkEntity', 'nodes', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'networkId' })
  network?: any;
}
