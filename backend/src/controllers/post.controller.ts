import { Request, Response } from "express";
import PostService from "../services/post.service";

export default class PostController {
  private postService = new PostService();
}
