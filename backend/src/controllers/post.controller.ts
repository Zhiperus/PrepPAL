import { NextFunction, Request, Response } from 'express';

import { handleInternalError } from '../errors/index.js';
import PostService from '../services/post.service.js';

export default class PostController {
  private postService = new PostService();

  verifyPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const verifiedData = await this.postService.verifyPostItems(req.body);
      res.json({ data: verifiedData });
    } catch (e) {
      handleInternalError(e, next);
    }
  };
}
