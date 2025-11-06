import PostRepository from "../repositories/post.repository";

export default class PostService {
  private postRepo = new PostRepository();
}
