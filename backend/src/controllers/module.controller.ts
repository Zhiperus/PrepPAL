import { Request, Response } from "express";
import ModuleService from "../services/module.service";

export default class ModuleController {
  private moduleService = new ModuleService();
}
