import { Router } from 'express';

import GoBagItemController from '../controllers/goBagItem.controller.js';

const goBagItemRoutes: Router = Router();
const controller = new GoBagItemController();

export default goBagItemRoutes;
