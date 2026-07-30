import React, { useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions, MdOutlineEmojiEmotions } from "react-icons/md";
import styles from "./Form.module.css";
import { GrAdd } from "react-icons/gr";


function Form({ onAdd }) {
  const [isPosting, setIsPosting] = useState(false);
  const [isEmojiClicked, setIsEmojiClicked] = useState(false);
  const [post, setPost] = useState("");

  function submitHandle(e) {
    e.preventDefault();

    const newThought = {
      post: post,
    };

    onAdd(newThought);

     setPost("");
     setIsEmojiClicked(false)
     setIsPosting(false);
  }

  function emojiClicked() {
    if (isEmojiClicked === true) {
      setIsEmojiClicked(false);
    } else {
      setIsEmojiClicked(true);
    }
  }

  const handleEmojiClick = (emojiData) => {
    setPost(prev=> prev + emojiData.emoji)
    setIsEmojiClicked(false);
  };
return (
  <>
    {!isPosting ? (
      <div className={styles.composerStickyButton}>
        <button
          onClick={() => setIsPosting(true)}
          className={styles.composerOpenButton}
        >
          <GrAdd color="white" size={30}/>
        </button>
      </div>
    ) : (
      <div className={styles.composerWrapper}>
        <div className={styles.composerCard}>
          <form onSubmit={submitHandle} className={styles.composerForm}>

            <textarea
              name="body"
              rows="5"
              cols="30"
              placeholder="I think that..."
              value={post}
              onChange={(e) => setPost(e.target.value)}
              className={styles.composerTextarea}
              onFocus={()=>{setIsEmojiClicked(false)}}
              required
            />

            <div className={styles.composerActions}>

              <div className={styles.composerEmoji}>

                <button
                  onClick={emojiClicked}
                  type="button"
                  className={styles.composerEmojiButton}
                >
                  {isEmojiClicked ? (
                    <MdEmojiEmotions size={20} />
                  ) : (
                    <MdOutlineEmojiEmotions size={20} />
                  )}
                </button>

                {isEmojiClicked && (
                  <div className={styles.composerEmojiPicker}>
                    <EmojiPicker
                     
                      onEmojiClick={handleEmojiClick}
                    />
                  </div>
                )}

              </div>

              <button
                onClick={() => {
                  setIsPosting(false);
                  setIsEmojiClicked(false);
                }}
                type="button"
                className={styles.composerCancelButton}
              >
                close
              </button>

              <button
                type="submit"
                className={styles.composerSubmitButton}
              >
                post
              </button>

            </div>

          </form>
        </div>
      </div>
    )}
  </>
);
}

export default Form;
