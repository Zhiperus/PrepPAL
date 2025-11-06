import { Router } from "express";

import ModuleController from "../controllers/module.controller";

const moduleRoutes = Router();
const controller = new ModuleController();

export default moduleRoutes;
