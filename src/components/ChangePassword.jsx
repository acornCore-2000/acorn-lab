import React, { useState } from "react";
import api from "../axiosConfig";
import PasswordInput from "./PasswordInput";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { BiSolidError } from "react-icons/bi";
import styles from "./ChangePassword.module.css";

function ChangePassword() {
  const [isChanging, setIsChanging] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [codeConfirmation, setCodeConfirmation] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatedNewPassword, setRepeatedNewPassword] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [hasEmail, setHasEmail] = useState(true);
  const [resendCodeSuccess, setResendCodeSuccess] = useState(false);
  const [resendCodeMessage, setResendCodeMessage] = useState("");
  const [resendCodeError, setResendCodeError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [wrongCode, setWrongCode] = useState(false);

  async function sendCode() {
    setVerificationCode("");
    setNewPassword("");
    setRepeatedNewPassword("");
    setCodeConfirmation(false);
    setIsPasswordChanged(false);

    try {
      const response = await api.post("/api/password-reset/send-code");

      if (response.data.confirmed) {
        setIsChanging(true);
        setHasEmail(true);
        setEmailError("");
      } else {
        setIsChanging(false);
        setHasEmail(false);
        setEmailError("Add and verify your email first.");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message);
    }
  }

  async function handleCodeConfirmation(e) {
    e.preventDefault();

    setResendCodeMessage("");
    setResendCodeError("");

    try {
      const response = await api.post(
        "/api/reset-password/code-confirmation",
        {
          code: verificationCode,
        }
      );

      setSuccess(response.data.success);
      setMessage(response.data.message);

      if (response.data.success) {
        setCodeConfirmation(true);
        setVerificationCode("");
        setWrongCode(false);
      } else {
        setWrongCode(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function changePassword(e) {
    e.preventDefault();

    const isValid =
      newPassword.length >= 12 && newPassword === repeatedNewPassword;

    if (!isValid) return;

    try {
      const response = await api.patch("/api/reset-password", {
        newPass: newPassword,
      });

      setIsPasswordChanged(response.data.success);
      setTimeout(()=>{
        setIsPasswordChanged(false);
      }, 5000)
      setCodeConfirmation(false);
      setIsChanging(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message);
    }
  }

  async function handleResendCode() {
    try {
      const response = await api.post("/api/reset-password/resend-code");

      if (response.data.success) {
        setResendCodeSuccess(true);
        setResendCodeMessage(response.data.message);
        setResendCodeError("");

      } else {
        setResendCodeSuccess(false);
        setResendCodeError("failed resending code.");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message);
    }
  }

  return (
    <div className={styles.wrapper}>
      {!isChanging && !codeConfirmation && (
        <div className={styles.card}>
          <button className={styles.primaryButton} onClick={sendCode}>
            change your password
          </button>

          {isPasswordChanged && (
            <p className={styles.successText}>
              your password has been successfully changed.
            </p>
          )}

          {emailError && (
            <p className={styles.errorText}>
              <BiSolidError size={18} />
              {emailError}
            </p>
          )}
        </div>
      )}

      {isChanging && !codeConfirmation && hasEmail && (
        <div className={styles.card}>
          <form onSubmit={handleCodeConfirmation} className={styles.form}>
            <label className={styles.label}>
              we sent a code to your email:
            </label>

            <input
              className={styles.input}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              placeholder="enter the code"
              required
            />
 {wrongCode && (
              <p className={styles.errorText}>code is incorrect</p>
            )}

            {resendCodeSuccess ? (
              <p className={styles.successText}>{resendCodeMessage}</p>
            ) : (
              resendCodeError && (
                <p className={styles.errorText}>{resendCodeError}</p>
              )
            )}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsChanging(false)}
              >
                cancel
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleResendCode}
              >
                resend
              </button>

              <button type="submit" className={styles.primaryButton}>
                confirm
              </button>
            </div>

           
          </form>
        </div>
      )}

      {codeConfirmation && (
        <div className={styles.card}>
          <form onSubmit={changePassword} className={styles.form}>
            <label className={styles.label}>enter new password:</label>

            <div className={styles.passwordRow}>
              {showPassword ? (
                <FaRegEyeSlash
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <FaEye onClick={() => setShowPassword(true)} />
              )}
            </div>

            <PasswordInput
              visibility={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="new password"
              name="password"
              mainPass={true}
            />

            <PasswordInput
              visibility={showPassword ? "text" : "password"}
              value={repeatedNewPassword}
              onChange={(e) => setRepeatedNewPassword(e.target.value)}
              placeholder="repeat password"
              name="password"
              mainPass={false}
            />

            {newPassword &&
              repeatedNewPassword &&
              newPassword !== repeatedNewPassword && (
                <p className={styles.errorText}>passwords don't match</p>
              )}

            {newPassword.length > 0 && newPassword.length < 12 && (
              <p className={styles.errorText}>
                minimum 12 characters required
              </p>
            )}

            <button type="submit" className={styles.primaryButton}>
              change password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChangePassword;