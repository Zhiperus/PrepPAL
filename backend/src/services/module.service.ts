import ModuleRepository from '../repositories/module.repository.js';

export default class ModuleService {
  private moduleRepo = new ModuleRepository();

  async getAllModules() {
    return this.moduleRepo.getAll();
  }

  async getModule(id: string) {
    return this.moduleRepo.getModule(id);
  }
}
