import { NextFunction, Request, Response } from 'express';

import GoBagItemService from '../services/goBagItem.service.js';

export default class GoBagItemController {
  private goBagItemService = new GoBagItemService();
  async findAll(req: Request, res: Response, next: NextFunction) {
    const items = await this.goBagItemService.findAll();
    res.json(items);
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const item = await this.goBagItemService.findById(id);
    res.json(item);
  }
}
