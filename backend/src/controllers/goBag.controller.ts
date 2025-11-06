import { Request, Response } from "express";

import GoBagService from "../services/goBag.service";

export default class GoBagController {
  private goBagService = new GoBagService();
}
