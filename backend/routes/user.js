import { Router } from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { userInfo } from "node:os";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/api/me", checkAuth, (req, res) => {
  res.json({userInfo: req.user, cookies:req.cookies});
  
});

router.get("/api/user/db-info", checkAuth, async (req, res) => {
  try {
    const dbUserInfo = await myDB.query("SELECT * FROM public_users WHERE id=$1", [
      req.user.id,
    ]);
    res.json(dbUserInfo.rows[0]);
  } catch (error) {
    console.error(error);
    res.json({ error: "fetching info failed" });
  }
});

router.patch("/api/edit-profile", checkAuth, rateLimiter, async (req, res) => {
  try {
    const newName = req.body.currentName;
    const newUsername = req.body.currentUsername;
    const newBio = req.body.currentBio;
    const newLastName = req.body.currentLastName;
     const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;

    const checkUsername = await myDB.query(
      "SELECT * FROM users WHERE username = $1",
      [newUsername],
    );
    if (checkUsername.rowCount > 1 && req.user.username !== newUsername) {
      res
        .status(500)
        .json({ message: "This username is already taken!", success: false , });
      return;
    } else if (usernameRegex.test(newUsername)){
 const result = await myDB.query(
      "UPDATE users SET name=$1, surname = $2,  bio= $3, username=$4 WHERE id=$5 RETURNING id, username, name, avatar, surname, bio, dark_mode, email, is_verified",
      [newName, newLastName, newBio, newUsername, req.user.id],
    );
    res.status(200).json({success:true, userInfo:result.rows[0]});
    } else {
       res.status(409).json({success:false, message:"invalid username"});
    }
    
   
  } catch (error) {
    console.error(error);
    res.json({ error: "changing profile info failed" });
  }
});

export default router;
