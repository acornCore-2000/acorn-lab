import React from "react";
import { useState, useRef, useEffect, useContext } from "react";
import api from "../axiosConfig.js";
import { useNavigate, Link, replace } from "react-router-dom";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import PasswordInput from "../components/PasswordInput.jsx";
import styles from "./Login.module.css";
import AuthContext from "../context/AuthContext.jsx";

function Login() {
  const userRef = useRef(null);
  const [password, setPassword] = useState("");
  const [doesExist, setDoesExist] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [settingUsername, setSettingUsername] = useState(false);
  const [usernameValidity, setUsernameValidity] = useState(false);
  const { user, loading, login } = useContext(AuthContext);

  const navigate = useNavigate();
  const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;

  useEffect(() => {
    if (!loading && user) {
      navigate("/thoughts", { replace: true });
    }
  }, [user, loading, navigate]);

  async function checkLogin(event) {
    event.preventDefault();

    try {
      if (usernameRegex.test(userRef.current.value)) {
        const response = await api.post("/api/login", {
          username: userRef.current.value,
          password: password,
        });
        login(response.data.user);
        navigate("/thoughts", { replace: true });
      }
    } catch (error) {
      setDoesExist(false);
      setError("user not found, try again or register!");
    }
  }

  return (
    <div className={styles.loginContainer}>
      <form onSubmit={checkLogin} className={styles.loginForm}>
        <input
          ref={userRef}
          type="text"
          placeholder="username"
          name="username"
          autoComplete="username"
          onChange={() => {
            setSettingUsername(true);
            if (!usernameRegex.test(userRef.current.value)) {
              setUsernameValidity(false);
            } else {
              setUsernameValidity(true);
            }
          }}
          required
          className={styles.input}
        />
        {settingUsername && !usernameValidity &&(
          <p className={styles.error}>
            Invalid username. Use 6–20 characters, letters, numbers, and underscores only.
          </p>
        )}
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
          }}
          placeholder="Enter your password"
          name="password"
          mainPass={true}
        />
        {!doesExist && <p className={styles.error}>{error}</p>}
        <div className={styles.buttons}>
          <button type="submit" className={styles.loginButton}>
            {" "}
            Login{" "}
          </button>
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

        <p className={styles.signupLink}>
          not a user? <Link to="/sign-up">register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
