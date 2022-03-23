import {
  Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from 'typeorm';
import { Post } from './Post';
@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userVote: number;

  @Column()
  userId: number;

  @ManyToOne(() => Post, (post) => post.votes, { onDelete: 'CASCADE' })
  post: Post;
}
