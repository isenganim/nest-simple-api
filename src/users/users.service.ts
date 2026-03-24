import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users, User, NewUser } from '../database/schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { DRIZZLE } from '../database/database.module';

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE) private readonly db: NodePgDatabase) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const [user] = await this.db.insert(users).values({
      ...createUserDto,
      password: hashedPassword,
    }).returning();

    const { password, ...result } = user;
    return result;
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const result = await this.db.select().from(users);
    return result.map(({ password, ...user }) => user);
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { password, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async remove(id: number): Promise<void> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    if (!result.length) {
      throw new NotFoundException('User not found');
    }
  }
}