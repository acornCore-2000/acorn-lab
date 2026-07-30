import React, { useRef, useState, useEffect } from "react";
import api from "../axiosConfig.js";
import styles from "./SetProfilePic.module.css";
import { Trash } from "lucide-react";

function SetProfilePic(props) {
  const picRef = useRef(null);
  const [profileLink, setProfilePicLink] = useState(null);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [deletedAvatar, setDeletedAvatar] = useState(false);
  const [changeAvatarMsg, setChangeAvatarMsg] = useState("");
  const [showSubmitBtn, setShowSubmitBtn] = useState(false);
  

  useEffect(() => {
    async function currentProfilePic() {
      try {
        const response = await api.get("/api/user/db-info");
        setProfilePicLink(response.data.avatar);
        if (!response.data.avatar){
          setDeletedAvatar(true);
        }
      } catch (error) {
        console.error(error);
      }
    }
    currentProfilePic();
  }, []);

  async function setProfilePic(e) {
    e.preventDefault();

    const file = picRef.current.files[0];

    if (!file) {
      setChangeAvatarMsg("Please, choose a pic first!");
      return;
    };

    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await api.post("/api/upload-avatar", formData);
      props.refreshAvatar(response.data.avatar);
      setSubmitClicked(true);
      if (response.data.success) {
        setChangeAvatarMsg(response.data.message);
        setDeletedAvatar(false);
        picRef.current.value = null;
      }
    } catch (error) {
      console.error(error);
      setChangeAvatarMsg(error.response?.data?.error || "something went wrong");
            alert(error.response?.data?.message);
      
    }
  }

  async function deletePic(e) {
    e.preventDefault();
    setSubmitClicked(false);
    try {
      const response = await api.delete("/api/delete-avatar");
      setProfilePicLink(response.data.user.avatar);
      props.refreshAvatar(response.data.user.avatar);
      if (response.data.success) {
        setDeleteClicked(true);
        setDeletedAvatar(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <form className={styles.profilepicForm} onSubmit={setProfilePic}>
        <label htmlFor="avatar" className={styles.profilepicLabel}>
          choose a pic
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
        onChange={(e) => {
  const file = picRef.current.files[0];

  if (!file) {
    setShowSubmitBtn(false);
    return;
  }
 
  setShowSubmitBtn(true);
  setDeleteClicked(false);
  setSubmitClicked(false);
}}
          ref={picRef}
          className={styles.profilepicInput}
       required />
        {submitClicked && (
          <p className={styles.successMessage}>{changeAvatarMsg}</p>
        )}
        {showSubmitBtn && (
          <button type="submit" className={styles.profilepicButton}>
            submit
          </button>
        )}
        {deleteClicked && <p>Your avatar has been successfullt deleted.</p>}
        {!deletedAvatar && !deleteClicked && (  <button
          type="button"
          className={styles.profilepicDeleteButton}
          onClick={deletePic}
         
        >
          delete avatar
        </button>)}
      
      </form>
    </div>
  );
}

export default SetProfilePic;
