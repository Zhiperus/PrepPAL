import { Request, Response } from "express";

import PostService from '../services/post.service.js';

export default class PostController {
  private postService = new PostService();
}
