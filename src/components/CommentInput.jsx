import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  MdOutlineEmojiEmotions,
  MdEmojiEmotions,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import styles from "./CommentInput.module.css";



function CommentInput(props) {
  const [comment, setComment] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  function handleEmoji(emojiData) {
    setComment((prev) => prev + emojiData.emoji);
    setIsEmojiOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!comment.trim()) return;
setIsEmojiOpen(false);
    await props.onAdd(comment);
    setComment("");
    setIsEmojiOpen(false);
    setIsOpen(false);
  }

  return (
    <div className={styles.wrapper}>
      {!isOpen ? (
        <>
        
        <button
          type="button"
          className={styles.openButton}
          onClick={() => setIsOpen(true)}
        >
          add a new comment
        </button>
        <button onClick={()=>{navigate(-1 || "/thoughts")}}>
          close comments
        </button>
</>
      ) : (
        <div className={styles.container}>
          <form className={styles.form} onSubmit={handleSubmit}>

            <div className={styles.inputCard}>
              <input
                className={styles.input}
                type="text"
                placeholder="Write your comment..."
                value={comment}
                onFocus={()=>{setIsEmojiOpen(false)}}
                onChange={(e) => setComment(e.target.value)}
              />

              <button
                type="button"
                className={styles.emojiButton}
                onClick={() => setIsEmojiOpen((p) => !p)}
              >
                {isEmojiOpen ? (
                  <MdEmojiEmotions size={22} />
                ) : (
                  <MdOutlineEmojiEmotions size={22} />
                )}
              </button>
            </div>

            {isEmojiOpen && (
              <div className={styles.emojiPicker}>
                <EmojiPicker onEmojiClick={handleEmoji} width={600}
  height={350}/>
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setIsOpen(false);
                  setComment("");
                  setIsEmojiOpen(false);
                }}
              >
                close
              </button>

              <button type="submit" className={styles.primaryButton}>
                send 
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}

export default CommentInput;