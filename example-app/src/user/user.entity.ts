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

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @Column({ nullable: true })
  public name: string

  @Column({ nullable: true })
  public fullname: string

  @Column()
  public email: string

  @Column({ nullable: true })
  public sajz: number

  @Column({ nullable: true })
  public majmtajp: string

  @Column({ nullable: true, name: 's3_bucket' })
  public s3Bucket: string

  @Column({ nullable: true })
  public avatar: string

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date
}
