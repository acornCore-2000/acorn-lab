import e, { Router } from "express";
import { myDB } from "../app.js";
import { checkAuth } from "./auth.js";
import { randomInt } from "crypto";
import { Resend } from "resend";
import { userInfo } from "os";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import bcrypt from "bcrypt";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/api/email/verification-code", checkAuth, rateLimiter, async (req, res) => {
  const email = req.body.email;
  const userId = req.user.id;

  try {
    if (emailRegex.test(email)) {
      const verificationCode = randomInt(100000, 1000000);
      const doesExist = await myDB.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );
      if (doesExist.rowCount > 0) {
        return res.json({
          message: "An account with this email already exists.",
          success: false,
        });
      } else {
        await myDB.query(
          "UPDATE users SET verification_code = $1, verification_expires_at = NOW() + INTERVAL '10 minutes' WHERE id = $2",
          [verificationCode, req.user.id],
        );
        // const mailerSender = new MailerSend({
        //   apiKey: process.env.MAILERSEND_API_KEY,
        // });

        // const sentFrom = new Sender(
        //   "noreply@test-pzkmgq7m79yl059v.mlsender.net",
        //   "thoughts.com",
        // );
        // const recipients = [new Recipient(email)];

        // const emailParams = new EmailParams()
        //   .setFrom(sentFrom)
        //   .setTo(recipients)
        //   .setSubject("Verify your email - Thoughts")
        //   .setHtml(
        //     `  <p>Use this code to verify your email address :
        //   <strong>${verificationCode}</strong>
        // </p>
        // <p>This code expires in 10 minutes</p>`,
        //   );
        // await mailerSender.email.send(emailParams);

        return res.status(200).json({
          success: true,
          message: "verification code sent",
        });
      }
    } else {
      res
        .status(409)
        .json({ message: "invalid email address", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "sending a verification code failed" });
  }
});

