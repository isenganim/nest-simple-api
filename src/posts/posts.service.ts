import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { posts, Post, NewPost } from '../database/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DRIZZLE } from '../database/database.module';

@Injectable()
export class PostsService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async create(authorId: number, createPostDto: CreatePostDto): Promise<Post> {
    const [post] = await this.db.insert(posts).values({
      ...createPostDto,
      authorId,
    }).returning();
    return post;
  }

  async findAll(): Promise<Post[]> {
    return this.db.select().from(posts);
  }

  async findOne(id: number): Promise<Post> {
    const [post] = await this.db.select().from(posts).where(eq(posts.id, id));
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(id: number, userId: number, userRole: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    // Check ownership or admin role
    if (post.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only update your own posts');
    }

    const [updatedPost] = await this.db
      .update(posts)
      .set({ ...updatePostDto, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    return updatedPost;
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const post = await this.findOne(id);

    // Check ownership or admin role
    if (post.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.db.delete(posts).where(eq(posts.id, id));
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return this.db.select().from(posts).where(eq(posts.authorId, authorId));
  }
}