import { Router } from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/api/me", checkAuth, (req, res, next) => {
  res.json({ userInfo: req.user });
});

router.get("/api/user/db-info", checkAuth, async (req, res, next) => {
  try {
    const dbUserInfo = await myDB.query(
      "SELECT * FROM public_users WHERE id=$1",
      [req.user.id],
    );
    return res.status(200).json(dbUserInfo.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/api/edit-profile",
  checkAuth,
  rateLimiter,
  async (req, res, next) => {
    try {
      const newName = req.body.currentName;
      const newUsername = req.body.currentUsername.trim();
      const newBio = req.body.currentBio;
      const newLastName = req.body.currentLastName;
      const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;
if (newBio.length > 300) {
 return res.status(400).json({
   message:"bio too long"
 });
}
      const checkUsername = await myDB.query(
        "SELECT * FROM users WHERE username = $1",
        [newUsername],
      );
      if (checkUsername.rowCount > 0 && req.user.username !== newUsername) {
        res
          .status(409)
          .json({ message: "This username is already taken!", success: false });
        return;
      } else if (usernameRegex.test(newUsername)) {
        const result = await myDB.query(
          "UPDATE users SET name=$1, surname = $2,  bio= $3, username=$4 WHERE id=$5 RETURNING id, username, name, avatar, surname, bio, dark_mode, email, is_verified",
          [newName, newLastName, newBio, newUsername, req.user.id],
        );
        return res.status(200).json({ success: true, userInfo: result.rows[0] });
      } else {
        res.status(409).json({ success: false, message: "invalid username" });
      }
    } catch (error) {
      next(error);
    }
  },
);

export default router;
