import { Router } from 'express';

import PostController from '../controllers/post.controller.js';

const postRoutes: Router = Router();
const controller = new PostController();

export default postRoutes;
