import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm"
import { UploadType } from "../dto/upload.dto"

@Entity("file_uploads")
export class FileUpload {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  filename: string

  @Column()
  originalName: string

  @Column()
  mimetype: string

  @Column()
  size: number

  @Column()
  path: string

  @Column({
    type: "enum",
    enum: UploadType,
    default: UploadType.GENERAL,
  })
  uploadType: UploadType

  @Column({ nullable: true })
  description?: string

  @Column({ nullable: true })
  referenceId?: string

  @CreateDateColumn()
  uploadedAt: Date
}
