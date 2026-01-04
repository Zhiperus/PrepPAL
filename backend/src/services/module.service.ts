import { NotFoundError } from '../errors/index.js';
import ModuleRepository, {
  GetModulesOptions,
} from '../repositories/module.repository.js';

export default class ModuleService {
  private moduleRepo = new ModuleRepository();

  /**
   * Gets all modules with pagination.
   */
  async getAllModules(options: GetModulesOptions = {}) {
    return this.moduleRepo.findAll(options);
  }

  /**
   * Gets a single module by its ID.
   */
  async getModuleById(moduleId: string) {
    const module = await this.moduleRepo.findById(moduleId);
    if (!module) throw new NotFoundError('Module not found');
    return module;
  }

  /**
   * Searches modules by query string (searches title and description).
   */
  async searchModules(query: string, options: GetModulesOptions = {}) {
    return this.moduleRepo.search(query, options);
  }
}
