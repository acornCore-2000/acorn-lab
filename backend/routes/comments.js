import Router from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { getIO } from "../socket/index.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/api/:postId/fetch-comments", checkAuth, async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const result = await myDB.query(
      "SELECT * FROM comments_users WHERE thought_id = $1 ORDER BY comment_id DESC",
      [postId],
    );
    res.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/api/post/:postId/add-comment",
  checkAuth,
  rateLimiter,
  async (req, res, next) => {
    const postId = req.params.postId;
    const comment = req.body.comment;
    const userId = req.user.id;

    try {
      await myDB.query(
        "INSERT INTO comments (thought_id, user_id, comment) VALUES ($1, $2, $3)",
        [postId, userId, comment],
      );

      const fetchData = await myDB.query(
        "SELECT * FROM comments_users WHERE thought_id = $1 ORDER BY comment_id DESC",
        [postId],
      );
      const io = getIO();

      io.to(`post-${postId}`).emit("new-comment", fetchData.rows);

      res.status(200).json(fetchData.rows);
    } catch (error) {
    next(error);
  }
  },
);

router.delete(
  "/api/:postId/comments/:id/delete",
  checkAuth,
  async (req, res, next) => {
    const comment_id = req.params.id;
    const postId = req.params.postId;

    try {
      const commentInfo = await myDB.query(
        "SELECT * FROM comments WHERE id = $1 AND user_id = $2",
        [comment_id, req.user.id],
      );
      if (commentInfo.rowCount === 0) {
        return res.status(403).json({ error: "not allowed" });
      }

      const result = await myDB.query(
        "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *",
        [comment_id, req.user.id],
      );

      try {
        const io = getIO();
        io.to(`post-${postId}`).emit("delete-comment", result.rows[0]);
      } catch (socketError) {
        console.error(socketError);
      }
      res.status(200).json({ success: true });
    } catch (error) {
     next(error);
    }
  },
);

router.put(
  "/api/thought/:postId/comment/:id/edit",
  checkAuth,
  async (req, res, next) => {
    const comment_id = req.params.id;
    const newComment = req.body.newComment;
    const postId = req.params.postId;

    try {
      const commentInfo = await myDB.query(
        "SELECT * FROM comments WHERE id = $1 AND user_id = $2",
        [comment_id, req.user.id],
      );
     

      if (commentInfo.rowCount === 0) {
        return res.status(403).json({ error: "not allowed" });
      }
      const response = await myDB.query(
        "UPDATE comments SET comment = $1, edited = $2 WHERE id = $3;",
        [newComment, true, comment_id],
      );
      const fetchData = await myDB.query(
        "SELECT * FROM comments_users WHERE thought_id = $1 ORDER BY comment_id DESC",
        [postId],
      );
      try {
        const io = getIO();
        io.to(`post-${postId}`).emit("edit-comment", fetchData.rows);
      } catch (socketError) {
        console.error("socket error: ", socketError);
      }
      res.status(201).json(fetchData.rows);
    } catch (error) {
    next(error);
  }
  },
);

router.post(
  "/api/thought/:postId/comment/:id/likes",
  checkAuth,
  async (req, res, next) => {
    const commentId = req.params.id;
    const postId = req.params.postId;
    const userId = req.user.id;
    try {
      const result = await myDB.query(
        "SELECT * FROM comments_likes WHERE user_id = $1 AND thought_id = $2 AND comment_id = $3",
        [userId, postId, commentId],
      );
      if (result.rowCount === 0) {
        await myDB.query(
          "INSERT INTO comments_likes (user_id, thought_id, comment_id, liked) VALUES ($1, $2, $3, $4)",
          [req.user.id, postId, commentId, true],
        );
        await myDB.query(
          "UPDATE comments SET likes = likes + 1  WHERE  id=$1",
          [commentId],
        );
      } else {
        if (result.rows[0].liked === true) {
          await myDB.query(
            "UPDATE comments SET likes = likes - 1 WHERE id=$1",
            [commentId],
          );
          await myDB.query(
            "UPDATE comments_likes SET liked = $1 WHERE user_id =$2 AND thought_id = $3 AND comment_id =$4",
            [false, userId, postId, commentId],
          );
        } else {
          await myDB.query(
            "UPDATE comments SET likes = likes + 1  WHERE  id=$1",
            [commentId],
          );
          await myDB.query(
            "UPDATE comments_likes SET liked = $1 WHERE user_id =$2 AND thought_id = $3 AND comment_id =$4",
            [true, userId, postId, commentId],
          );
        }
      }

      const newData = await myDB.query(
        "SELECT * FROM comments_users WHERE thought_id = $1 ORDER BY comment_id DESC",
        [postId],
      );
      try {
        const io = getIO();
        io.to(`post-${postId}`).emit("like-comment", newData.rows);
      } catch (socketError) {
        console.error("socket error: ", socketError);
      }
      res.status(200).json(newData.rows);
    } catch (error) {
    next(error);
  }
  },
);

export default router;
