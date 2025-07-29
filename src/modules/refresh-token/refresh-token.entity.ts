import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  exp: number;

  @Column()
  jti: string;

  @Column()
  expiresAt: Date;

  @Column({ default: null })
  usedAt: Date;

  @Column({ nullable: true })
  revokedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;
}
