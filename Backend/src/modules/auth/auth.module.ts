import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfiguration } from '../../config/configuration';
import { User } from '../../database/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthSeeder } from './auth.seeder';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Optional auth example (JWT). Remove this module (and the User entity) if your
 * project doesn't need built-in accounts. JwtAuthGuard is exported so other
 * modules can protect their own routes with `@UseGuards(JwtAuthGuard)`.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration, true>) => {
        const auth = configService.get('auth', { infer: true });
        return {
          secret: auth.jwtSecret,
          // jsonwebtoken types expiresIn as a strict `ms` template-literal union;
          // our value comes from config (e.g. "1h"), so cast the string through.
          signOptions: { expiresIn: auth.jwtExpiresIn as unknown as number },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, AuthSeeder],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
