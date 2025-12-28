import PostRepository, {
  CreatePostData,
  GetPostsOptions,
} from '../repositories/post.repository.js';

export default class PostService {
  private postRepo = new PostRepository();

  async getAllPosts(options: GetPostsOptions = {}) {
    return this.postRepo.findAll(options);
  }

  async getPostById(postId: string) {
    return this.postRepo.findById(postId);
  }

  async createPost(data: CreatePostData) {
    return this.postRepo.create(data);
  }
}
