import React, { useState, useEffect } from "react";
import api from "../axiosConfig.js";
import { useNavigate } from "react-router-dom";
import { data, Link } from "react-router-dom";
import styles from "./ProfileInfo.module.css";
import SetProfilePic from "./SetProfilePic.jsx";


function ProfileInfo() {
  const [user, setUser] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentBio, setCurrentBio] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [currentLastName, setCurrentLastName] = useState("");
  const [editAvatar, setEditAvatar] = useState(false);
  const [usernameValidity, setUsernameValidity] = useState(true);
  const [usernameTaken, setUsernameTaken] = useState(false);

  const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/;
const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [userInfo, sessionInfo] = await Promise.all([
          api.get("/api/user/db-info"),
          api.get("/api/me"),
        ]);
        setUser(userInfo.data);
        setUserSession(sessionInfo.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;
  if (!userSession) return null;

  function editClicked() {
    setCurrentUsername(user.username);
    setCurrentName(user.name);
    setCurrentBio(user.bio);
    setCurrentLastName(user.surname);
    setIsEditing(true);
  }

  async function changeClicked(e) {
    e.preventDefault();

    if (!usernameRegex.test(currentUsername)) {
      setUsernameValidity(false);
      return;
    }

    try {
      const response = await api.patch("/api/edit-profile", {
        currentName,
        currentUsername,
        currentBio,
        currentLastName,
      });

      if (!response.data.success) {
        setUsernameTaken(true);
        return;
      }

      setCurrentUsername(response.data.username);
      setCurrentName(response.data.name);
      setCurrentLastName(response.data.surname);
      setCurrentBio(response.data.bio);

      if (response.data.userInfo) {
        setUser(response.data.userInfo);
      }

      setIsEditing(false);
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message);
    }
  }
  function refreshAvatar(url) {
    setUser({ ...user, avatar: url });
  }

  return (
    <>
      
      <div className={styles.profileLayout}>
        <div className={styles.profileContainer}>
          {isEditing ? (
            <form onSubmit={changeClicked}>
              <label htmlFor="username">username</label>
              <input
                id="username"
                name="username"
                type="text"
                value={currentUsername === "no username" ? "" : currentUsername}
                onChange={(e) => {
                  setCurrentUsername(e.target.value);
                  setUsernameTaken(false);

                  if (!usernameRegex.test(e.target.value)) {
                    setUsernameValidity(false);
                  } else {
                    setUsernameValidity(true);
                  }
                }}
              />
              {usernameTaken && <p>This username is already taken</p>}

              {!usernameValidity && (
                <p className={styles.errMsg}>
                  Invalid username. Use 6–20 characters, letters, numbers, and
                  underscores only.
                </p>
              )}
              <label htmlFor="name">name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={currentName}
                onChange={(e) => {
                  setCurrentName(e.target.value);
                }}
              />
              <label htmlFor="lastName">last name</label>
              <input
                name="lastName"
                id="lastName"
                type="text"
                value={currentLastName}
                onChange={(e) => {
                  setCurrentLastName(e.target.value);
                }}
              />
              <label htmlFor="bio">bio</label>
              <input
                id="bio"
                name="bio"
                type="text"
                value={currentBio}
                onChange={(e) => {
                  setCurrentBio(e.target.value);
                }}
              />
              <button type="submit"> change </button>
              <button onClick={() => setIsEditing(false)}> close </button>
            </form>
          ) : (
            <div>
              <div className={styles.avatarWrapper}>
                <img
                  src={user.avatar ? user.avatar : "/noavatar.png"}
                  alt="avatar"
                  className={styles.profileAvatar}
                  style={{ width: 100, borderRadius: "50%" }}
                />
              </div>
              <h2>
                {currentName
                  ? currentName + " " + currentLastName
                  : user.name + " " + user.surname}
              </h2>
              <h3>{currentUsername ? currentUsername : user.username}</h3>
              <p>{currentBio ? currentBio : user.bio}</p>
              {!editAvatar && (
                <button onClick={editClicked} className={styles.editButton}>
                  edit profile info
                </button>
              )}

              {!editAvatar && (
                <>
                <button
                  onClick={() => {
                    setEditAvatar(true);
                  }}
                  className={styles.changeAvatarButton}
                >
                  change avatar
                </button>
                <Link to="/thoughts" className={styles.backBtn}>back</Link>
                </>
              )}

             
              {editAvatar && (
                <div className={styles.avatarEditorPanel}>
                  <SetProfilePic refreshAvatar={refreshAvatar} />
              
                  
                  <button
                    type="submit"
                    onClick={() => {
                      setEditAvatar(false);
                    }}
                    style={{ background: "none", color: "#8E8E93" }}
                    className={styles.closeButton}
                  >
                    close
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProfileInfo;
