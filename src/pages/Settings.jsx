import React from "react";
import AddEmail from "../components/AddEmail";
import ChangePassword from "../components/ChangePassword.jsx";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import styles from "./Settings.module.css";

function Settings() {
  return (
    <>
    <Header />
    <div className={styles.settingsPage}>
      <div className={styles.settingsCard}>
        <p className={styles.sectionTitle}>email address</p>
        <AddEmail />
      </div>

      <div className={styles.settingsCard}>
        <p className={styles.sectionTitle}>password and authentication</p>
        <ChangePassword />
      </div>
      <>
      <Link to="/thoughts" className={styles.backBtn}>back</Link>
      </>
    </div></>
  );
}

export default Settings;