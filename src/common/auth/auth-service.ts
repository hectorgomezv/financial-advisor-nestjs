import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from './entities/user.entity.js';

@Injectable()
export class AuthService {
  isAdmin(user: User) {
    return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN;
  }

  checkAdmin(user: User) {
    if (!this.isAdmin(user)) {
      throw new UnauthorizedException('Access denied');
    }
  }
}
