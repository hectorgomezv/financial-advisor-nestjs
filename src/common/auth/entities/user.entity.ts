export enum UserRole {
  SUPER_ADMIN = 'superAdmin',
  ADMIN = 'admin',
  USER = 'user',
}

export class User {
  id: string;
  email: string;
  role: string;
}
