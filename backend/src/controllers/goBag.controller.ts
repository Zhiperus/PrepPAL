import { Request, Response } from "express";

import GoBagService from '../services/goBag.service.js';

export default class GoBagController {
  private goBagService = new GoBagService();
}
