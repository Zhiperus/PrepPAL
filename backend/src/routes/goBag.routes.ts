import { Router } from 'express';

import GoBagController from '../controllers/goBag.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const goBagRoutes: Router = Router();
const controller = new GoBagController();

goBagRoutes.use(authenticate);

goBagRoutes.get('/', controller.getGoBag.bind(controller));
goBagRoutes.patch('/', controller.updateGoBag.bind(controller));

export default goBagRoutes;
