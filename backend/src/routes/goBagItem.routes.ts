import { Router } from "express";

import GoBagItemController from "../controllers/goBagItem.controller";

const goBagItemRoutes = Router();
const controller = new GoBagItemController();

export default goBagItemRoutes;
