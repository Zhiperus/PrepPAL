import { Router } from "express";
import GoBagController from "../controllers/goBag.controller";

const goBagRoutes = Router();
const controller = new GoBagController();

export default goBagRoutes;
