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

  updateGoBag = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const file = await parseFileRequest(req, res);

      if (!file) {
        throw new Error('An image file is required to update the Go Bag.');
      }

      if (!req.body.items) {
        throw new Error('The list of Go Bag items is required.');
      }

      let items = [];
      try {
        items = JSON.parse(req.body.items);
      } catch (err) {
        throw new Error(
          'Invalid format for items. Expected a valid JSON string.',
        );
      }

      const result = await this.goBagService.updateGoBag({
        userId,
        file,
        items,
      });

      res.status(200).json({
        success: true,
        message: 'Go Bag updated successfully',
        data: result,
      });
    } catch (error) {
      handleInternalError(error, next);
    }
  };
}
