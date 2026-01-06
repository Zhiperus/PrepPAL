import { NotFoundError } from '../errors/index.js';
import ModuleRepository, {
  GetModulesOptions,
} from '../repositories/module.repository.js';

export default class ModuleService {
  private moduleRepo = new ModuleRepository();

  /**
   * Gets all modules with pagination and optional search.
   */
  async getAllModules(userId: string, options: GetModulesOptions = {}) {
    // This supports the { page, limit } object from the controller
    return this.moduleRepo.findAll(userId, options);
  }

  /**
   * Gets a single module by its ID.
   * Throws NotFoundError if the module does not exist.
   */
  async getModuleById(moduleId: string) {
    const module = await this.moduleRepo.findById(moduleId);

    if (!module) {
      throw new NotFoundError('Module not found');
    }

    return module;
  }

  /**
   * Searches modules by query string (searches title and description).
   */
  async searchModules(
    userId: string,
    query: string,
    options: GetModulesOptions = {},
  ) {
    return this.moduleRepo.search(userId, query, options);
  }
}

