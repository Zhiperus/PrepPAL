import { UploadApiOptions } from "cloudinary";

import cloudinary from "./cloudinary.config.js";

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  userId: string,
  subFolder: "profile" | "posts" | "others" = "others"
) => {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const options: UploadApiOptions = {
      folder: `preppal/user_uploads/${userId}/${subFolder}`,
      public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
      allowed_formats: ["jpg", "png", "jpeg"],
    };

    if (subFolder === "profile") {
      options.transformation = [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ];
    } else if (subFolder === "posts") {
      options.transformation = [
        { width: 1200, crop: "limit" }, // Resize only if larger than 1200px
        { quality: "auto" }, // Compression
        { fetch_format: "auto" }, // Modern file formats (WebP/AVIF)
      ];
    }

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
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
