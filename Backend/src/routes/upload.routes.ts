import express from "express";
import multer from "multer";
import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 1. Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

// 2. Configure Multer (Store in RAM temporarily)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // LIMIT: 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // SECURITY: Reject non-image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPG, PNG, WEBP) are allowed!"));
    }
  },
});

// 3. Upload Endpoint
router.post(
  "/",
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res): Promise<any> => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload to ImageKit
      const result = await imagekit.upload({
        file: req.file.buffer, // The file data
        fileName: `amar-jyoti-${Date.now()}-${req.file.originalname}`,
        folder: "/products", // Organized folder in ImageKit
        transformation: { 
           pre: 'q-80,w-1000' // Quality 80%, Max Width 1000px
        }
      });

      // Return the clean URL
      res.json({
        success: true,
        url: result.url,
        thumbnail: result.thumbnailUrl,
      });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ message: "Image upload failed" });
    }
  }
);

export default router;