import React, { useState, useEffect } from "react";
import api from "../axiosConfig.js";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import styles from "./DarkMode.module.css";

function DarkModeButton() {
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    async function checkDarkMode() {
      try {
        const response = await api.get("/api/dark-mode-status");
        setDarkMode(response.data.dark_mode);
      } catch (error) {
        console.error(error);
      }
    }

    checkDarkMode();
  }, []);

  if (darkMode === null) return null;

  async function darkModeHandle() {
    try {
      const response = await api.post("/api/dark-mode-update", {
        dark_mode: !darkMode,
      });

      setDarkMode(response.data.dark_mode);

      document.cookie = `theme=${
        response.data.dark_mode ? "dark" : "light"
      }; path=/; max-age=31536000`;

      document.documentElement.setAttribute(
        "data-theme",
        response.data.dark_mode ? "dark" : "light"
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      type="button"
      onClick={darkModeHandle}
      className={styles.toggleButton}
      aria-label="toggle theme"
    >
      <div className={styles.iconWrapper}>
        {darkMode ? (
          <MdLightMode size={20} />
        ) : (
          <MdDarkMode size={20} />
        )}
      </div>

      <span className={styles.label}>
        {darkMode ? "Light" : "Dark"}
      </span>
    </button>
  );
}

export default DarkModeButton;