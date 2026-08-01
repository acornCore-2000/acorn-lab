import { Router } from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";

const router = Router();

router.get("/api/dark-mode-status", checkAuth, async (req, res, next) => {
  try {
    const result = await myDB.query("SELECT * FROM users WHERE id= $1", [
      req.user.id,
    ]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post("/api/dark-mode-update", checkAuth, async (req, res, next) => {
  const dark_mode = req.body.dark_mode;
  const currentUserId = req.user.id;

  try {
    const result = await myDB.query(
      "UPDATE users SET dark_mode = $1 WHERE id=$2 RETURNING *",
      [dark_mode, currentUserId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
