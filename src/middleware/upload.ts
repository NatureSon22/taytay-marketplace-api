import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";
import { FileFilterCallback } from "multer";
import cloudinary from "../config/cloudinary";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXT: string[] = ["jpg", "png", "jpeg", "webp"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (): Promise<{
    folder: string;
    allowed_formats: string[];
  }> => ({
    folder: "links",
    allowed_formats: ALLOWED_EXT,
  }),
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = (file.mimetype || "").split("/")[1];
  if (!ext) return cb(new Error("Invalid file type"));
  if (!ALLOWED_EXT.includes(ext.toLowerCase()))
    return cb(new Error("Only images are allowed"));

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export default upload;
