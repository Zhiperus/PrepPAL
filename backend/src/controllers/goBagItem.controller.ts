import { Request, Response } from "express";

import GoBagItemService from '../services/goBagItem.service.js';

export default class GoBagItemController {
  private goBagItemService = new GoBagItemService();
}
