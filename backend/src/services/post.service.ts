import PostRepository, {
  CreatePostData,
  GetPostsOptions,
} from '../repositories/post.repository.js';

export default class PostService {
  private postRepo = new PostRepository();

  /**
   * Gets all posts with optional sorting options.
   * Delegates to repository for data access.
   */
  async getAllPosts(options: GetPostsOptions = {}) {
    return this.postRepo.findAll(options);
  }

  /**
   * Gets a single post by its ID.
   */
  async getPostById(postId: string) {
    return this.postRepo.findById(postId);
  }

  /**
   * Creates a new post for the authenticated user.
   * Automatically snapshots the user's current GoBag items.
   */
  async createPost(data: CreatePostData) {
    return this.postRepo.create(data);
  }
}

