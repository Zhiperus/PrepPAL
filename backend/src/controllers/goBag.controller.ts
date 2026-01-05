import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import GoBagService from '../services/goBag.service.js';
import { parseFileRequest } from '../utils/image.util.js';

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

  updateGoBagImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const file = await parseFileRequest(req, res);

      const result = await this.goBagService.updateGoBagImage({
        userId,
        file,
      });

      res.status(200).json({
        success: true,
        message: 'Go bag image updated successfully',
        data: result,
      });
    } catch (error) {
      handleInternalError(error, next);
    }
  };
}
