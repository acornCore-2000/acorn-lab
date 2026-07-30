import React, { useState, useEffect } from "react";
import api from "../axiosConfig.js";

function ThemeLoader() {
  useEffect(() => {
    async function loadTheme() {
      try {
        const response = await api.get("/api/dark-mode-status");
        document.documentElement.setAttribute(
          "data-theme",
          response.data.dark_mode ? "dark" : "light",
        );
      } catch (error) {
        console.error(error);
      }
    }
    loadTheme();
  },[]);

  return null;
}

export default ThemeLoader;
