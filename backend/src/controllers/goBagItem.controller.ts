import { Request, Response } from "express";

import GoBagItemService from "../services/goBagItem.service";

export default class GoBagItemController {
  private goBagItemService = new GoBagItemService();
}
