import Module from '../models/module.model.js';

export default class ModuleRepository {
  async getAll() {
    return Module.find().select('-content');
  }

  async getModule(id: string) {
    return Module.findById(id);
  }
}
