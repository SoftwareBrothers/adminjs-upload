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
  OneToMany,
} from 'typeorm'

import { RawFile } from '../utils/types.js'

@Entity({ name: 'photos' })
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: true, name: 'key' })
  public s3Key: string

  @Column({ nullable: true })
  public bucket: string

  @Column({ nullable: true })
  public path: string

  @Column({ nullable: true })
  public mime: string

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date
}
