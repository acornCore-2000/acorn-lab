import React, { useState, useEffect } from "react";
import api from "../axiosConfig.js";
import { MdVerifiedUser } from "react-icons/md";
import { FaCircleExclamation } from "react-icons/fa6";
import { BiSolidError } from "react-icons/bi";
import styles from "./AddEmail.module.css";

function AddEmail() {
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);
  const [verifyClicked, setVerifyClicked] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [verificationFailure, setVerificationFailure] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCodeSuccess, setResendCodeSuccess] = useState(false);
  const [resendCode, setResendCode] = useState(false);
  const [resendCodeMessage, setResendCodeMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailValidity, setEmailValidity] = useState(true);
  const [isEmailTaken, setIsEmailTaken] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  useEffect(() => {
    async function getUser() {
      try {
        const response = await api.get("/api/user/db-info");
        if (response.data.email !== null) {
          setCurrentEmail(response.data.email);
          setEmail(response.data.email);
          setIsVerified(response.data.is_verified);
        }
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, []);

  async function sendVerificationCode(e) {
    e.preventDefault();
    setVerifyClicked(true);

    try {
      const response = await api.post("/api/email/verification-code", {
        email,
      });

      if (!response.data.success) {
        setEmailError(response.data.message);
        setIsEmailTaken(true);
        setVerifyClicked(false);
      } else {
        setEmailError("");
        setIsEmailTaken(false);
      }
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message);
    }
  }

  async function emailConfirmation(e) {
    e.preventDefault();

    try {
      
      if (emailRegex.test(email)) {
        const response = await api.post("/api/code/email-confirmation", {
          code: verificationCode,
          email,
        });

        setConfirmationSuccess(response.data.success);
        setConfirmationMessage(response.data.message);
        setIsVerified(response.data.isVerified);
        setTimeout(() => {
          setConfirmationSuccess(true);
        }, 3000);
        if (response.data.success) {
          setVerifyClicked(false);
          setVerificationCode("");
          setEditingEmail(false);
          setCurrentEmail(email);
          setVerificationFailure(false);
        } else {
          setVerificationFailure(true);
        }
      } else {
        setEmailValidity(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function resendCodeHandle() {
    try {
      const response = await api.post("/api/email/resend-code", {
        email,
      });

      if (response.data.success) {
        setResendCodeSuccess(true);
        setResendCodeMessage(response.data.message);
      }

      setResendCode(true);
      setTimeout(() => {
        setResendCode(false);
      }, 3000);
    } catch (error) {
      console.error(error);
      setResendCodeSuccess(false);
      alert(error.response?.data?.message);
    }
  }

  return (
    <div className={styles.wrapper}>
      {!editingEmail ? (
        <div className={styles.viewCard}>
          <div className={styles.row}>
            <p className={styles.emailText}>
              {currentEmail.length > 0 ? currentEmail : "add your email"}
            </p>

            <span className={styles.icon}>
              {isVerified ? (
                <MdVerifiedUser color="green" />
              ) : (
                <FaCircleExclamation color="red" />
              )}
            </span>
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setEditingEmail(true)}
          >
            {email || currentEmail.length > 0 ? "edit" : "add"}
          </button>
        </div>
      ) : (
        <div className={styles.editCard}>
          <form onSubmit={sendVerificationCode} className={styles.form}>
            <label className={styles.label}>
              {currentEmail || email.length > 0
                ? "edit your email address:"
                : "add your email address:"}
            </label>

            <input
              className={styles.input}
              type="email"
              value={email}
              placeholder="your@email.com"
              required
              onChange={(e) => {
                if (!verifyClicked) {
                  setEmail(e.target.value);
                  setIsEmailTaken(false);
                }

                if (!emailRegex.test(e.target.value)) {
                  setEmailValidity(false);
                } else {
                  setEmailValidity(true);
                }
              }}
            />
            {!emailValidity && (<p className={styles.errorText}>
              invalid email address
            </p>)}

            {isVerified && email === currentEmail && (
              <p className={styles.successText}>already verified!</p>
            )}

            {!verifyClicked && (
              <div className={styles.actions}>
                {isEmailTaken && (
                  <p className={styles.errorText}>
                    <BiSolidError color="red" size={18} /> {emailError}
                  </p>
                )}

                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    setEditingEmail(false);
                    setVerificationCode("");
                    setResendCodeMessage("");
                    setResendCodeSuccess(false);
                  }}
                >
                  cancel
                </button>

                {currentEmail !== email && !isEmailTaken && (
                  <button className={styles.primaryButton} type="submit">
                    verify
                  </button>
                )}
              </div>
            )}
          </form>

          {verifyClicked && (
            <form onSubmit={emailConfirmation} className={styles.form}>
              <label className={styles.label}>
                we sent you an email, enter the code below:
              </label>

              <input
                className={styles.input}
                placeholder="enter the code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />

              {!confirmationSuccess && (
                <p className={styles.infoText}>{confirmationMessage}</p>
              )}
              {resendCode && (
                <p
                  className={
                    resendCodeSuccess ? styles.successText : styles.errorText
                  }
                >
                  {resendCodeSuccess
                    ? resendCodeMessage
                    : "failed resending you the code"}
                </p>
              )}
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => {
                    setVerifyClicked(false);
                    setVerificationCode("");
                  }}
                >
                  cancel
                </button>

                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resendCodeHandle}
                >
                  resend code
                </button>

                <button type="submit" className={styles.primaryButton}>
                  confirm
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default AddEmail;
