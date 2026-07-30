import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../utils/s3.js";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/api/upload-avatar",
  checkAuth, rateLimiter,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;

      if (!file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Only image files are allowed",
        });
      }

      const ext = file.originalname.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const key = `profile-pics/${fileName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: "public-read",
        }),
      );

      const avatarUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;

      const result = await myDB.query("SELECT avatar FROM users WHERE id=$1", [
        req.user.id,
      ]);

      const oldAvatar = result.rows[0]?.avatar;

      await myDB.query("UPDATE users SET avatar=$1 WHERE id=$2", [
        avatarUrl,
        req.user.id,
      ]);

      if (oldAvatar) {
        try {
          const oldKey = oldAvatar.split(`${process.env.S3_BUCKET_NAME}/`)[1];

          if (oldKey) {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: oldKey,
              }),
            );
          }
        } catch (err) {
          console.error("Failed to delete old avatar:", err);
        }
      }

      res.status(201).json({
        success: true,
        avatar: avatarUrl,
        message : "Your avatar has been successfully changed."
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        error: "Upload failed",
      });
    }
  },
);

router.delete("/api/delete-avatar", checkAuth, async (req, res) => {
  try {
    const result = await myDB.query("SELECT * FROM users WHERE id = $1", [
      req.user.id,
    ]);
    
    const oldAvatar = result.rows[0].avatar;
    if(oldAvatar){
      const oldKey = oldAvatar.split(`${process.env.S3_BUCKET_NAME}/`)[1];
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: oldKey,
      }),
    );

    }
        const updateAvatar = await myDB.query("UPDATE users SET avatar=NULL WHERE id=$1 RETURNING *", [req.user.id]);

        res.status(200).json({ success: true, user: updateAvatar.rows[0]});

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed deleting avatar." });
  }
});

export default router;