router.post("/api/email/resend-code", checkAuth, rateLimiter,  async (req, res) => {
  const email = req.body.email;
  let verificationCode = null;
  try {
    if (emailRegex.test(email)) {
      const result = await myDB.query(
        "SELECT * FROM users WHERE id = $1 AND verification_expires_at > NOW()",
        [req.user.id],
      );
      if (result.rowCount > 0) {
        verificationCode = result.rows[0].verification_code;
      } else {
        verificationCode = randomInt(100000, 1000000);
        await myDB.query(
          "UPDATE users SET verification_code = $1, verification_expires_at = NOW() + INTERVAL '10 minutes' WHERE id=$2 ",
          [verificationCode, req.user.id],
        );
      }

      // const mailerSender = new MailerSend({
      //   apiKey: process.env.MAILERSEND_API_KEY,
      // });

      // const sentFrom = new Sender(
      //   "noreply@test-pzkmgq7m79yl059v.mlsender.net",
      //   "thoughts.com",
      // );
      // const recipients = [new Recipient(email)];

      // const emailParams = new EmailParams()
      //   .setFrom(sentFrom)
      //   .setTo(recipients)
      //   .setSubject("Verify your email - Thoughts")
      //   .setHtml(
      //     `  <p> Use this code to verify your email address:
      //     <strong>${verificationCode}</strong>
      //   </p>
      //   <p>This code expires in 10 minutes</p>`,
      //   );
      // await mailerSender.email.send(emailParams);
      res
        .status(200)
        .json({ success: true, message: "we resent you the code." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: " resending code failed", success: false });
  }
});

router.post(
  "/api/reset-password/code-confirmation",
  checkAuth, rateLimiter,
  async (req, res) => {
    const verificationCode = Number(req.body.code);
    

    try {
      if (!verificationCode) {
        return res.status(400).json({
          success: false,
          message: "missing data",
        });
      } else {
        const doesExist = await myDB.query(
          "SELECT * FROM users WHERE change_password_code = $1 AND password_code_expires_at > NOW() AND id = $2 ",
          [verificationCode, req.user.id],
        );
        if (doesExist.rowCount > 0) {
          return res.status(200).json({
            success: true,
            message: "verification code is confirmed!",
          });
        } else {
          return res
            .status(200)
            .json({ success: false, message: "wrong code" });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "confirmation of code failed" });
    }
  },
);

router.post("/api/code/email-confirmation", checkAuth, async (req, res) => {
  const verificationCode = Number(req.body.code);
  const email = req.body.email;

  try {
    if (!verificationCode || !email) {
      return res.status(400).json({
        success: false,
        message: "missing data",
      });
    } else {
      const doesExist = await myDB.query(
        "SELECT * FROM users WHERE verification_code = $1 AND verification_expires_at > NOW() AND id = $2 ",
        [verificationCode, req.user.id],
      );
      if (doesExist.rowCount > 0 && emailRegex.test(email)) {
        await myDB.query(
          "UPDATE users SET email=$1, is_verified = true, verification_code = NULL, verification_expires_at = NULL WHERE id=$2",
          [email, req.user.id],
        );

        return res.status(200).json({
          success: true,
          message: "Your email is successfully comfirmed!",
          isVerified: true,
        });
      } else if (!emailRegex.test(email)) {
        return res
          .status(200)
          .json({
            success: false,
            message: "invalid email address",
            isVerified: false,
          });
      } else {
        res
          .status(200)
          .json({ success: false, message: "wrong code", isVerified: false });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "email confirmation failed" });
  }
});

router.post("/api/reset-password/resend-code", checkAuth, rateLimiter, async (req, res) => {
  
  
  let passwordResetCode = null;
  try {
    const getEmail = await myDB.query("SELECT email FROM public_users WHERE id = $1", [req.user.id]);
    const email = getEmail.rows[0].email;
   
    const result = await myDB.query(
      "SELECT * FROM users WHERE id = $1 AND password_code_expires_at > NOW()",
      [req.user.id],
    );
    if (result.rowCount > 0 && emailRegex.test(email)) {
      passwordResetCode = result.rows[0].change_password_code;
    } else {
      passwordResetCode = randomInt(100000, 1000000);
      await myDB.query(
        "UPDATE users SET  change_password_code= $1, password_code_expires_at = NOW() + INTERVAL '10 minutes' WHERE id=$2 ",
        [passwordResetCode, req.user.id],
      );
    }

    // const mailerSender = new MailerSend({
    //   apiKey: process.env.MAILERSEND_API_KEY,
    // });

    // const sentFrom = new Sender(
    //   "noreply@test-pzkmgq7m79yl059v.mlsender.net",
    //   "thoughts.com",
    // );
    // const recipients = [new Recipient(email)];

    // const emailParams = new EmailParams()
    //   .setFrom(sentFrom)
    //   .setTo(recipients)
    //   .setSubject("reset your password - Thoughts")
    //   .setHtml(
    //     `  <p> Use this code to reset your password:
    //     <strong>${passwordResetCode}</strong>
    //   </p>
    //   <p>This code expires in 10 minutes</p>`,
    //   );
    // await mailerSender.email.send(emailParams);
    res.status(200).json({ success: true, message: "we resent you the code." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: " resending code failed", success: false });
  }
});

router.post("/api/password-reset/send-code", checkAuth, rateLimiter, async (req, res) => {
  const userId = req.user.id;
  try {
    const isConfirmed = await myDB.query(
      "SELECT * FROM users WHERE id = $1 AND is_verified = true",
      [userId],
    );
    if (isConfirmed.rowCount === 0) {
      return res.status(200).json({
        success: false,
        confirmed: false,
      });
    }
    const verificationCode = randomInt(100000, 1000000);
    const email = isConfirmed.rows[0].email;

    await myDB.query(
      "UPDATE users SET change_password_code = $1, password_code_expires_at = NOW() + INTERVAL '10 minutes' WHERE id = $2",
      [verificationCode, req.user.id],
    );

    // const mailerSender = new MailerSend({
    //   apiKey: process.env.MAILERSEND_API_KEY,
    // });

    // const sentFrom = new Sender(
    //   "noreply@test-pzkmgq7m79yl059v.mlsender.net",
    //   "thoughts.com",
    // );

    // const recipients = [new Recipient(email)];

    // const emailParams = new EmailParams()
    //   .setFrom(sentFrom)
    //   .setTo(recipients)
    //   .setSubject("Reset your password - Thoughts").setHtml(`
    //     <p>Use this code to reset your password:</p>
    //     <strong>${verificationCode}</strong>
    //     <p>This code expires in 10 minutes</p>
    //   `);

    // await mailerSender.email.send(emailParams);

    return res.status(200).json({
      success: true,
      confirmed: true,
      email: email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "sending code failed",
    });
    console.log(req.body);
  }
});

router.patch("/api/reset-password", checkAuth, async (req, res) => {
  const userId = req.user.id;
  const newPass = req.body.newPass;
  try {
    if (newPass.length >= 12) {
      const hash = await bcrypt.hash(newPass, 10);
      await myDB.query(
        "UPDATE users SET password = $1, change_password_code = NULL, password_code_expires_at = NULL WHERE id = $2",
        [hash, userId],
      );
      res.status(200).json({
        message: "your password has been successfully changed.",
        success: true,
      });
    } else {
      res
        .status(409)
        .json({
          message: "password must be at least 12 characters long.",
          success: false,
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: " password change failed", success: false });
  }
});

export default router;
