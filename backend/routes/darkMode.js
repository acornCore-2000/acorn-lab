import { Router } from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { json } from "node:stream/consumers";

const router = Router();

router.get("/api/dark-mode-status", checkAuth, async (req, res) => {
  try {
    const result = await myDB.query("SELECT * FROM users WHERE id= $1", [
      req.user.id,
    ]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "failed fetching data (theme)" });
  }
});

router.post("/api/dark-mode-update", checkAuth, async (req, res) => {
  const dark_mode = req.body.dark_mode;
  const currentUserId = req.user.id;

  try {
    const result = await myDB.query(
      "UPDATE users SET dark_mode = $1 WHERE id=$2 RETURNING *",
      [dark_mode, currentUserId],
    );
    res.status(200).json(result.rows[0]);
   
  } catch (error) {
    console.error(error);
    json.status(500).json({ error: " dark mode failed" });
  }
});

export default router;
