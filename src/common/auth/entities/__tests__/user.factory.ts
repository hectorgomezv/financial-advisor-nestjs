import { faker } from '@faker-js/faker';
import { User, UserRole } from '../user.entity.js';

export function userFactory(id?: string, email?: string, role?: string): User {
  return <User>{
    id: id ?? faker.string.uuid(),
    email: email ?? faker.internet.email(),
    role: role ?? faker.helpers.arrayElement(Object.values(UserRole)),
  };
}
