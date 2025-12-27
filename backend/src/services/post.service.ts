import PostRepository, {
  GetPostsOptions,
} from '../repositories/post.repository.js';

export default class PostService {
  private postRepo = new PostRepository();

  async getPosts(options: GetPostsOptions) {
    return this.postRepo.findAll(options);
  }
}
