import { NotFoundError } from '../errors/index.js';
import { IModule } from '../models/module.model.js';
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

  /* --- Admin Methods --- */

  async createModule(data: Partial<IModule>) {
    return this.moduleRepo.create(data);
  }

  async updateModule(id: string, data: Partial<IModule>) {
    const existing = await this.moduleRepo.findById(id);

    if (!existing) {
      throw new NotFoundError('Module not found');
    }

    return this.moduleRepo.update(id, data);
  }

  async deleteModule(id: string) {
    const existing = await this.moduleRepo.findById(id);

    if (!existing) {
      throw new NotFoundError('Module not found');
    }

    return this.moduleRepo.delete(id);
  }
}

