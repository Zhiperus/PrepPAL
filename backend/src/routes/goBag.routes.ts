import { Router } from 'express';

import GoBagController from '../controllers/goBag.controller.js';

const goBagRoutes: Router = Router();
const controller = new GoBagController();

export default goBagRoutes;
