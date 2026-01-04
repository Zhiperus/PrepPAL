import Module from '../models/module.model.js';

export default class ModuleRepository {
  async getAll() {
    return Module.find();
  }

  async getModule(id: string) {
    return Module.findById(id);
  }
}
