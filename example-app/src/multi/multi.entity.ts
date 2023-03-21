/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export type PhotoInDB = {
  bucket: string,
  mime: string,
  key: string,
  size: number
}

@Entity({ name: 'multi' })
export class Multi extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: false })
  public name: string

  @Column({ nullable: true })
  public key: string

  @Column({ nullable: true })
  public bucket: string

  @Column({ nullable: true })
  public mime: string

  @Column({ nullable: true })
  public size: number

  @Column({ nullable: true, type: 'jsonb' })
  public topPhoto: any

  @Column({ nullable: true, type: 'jsonb' })
  public bottomPhoto: any

  @Column({ nullable: true, type: 'jsonb' })
  public images: any

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date
}
