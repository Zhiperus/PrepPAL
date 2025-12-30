import { Request, Response } from 'express';

import { upload } from '../middleware/upload.middleware.js';

export const parseFile = (
  req: Request,
  res: Response,
  fieldName: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
