import { uploadToCloudinary } from '@repo/shared';

import PostRepository, { GetPostsOptions } from '../repositories/post.repository.js';


export interface CreatePostInput {
  userId: string;
  file: Express.Multer.File;
}

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
   * Uploads the image to Cloudinary and snapshots the user's current GoBag items.
   */
  async createPost(data: CreatePostInput) {
    const { userId, file } = data;

    // Upload image to Cloudinary using the same pattern as profile picture
    let url: string;
    let publicId: string;

    try {
      const result = await uploadToCloudinary(file, userId, 'posts');
      url = result.url;
      publicId = result.publicId;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // Create the post with the uploaded image URL and ID
    return this.postRepo.create({
      userId,
      imageUrl: url,
      imageId: publicId,
    });
  }
}