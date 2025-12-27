import { Request, Response } from 'express';
import multer from 'multer';

import { upload } from '../middleware/upload.middleware.js';

export const parseFileRequest = (
  req: Request,
  res: Response,
): Promise<Express.Multer.File> => {
  return new Promise((resolve, reject) => {
    const process = upload.single('image');

    process(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return reject(new Error('File is too large. Maximum limit is 10MB.'));
        }
        return reject(err);
      }
      if (err) return reject(err);
      if (!req.file) return reject(new Error('No image file provided'));

      resolve(req.file);
    });
  });
};
