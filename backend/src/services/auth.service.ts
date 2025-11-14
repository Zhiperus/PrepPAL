import { NotFoundError } from '../errors';
import AuthRepository from '../repositories/auth.repository';

export default class AuthService {
  private AuthRepo = new AuthRepository();

  //TODO: async signup();

  //TODO: async login();

  //TODO: async logout();
}
