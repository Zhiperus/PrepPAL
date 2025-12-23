import { Router } from 'express';

import ModuleController from '../controllers/module.controller.js';

const moduleRoutes: Router = Router();
const controller = new ModuleController();

export default moduleRoutes;
