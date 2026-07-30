import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Comment from "../components/Comment";
import CommentInput from "../components/CommentInput.jsx";
import api from "../axiosConfig.js";
import styles from "./Comments.module.css";
import Header from "../components/Header.jsx";
import { getSocket } from "../socket/socketManager.js";

function Comments() {
  const [comments, setComments] = useState([]);
  const { postId } = useParams();

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await api.get(`/api/${postId}/fetch-comments`);
        setComments(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchComments();
  }, [postId]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    socket.emit("join-post", postId);

    function handleNewComment(newComments) {
      setComments(newComments);
    }
    function handleDeleteComment(deletedComment) {
      setComments((prev) =>
        prev.filter((item) => item.comment_id !== deletedComment.id),
      );
    }
    function handleEditComment(editedComment) {
      setComments(editedComment);
    }
    function handleLikeComment(updatedComments) {
      setComments(updatedComments);
    }

    socket.on("new-comment", handleNewComment);
    socket.on("delete-comment", handleDeleteComment);
    socket.on("edit-comment", handleEditComment);
    socket.on("like-comment", handleLikeComment);

    return () => {
      socket.off("new-comment", handleNewComment);
      socket.off("delete-comment", handleDeleteComment);
      socket.off("edit-comment", handleEditComment);
      socket.off("like-comment", handleLikeComment);

      socket.emit("leave-post", postId);
    };
  }, [postId]);

  async function handleAddComment(comment) {
    try {
      await api.post(`/api/post/${postId}/add-comment`, {
        comment: comment,
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message);
    }
  }

  async function handleDeletion(id) {
    try {
      await api.delete(`/api/${postId}/comments/${id}/delete`);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleEditComment(id, newComment) {
    try {
      const response = await api.put(
        `/api/thought/${postId}/comment/${id}/edit`,
        {
          newComment: newComment,
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLikes(id) {
    try {
      const response = await api.post(
        `/api/thought/${postId}/comment/${id}/likes`,
      );
    } catch (error) {
      console.error(error);
    }
  }

  if (comments === null) {
    return <div>fetching...</div>;
  }

  return (
    <>
      <Header />

      <div className={styles.commentsPage}>
        <div className={styles.commentsList}>
          {comments.map((item) => (
            <div className={styles.commentItem} key={item.comment_id}>
              <Comment
                id={item.comment_id}
                userId={item.user_id}
                avatar={item.avatar || "/noavatar.png"}
                name={item.name}
                username={"@" + item.username}
                content={item.comment}
                date={item.created_at}
                edited={item.edited && "edited"}
                deletion={() => handleDeletion(item.comment_id)}
                onSave={handleEditComment}
                likes={item.likes}
                likesHandle={() => handleLikes(item.comment_id)}
              />
            </div>
          ))}
        </div>

        <div className={styles.commentInputWrapper}>
          <CommentInput onAdd={handleAddComment} />
        </div>
      </div>
    </>
  );
}

export default Comments;
