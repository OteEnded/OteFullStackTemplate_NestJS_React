import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

export interface JwtPayload {
  /** The user's uuid (primary key). */
  sub: string;
  username: string;
}

export interface PublicUser {
  uuid: string;
  rollingId: number;
  username: string;
  createdAt: Date;
}

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: AuthCredentialsDto): Promise<PublicUser> {
    const existing = await this.users.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new ConflictException('username already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.users.save(
      this.users.create({ username: dto.username, passwordHash }),
    );

    return this.toPublic(user);
  }

  async login(dto: AuthCredentialsDto): Promise<{ accessToken: string; user: PublicUser }> {
    // passwordHash has select:false, so request it explicitly.
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.username = :username', { username: dto.username })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('invalid credentials');
    }

    const payload: JwtPayload = { sub: user.uuid, username: user.username };
    const accessToken = await this.jwt.signAsync(payload);

    return { accessToken, user: this.toPublic(user) };
  }

  async findByUuid(uuid: string): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { uuid } });
    if (!user) {
      throw new UnauthorizedException('user no longer exists');
    }
    return this.toPublic(user);
  }

  private toPublic(user: User): PublicUser {
    return {
      uuid: user.uuid,
      rollingId: user.rollingId,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
