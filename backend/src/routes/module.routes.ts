import { Router } from 'express';

import ModuleController from '../controllers/module.controller.js';

const moduleRoutes: Router = Router();
const controller = new ModuleController();

// GET /modules - Get all modules with pagination
moduleRoutes.get('/', controller.getAllModules);

// GET /modules/search?q=... - Search modules by title/description
// This must come BEFORE /:id to avoid route conflicts
moduleRoutes.get('/search', controller.searchModules);

// GET /modules/:id - Get a single module by ID
moduleRoutes.get('/:id', controller.getModuleById);

export default moduleRoutes;
