import AuthRepository from '../repositories/auth.repository';

export default class AuthService {
  private authRepo = new AuthRepository();
}
