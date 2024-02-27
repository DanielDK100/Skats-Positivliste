import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";

@Entity("registration")
export class RegistrationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isin: string;

  @Column()
  email: string;

  @Column({ default: false })
  isNotified: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
