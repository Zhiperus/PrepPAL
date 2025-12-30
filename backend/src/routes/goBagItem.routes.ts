import { Router } from 'express';

import GoBagItemController from '../controllers/goBagItem.controller.js';

const goBagItemRoutes: Router = Router();
const controller = new GoBagItemController();

// TODO: Add Admin Auth
goBagItemRoutes.get('/', controller.findAll.bind(controller));
goBagItemRoutes.get('/:id', controller.findById.bind(controller));

export default goBagItemRoutes;
