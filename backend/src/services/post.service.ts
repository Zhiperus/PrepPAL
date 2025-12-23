import PostRepository from '../repositories/post.repository.js';

export default class PostService {
  private postRepo = new PostRepository();
}
