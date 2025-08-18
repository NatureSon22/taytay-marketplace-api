import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "links", 
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

const upload = multer({ storage });

export default upload;
