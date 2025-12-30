import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import cloudinary from "./cloudinary.config.js";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  userId: string,
  subFolder: "profile" | "posts" | "others" = "others"
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    // Convert current time to Base36
    const shortTime = Date.now().toString(36);
    const shortId = Math.random().toString(36).substring(7);

    const options: UploadApiOptions = {
      public_id: `pp/u/${userId}/${subFolder}/${shortTime}_${shortId}`,
      use_filename: false,
      unique_filename: false,
      overwrite: true,
      allowed_formats: ["jpg", "png", "jpeg"],
      resource_type: "auto",
    };

    // Apply transformations
    if (subFolder === "profile") {
      options.transformation = [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ];
    } else if (subFolder === "posts") {
      options.transformation = [
        { width: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ];
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Error deleting from Cloudinary:", error);
        return reject(error);
      }
      resolve(result);
    });
  });
};
