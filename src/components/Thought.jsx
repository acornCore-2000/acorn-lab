import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./Thought.module.css";
import api from "../axiosConfig.js";
import { format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { MdEmojiEmotions, MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";

function Thought(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPost, setEditPost] = useState(props.post);
  const [user, setUser] = useState(null);
  const [emojiClicked, setEmojiClicked] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/api/user/db-info");
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  function startEdit() {
    setIsEditing(true);
    setEditPost(props.post);
  }

  function saveEdit() {
    props.editClicked(props.id, editPost);
    setIsEditing(false);
    setEmojiClicked(false);
  }

  function handleEmojiClick(emojiData) {
    setEditPost((prev) => prev + emojiData.emoji);
    setEmojiClicked(!emojiClicked);
  }

  return (
    <section className={styles.thoughtContainer}>
      {isEditing ? (
        <>
          <textarea
            value={editPost}
            onChange={(e) => setEditPost(e.target.value)}
            onFocus={() => {
              setEmojiClicked(false);
            }}
          />
          <div>
            {emojiClicked && <EmojiPicker onEmojiClick={handleEmojiClick} />}
            <button
              type="button"
              onClick={
                emojiClicked
                  ? () => setEmojiClicked(false)
                  : () => setEmojiClicked(true)
              }
            >
              {emojiClicked ? <MdEmojiEmotions /> : <MdOutlineEmojiEmotions />}
            </button>
          </div>
          <button type="submit" onClick={saveEdit}>
            Save
          </button>
        </>
      ) : (
        <>
          <div className={styles.thoughtHeader}>
            <div className={styles.avatarContainer}>
              <img src={props.avatar} alt="avatar" className={styles.avatar} />
            </div>
            <p>{props.name + " " + props.lastname}</p>
            <p>{"@" + props.username}</p>
          </div>

          <div className={styles.thoughtMain}>
            <p>{props.post}</p>
          </div>

          <p className={styles.thoughtDate}>
            {format(new Date(props.date), "HH:mm MMM dd ", { locale: enUS })}
            {props.isEdited && (
              <span className={styles.isEdited}>{props.isEdited}</span>
            )}
          </p>

          <div className={styles.buttons}>
            <div className={styles.mobileLeftActions}>
              {user.username === props.username && (
                <>
                  <button onClick={() => props.deleteClicked(props.id)}>
                    delete
                  </button>
                  <button onClick={startEdit}>edit</button>
                </>
              )}
            </div>

            <div className={styles.rightActions}>
              <Link to={`/comments/${props.id}`}>comments</Link>
              <button onClick={() => props.onLike(props.id)}>
                {props.likeButton} {props.likedCount}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Thought;
