import { NextFunction, Request, Response } from 'express';

import GoBagService from '../services/goBag.service.js';

export default class GoBagController {
  private goBagService = new GoBagService();

  getGoBag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.goBagService.getHydratedGoBag({
        userId: req.userId!,
      });

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  toggleGoBagItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.goBagService.toggleItem({
        userId: req.userId!,
        ...req.body,
      });

      res.status(200).json({
        message: 'Item updated',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}
