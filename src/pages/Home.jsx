import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "./Home.module.css";
import { GoogleLogin } from "@react-oauth/google";
import api from "../axiosConfig";
import AuthContext from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && user) {
      navigate("/thoughts", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <>
      <div className={styles.homeContainer}>
        <div className={styles.homeMessage}>
          <h1 className={styles.homeTitle}>
            Welcome! Join us and share your thoughts with the world!
          </h1>
        </div>

        <div className={styles.homeButtons}>
          
            <Link to="/sign-up" className={styles.signUpButton}>sign up</Link>
         

          
            <Link to="/login" className={styles.loginButton}>login</Link>
        
          <p>or</p>
          <GoogleLogin
            onSuccess={async (res) => {
              try {
                const response = await api.post("/api/google-login", {
                  credential: res.credential,
                });
                console.log(res.credential);
                console.log("USER: ", response.data.user);
                window.location.href = "/thoughts";
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
      </div>
    </>
  );
}

export default Home;
