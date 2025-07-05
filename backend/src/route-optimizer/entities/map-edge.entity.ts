import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { MapNode } from "./map-node.entity"

export enum RoadType {
  HIGHWAY = "highway",
  ARTERIAL = "arterial",
  COLLECTOR = "collector",
  LOCAL = "local",
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
}

export enum RoadCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CONSTRUCTION = "construction",
}

@Entity("map_edges")
@Index(["fromNodeId", "toNodeId"])
@Index(["roadType"])
export class MapEdge {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  @Index()
  fromNodeId: string

  @Column("uuid")
  @Index()
  toNodeId: string

  @ManyToOne(
    () => MapNode,
    (node) => node.outgoingEdges,
  )
  @JoinColumn({ name: "fromNodeId" })
  fromNode: MapNode

  @ManyToOne(
    () => MapNode,
    (node) => node.incomingEdges,
  )
  @JoinColumn({ name: "toNodeId" })
  toNode: MapNode

  @Column({ type: "decimal", precision: 8, scale: 3 })
  distance: number // in kilometers

  @Column({ type: "int" })
  estimatedTime: number // in minutes

  @Column({
    type: "enum",
    enum: RoadType,
    default: RoadType.LOCAL,
  })
  roadType: RoadType

  @Column({
    type: "enum",
    enum: RoadCondition,
    default: RoadCondition.GOOD,
  })
  roadCondition: RoadCondition

  @Column({ type: "int", default: 50 })
  speedLimit: number // km/h

  @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
  trafficMultiplier: number // 1.0 = normal, >1.0 = slower

  @Column({ type: "jsonb", nullable: true })
  properties: {
    tollCost?: number
    restrictions?: string[]
    weatherImpact?: number
    constructionDelay?: number
  }

  @Column({ default: true })
  isActive: boolean

  @Column({ default: false })
  isBidirectional: boolean

  @CreateDateColumn()
  createdAt: Date
}
