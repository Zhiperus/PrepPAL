import { Request, Response } from "express";

import UserService from "../services/user.service";

export default class UserController {
  private userService = new UserService();
}
