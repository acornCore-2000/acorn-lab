import React, { useEffect } from "react";
import { useRef, useState, useContext } from "react";
import { Link, replace } from "react-router-dom";
import api from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import PasswordInput from "../components/PasswordInput";
import styles from "./SignUp.module.css";
import AuthContext from "../context/AuthContext";

function SignUp() {
  const navigate = useNavigate();
  const userRef = useRef(null);
  const [password, setPassword] = useState("");
  const [repeatedPass, setRepeatedPass] = useState("");
  const [isProblem, setIsProblem] = useState(false);
  const [errorMsg, setErrorMsg] = useState("null");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  const [settingPassword, setSettingPassword] = useState(false);
  const [settingUsername, setSettingUsername] = useState(false);
  const [usernameValidity, setUsernameValidity] = useState(false);
  const { user, loading, login } = useContext(AuthContext);

  const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;

  useEffect(() => {
    if (!loading && user) {
      navigate("/thoughts", { replace: true });
    }
  }, [user, loading, navigate]);

  async function checkSignUp(event) {
    event.preventDefault();

    setIsProblem(false);
    if (password !== repeatedPass) {
      setIsProblem(true);
      setErrorMsg("passwords don't match!");
      return;
    }
    try {
      if (password === repeatedPass && isPasswordStrong && usernameRegex.test(userRef.current.value)) {
        const response = await api.post(
          "/api/sign-up",
          { username: userRef.current.value, password: password },
          { withCredentials: true },
        );

        login(response.data.user);
        navigate("/thoughts", { replace: true });
      } else {
        setIsPasswordStrong(false);
      }
    } catch (error) {
      console.error(error);
      setIsProblem(true);
      setErrorMsg(error.response?.data?.error || "something went wrong!");
    }
  }

  return (
    <div className={styles.signupWrapper}>
      <div className={styles.signupBox}>
        <form onSubmit={checkSignUp}>
          <input
            type="text"
            ref={userRef}
            autoComplete="username"
            name="username"
            placeholder="username"
            onChange={() => {
              setSettingUsername(true);
              if (!usernameRegex.test(userRef.current.value)) {
                setUsernameValidity(false);
              } else {
                setUsernameValidity(true);
                
              }
            }}
            required
          />
          {!usernameValidity && settingUsername ? (
            <p className={styles.errorMsg}>
              Invalid username. Use 6–20 characters, letters, numbers, and underscores only.
            </p>
          ) : null}

          {showPassword ? (
            <FaRegEyeSlash
              size={13}
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            />
          ) : (
            <FaEye
              size={13}
              onClick={() => {
                setShowPassword(!showPassword);
              }}
            />
          )}
          <PasswordInput
            visibility={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setSettingPassword(true);
              if (password.length > 12) {
                setIsPasswordStrong(true);
              } else {
                setIsPasswordStrong(false);
              }
            }}
            placeholder="Enter your password"
            name="password"
            mainPass={true}
          />
   {!isPasswordStrong && settingPassword && (
            <p className={styles.errorMsg}>Your password should contain 12 or more than 12 charachters.</p>
          )}
          <PasswordInput
            visibility={showPassword ? "text" : "password"}
            value={repeatedPass}
            onChange={(e) => {
              setRepeatedPass(e.target.value);
              setSettingPassword(true);
              if (password.length > 12) {
                setIsPasswordStrong(true);
              } else {
                setIsPasswordStrong(false);
              }
            }}
            name="repeat_password"
            placeholder="Repeat your password"
            mainPass={false}
          />

          {isProblem && <p className={styles.errorMsg}>{errorMsg}</p>}
       

          <div className={styles.buttons}>
            <button type="submit">Sign Up</button>
            <p>or</p>
            <GoogleLogin
              onSuccess={async (res) => {
                try {
                  const response = await api.post("/api/google-login", {
                    credential: res.credential,
                  });
                  console.log(res.credential);
                  console.log("USER: ", response.data.user);
                  login(response.data.user);
                  navigate("/thoughts", { replace: true });
                } catch (error) {
                  console.error(error);
                }
              }}
              onError={() => {
                console.log("google authentication failed");
              }}
              theme="outline"
              size="medium"
              shape="circle"
              text="continue_with"
              logo_alignment="left"
            />
          </div>

          <p className={styles.loginLink}>
            already a user? <Link to="/login">login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
