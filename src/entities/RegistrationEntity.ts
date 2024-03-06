import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

@Entity("registration")
@Index("idx_isin_is_notified", ["isin", "isNotified"])
export class RegistrationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 12 })
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
