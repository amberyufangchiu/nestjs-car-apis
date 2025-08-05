import { Exclude } from 'class-transformer';
import { Report } from 'src/modules/reports/reports.entity';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../refresh-token/refresh-token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password?: string;

  @Exclude()
  @Column({ nullable: true })
  otpSecret?: string;

  @Column({ default: false })
  isOtpEnabled: boolean;

  @Column({ default: false })
  admin: boolean;

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @AfterInsert()
  logInsert(): void {
    console.log('Inserted user with id', this.id);
  }

  @AfterRemove()
  logRemove(): void {
    console.log('Removed user with id', this.id);
  }

  @AfterUpdate()
  logUpdate(): void {
    console.log('Updated user with id', this.id);
  }
}
