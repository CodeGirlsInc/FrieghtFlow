import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, OneToMany } from "typeorm"
import { MapEdge } from "./map-edge.entity"

export enum NodeType {
  INTERSECTION = "intersection",
  WAREHOUSE = "warehouse",
  DELIVERY_POINT = "delivery_point",
  HIGHWAY_JUNCTION = "highway_junction",
  CITY_CENTER = "city_center",
  RESIDENTIAL = "residential",
  COMMERCIAL = "commercial",
  INDUSTRIAL = "industrial",
}

@Entity("map_nodes")
@Index(["latitude", "longitude"])
@Index(["nodeType"])
export class MapNode {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ type: "decimal", precision: 10, scale: 7 })
  @Index()
  latitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  @Index()
  longitude: number

  @Column({
    type: "enum",
    enum: NodeType,
    default: NodeType.INTERSECTION,
  })
  nodeType: NodeType

  @Column({ type: "jsonb", nullable: true })
  properties: {
    address?: string
    city?: string
    state?: string
    zipCode?: string
    trafficLevel?: number // 1-10 scale
    accessRestrictions?: string[]
    operatingHours?: {
      open: string
      close: string
    }
  }

  @Column({ default: true })
  isActive: boolean

  @OneToMany(
    () => MapEdge,
    (edge) => edge.fromNode,
  )
  outgoingEdges: MapEdge[]

  @OneToMany(
    () => MapEdge,
    (edge) => edge.toNode,
  )
  incomingEdges: MapEdge[]

  @CreateDateColumn()
  createdAt: Date
}
