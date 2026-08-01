import { Router } from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { getIO } from "../socket/index.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();


router.get("/api/fetch-thoughts", checkAuth, async (req, res, next) => {
  try {
    const response = await myDB.query(
      "SELECT * FROM fetch_all_data ORDER BY thought_id DESC;",
    );
    res.status(200).json(response.rows);
  } catch (error) {
    next(error);
  }
});

router.post("/api/thoughts/add-post", checkAuth, rateLimiter, async (req, res, next) => {
  try {
    const post = req.body.post;

    await myDB.query("INSERT INTO thoughts (user_id, post) VALUES ($1, $2);", [
      req.user.id,
      post,
    ]);

    const { rows } = await myDB.query(
      "SELECT * FROM fetch_all_data ORDER BY thought_id DESC;",
    );

    try {
      const io = getIO();
      io.emit("new-thought", rows[0]);
    } catch (socketError) {
      console.error("Socket error:", socketError.message);
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete("/api/thoughts/:id/clear", checkAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await myDB.query(
      "DELETE FROM thoughts WHERE id=$1 AND user_id = $2 RETURNING *;",
      [id, req.user.id],
    );
if(result.rowCount === 0){
  return res.status(403).json({error:"not allowed"})
}
    try {
      const io = getIO();
      io.emit("delete-thought", result.rows[0]);
    } catch (socketError) {
      console.error("socket error: ", socketError);
    }
    res.status(200).json({ message: "deleted!" });
  }catch (error) {
    next(error);
  }
});

router.put("/api/thoughts/:id/edit", checkAuth, async (req, res, next) => {
  try {
    const post = req.body.post;
    const id = req.params.id;

    const { rows } = await myDB.query(
      "UPDATE thoughts SET post=$1, is_edited=$2 WHERE id=$3 AND user_id=$4 RETURNING *",
      [post, true, id, req.user.id],
    );

    if (!rows[0]){
      return res.status(403).json({error:"not allowed"})
    }
    try {
      const io = getIO();
      io.emit("edit-thought", rows[0]);
    } catch (socketError) {
      console.error("socket error: ", socketError);
    }
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/api/thought/:id/like", checkAuth, async (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    const doesExist = await myDB.query(
      "SELECT * FROM likes WHERE thought_id = $1 AND user_id=$2",
      [id, userId],
    );

    if (doesExist.rows.length === 0) {
      await myDB.query(
        "INSERT INTO likes (user_id, thought_id, liked) VALUES ($1, $2, $3)",
        [userId, id, true],
      );

      await myDB.query(
        "UPDATE thoughts SET like_received = like_received + 1 WHERE id = $1",
        [id],
      );
    } else {
      const isLiked = await myDB.query(
        "SELECT * FROM likes WHERE user_id = $1 AND thought_id = $2",
        [userId, id],
      );

      if (isLiked.rows[0].liked === true) {
        await myDB.query(
          "UPDATE thoughts SET like_received = like_received - 1 WHERE id = $1",
          [id],
        );

        await myDB.query(
          "UPDATE likes SET liked = $1 WHERE user_id = $2 AND thought_id = $3",
          [false, userId, id],
        );
      } else {
        await myDB.query(
          "UPDATE thoughts SET like_received = like_received + 1 WHERE id = $1",
          [id],
        );

        await myDB.query(
          "UPDATE likes SET liked = $1 WHERE user_id = $2 AND thought_id = $3",
          [true, userId, id],
        );
      }
    }

    const result = await myDB.query(
      "SELECT * FROM fetch_all_data ORDER BY thought_id DESC;",
    );
    try{
      const io = getIO();
      io.emit("like-thought", result.rows)
    }
    catch(socketError){
      console.error("socket error: ", socketError);
    }
    res.status(201).json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;
