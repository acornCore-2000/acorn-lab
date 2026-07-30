import React, { useEffect, useState, useContext } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router-dom";
import { User, Settings, Lightbulb, LogOutIcon } from "lucide-react";
import navIcon from "../assets/navIcon.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../axiosConfig.js";
import styles from "./Header.module.css";
import DarkModeButton from "./DarkModeButton.jsx";
import AuthContext from "../context/AuthContext.jsx";

function Header() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    async function getAvatar() {
      try {
        const response = await api.get("/api/user/db-info");
        setUserInfo(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    getAvatar();
  }, []);
  if (!userInfo) return null;

  async function logoutt(event) {
    event.preventDefault();
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <nav className={styles.header}>
      <div className={styles.headerContainer}>
        <p className={styles.brand}>
          Thinking...
          
        </p>
        <div className={styles.headerRight}>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <div className={styles.profileTrigger}>
                <div className={styles.avatarContainer}>
                  <img
                    src={userInfo.avatar ? userInfo.avatar : "/noavatar.png"}
                    alt="avatar"
                    className={styles.avatarImg}
                  />
                </div>

                <p className={styles.username}>
                  {userInfo.name ? userInfo.name : <i>no name</i>}
                </p>
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className={styles.dropdownContent}
                side="bottom"
                align="end"
                sideOffset={10}
              >
                <DropdownMenu.Item className={styles.dropdownItem}>
                  <Link to="/settings" className={styles.dropdownLink}>
                    <Settings size={15} />
                    settings
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item className={styles.dropdownItem}>
                  <Link to="/profile" className={styles.dropdownLink}>
                    <User size={15} />
                    profile
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item className={styles.dropdownItem}>
                  <Link to="/my-thoughts" className={styles.dropdownLink}>
                    <Lightbulb size={15} />
                    my thoughts
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild className={styles.dropdownItem}>
                  <button onClick={logoutt} className={styles.logoutButton}>
                    <LogOutIcon size={15} />
                    logout
                  </button>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <DarkModeButton />
        </div>
      </div>
    </nav>
  );
}

export default Header;
