import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { myDB } from "../app.js";
import { OAuth2Client } from "google-auth-library";
import { randomInt, randomUUID } from "crypto";
import { json } from "stream/consumers";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); //google OAuth
const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;

function checkAuth(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ error: "not logged in." });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "invalid token" });
  }
}

router.post("/api/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.sendStatus(401);
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await myDB.query(
      "DELETE FROM refresh_tokens WHERE jti= $1",
      [payload.jti],
    );
    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.json({ message: "logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({message:"logout failed"})
  }
});

router.post("/api/sign-up", async (req, res) => {
  try {
    const { username, password } = req.body;
    const doesExist = await myDB.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    if (doesExist.rowCount > 0) {
      res.status(409).json({ error: "this username is already taken" });
    } else if (usernameRegex.test(username) && password.length >= 12) {
      const hash = await bcrypt.hash(password, 10);
      const result = await myDB.query(
        "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
        [username, hash],
      );
      const user = result.rows[0];

      const jti = randomUUID();

      const accessToken = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" },
      );

      const refreshToken = jwt.sign(
        { id: user.id, jti },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "30d" },
      );

      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      await myDB.query(
        "INSERT INTO refresh_tokens (user_id, jti, refresh_token_hash, expires_at, ip_address, user_agent ) VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', $4, $5)",
        [user.id, jti, refreshTokenHash, req.ip, req.headers["user-agent"]],
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 15,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 30,
      });

      res.status(201).json({
        message: "user created.",
        user: { id: user.id, username: user.username },
      });
      console.log(
        `your refresh token is : ${refreshToken}, and your access token is ${accessToken}`,
      );
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    console.error(error);
    
    res.status(409).json({ error: "the user already exists" });
  }
});

router.post("/api/refresh", async (req, res) => {
  try{
const refreshToken = req.cookies.refreshToken;

if (!refreshToken) {
  return res.sendStatus(401);
}
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const { rows } = await myDB.query(
    "SELECT * FROM refresh_tokens WHERE jti = $1",
    [payload.jti],
  );
  if (rows.length === 0) {
    return res.sendStatus(403);
  }
  const tokenRow = rows[0];
  const match = await bcrypt.compare(refreshToken, tokenRow.refresh_token_hash);
  if (!match) {
    return res.sendStatus(403);
  }
  const newJti = randomUUID();
  const newRefreshToken = jwt.sign(
    { id: payload.id, jti: newJti },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
    },
  );

  const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

  await myDB.query(
    "UPDATE refresh_tokens SET jti=$1, refresh_token_hash=$2, expires_at= NOW() + INTERVAL '30 days' WHERE id=$3",
    [newJti, newRefreshTokenHash, tokenRow.id],
  );
  const newAccessToken = jwt.sign(
    {
      id: payload.id,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 15,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  res.sendStatus(200);

  } catch(error){
   
      console.error(error);

  if (
    error.name === "TokenExpiredError" ||
    error.name === "JsonWebTokenError"
  ) {
    return res.sendStatus(403);
  }

  return res.status(500).json({
    message: "refreshing token failed",
  });
  }
  
});

router.post("/api/login", rateLimiter, async (req, res) => {
  try {
    
    const { username, password } = req.body;
    const { rows } = await myDB.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ error: "user not found" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "wrong password" });
    }
    const jti = randomUUID();

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, jti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await myDB.query(
      "INSERT INTO refresh_tokens (user_id, jti, refresh_token_hash, expires_at, ip_address, user_agent ) VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', $4, $5)",
        [user.id, jti, refreshTokenHash, req.ip, req.headers["user-agent"]],
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({ user: { id: user.id, username: user.username }, cookies:{accessToken: accessToken, refreshToken:refreshToken} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "login failed" });
  }
});

router.post("/api/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const userResult = await myDB.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    let user;
    if (userResult.rows.length === 0) {
      const newUser = await myDB.query(
        "INSERT INTO users ( email, username, password, avatar, is_verified, name) VALUES ($1, $2, $3 , $4, true, $5) RETURNING *",
        [
          email,
          email.split("@")[0] + "_" + randomInt(10000, 1000000),
          "google-oauth",
          picture, name
        ],
      );
      user = newUser.rows[0];
    } else {
      user = userResult.rows[0];
    }

     const jti = randomUUID();

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id, jti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "30d" },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await myDB.query(
      "INSERT INTO refresh_tokens (user_id, jti, refresh_token_hash, expires_at, ip_address, user_agent ) VALUES ($1, $2, $3, NOW() + INTERVAL '30 days', $4, $5)",
        [user.id, jti, refreshTokenHash, req.ip, req.headers["user-agent"]],
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 15,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "google login failed" });
  }
});

export default router;
export { checkAuth };
