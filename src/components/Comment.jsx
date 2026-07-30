import React, { useState, useContext } from "react";
import { AiFillLike } from "react-icons/ai";
import { TiDelete } from "react-icons/ti";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import EmojiPicker from "emoji-picker-react";
import {
  MdOutlineEmojiEmotions,
  MdEmojiEmotions,
} from "react-icons/md";
import AuthContext from "../context/AuthContext";
import styles from "./Comment.module.css";

function Comment(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const {user} = useContext(AuthContext);

  function handleEdit() {
    setNewComment(props.content);
    setIsEditing(true);
  }

  function handleEmoji(emojiData) {
    setNewComment((prev) => prev + emojiData.emoji);
    setEmojiOpen(!emojiOpen);
  }

  return (
    <div className={styles.wrapper}>
      {!isEditing ? (
        <div className={styles.commentCard}>
          <img
            src={props.avatar}
            alt="avatar"
            className={styles.avatar}
          />
        
          <div className={styles.body}>
            <div className={styles.header}>
              <h3 className={styles.name}>{props.name}</h3>
              <p className={styles.username} id={props.userId}>{props.username}</p>
              {props.edited && (
                <span className={styles.edited}>edited</span>
              )}
            </div>

            <p className={styles.content}>{props.content}</p>

            <div className={styles.footer}>
              <p className={styles.date}>
                {format(new Date(props.date), "HH:mm", {
                  locale: enUS,
                })}
              </p>

              <div className={styles.actions}>
                {props.userId === user.id && (
                  <>
                  <button
                  className={styles.iconButton}
                  onClick={() => props.deletion(props.id)}
                  type="button"
                >
                  <TiDelete />
                </button>

                <button
                  className={styles.textButton}
                  onClick={handleEdit}
                  type="button"
                >
                  edit
                </button></>
                )}
                

                <button
                  className={styles.likeButton}
                  onClick={props.likesHandle}
                  type="button"
                >
                  <AiFillLike /> {props.likes}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          className={styles.editForm}
          onSubmit={(e) => {
            e.preventDefault();
            props.onSave(props.id, newComment);
            setIsEditing(false);
          }}
        >
          <div className={styles.editRow}>
            <input
              className={styles.input}
              type="text"
              value={newComment}
              onFocus={()=>{setEmojiOpen(false)}}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button
              type="button"
              className={styles.emojiButton}
              onClick={() => setEmojiOpen((prev) => !prev)}
            >
              {emojiOpen ? (
                <MdEmojiEmotions />
              ) : (
                <MdOutlineEmojiEmotions />
              )}
            </button>
          </div>

          {emojiOpen && (
            <div className={styles.emojiPicker}>
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}

          <button type="submit" className={styles.saveButton}>
            save
          </button>
        </form>
      )}
    </div>
  );
}

export default Comment;