import React, { useState, useEffect } from "react";
import Form from "../components/Form";
import Thought from "../components/Thought";
import Header from "../components/Header";
import api from "../axiosConfig.js";
import { FaThumbsUp } from "react-icons/fa";
import styles from "./ListOfThoughts.module.css";
import { getSocket } from "../socket/socketManager.js";

function ListOfThoughts() {
  const [thoughts, setThoughts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchData = await api.get("/api/fetch-thoughts");
        const currentUser = await api.get("/api/me");

        setThoughts(fetchData.data);
        setUser(currentUser.data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    function handleNewThought(newThought) {
      setThoughts((prev) => [newThought, ...prev]);
    }

    function handleDeleteThought(deletedThought) {
      setThoughts((prev) =>
        prev.filter((item) => item.thought_id !== deletedThought.id),
      );
    }

    function handleEditThought(editedThought) {
      setThoughts((prev) =>
        prev.map((item) =>
          item.thought_id === editedThought.id
            ? {
                ...item,
                text: editedThought.post,
                edited_thought: editedThought.is_edited,
              }
            : item,
        ),
      );
    }

    function handleLikedThought(updatedThoughts) {
      setThoughts(updatedThoughts);
    }

    socket.on("new-thought", handleNewThought);
    socket.on("delete-thought", handleDeleteThought);
    socket.on("edit-thought", handleEditThought);
    socket.on("like-thought", handleLikedThought);
    return () => {
      socket.off("new-thought", handleNewThought);
      socket.off("delete-thought", handleDeleteThought);
      socket.off("edit-thought", handleEditThought);
      socket.off("like-thought", handleLikedThought);
    };
  }, []);

  if (!thoughts || !user) return <div>please wait...</div>;

  async function addThoughts(newthought) {
    try {
      await api.post("/api/thoughts/add-post", {
        post: newthought.post,
        username: user.username,
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message);
    }
  }

  async function deleteThought(id) {
    try {
      await api.delete(`/api/thoughts/${id}/clear`);
    } catch (error) {
      console.error(error);
    }
  }

  async function editThought(id, editPost) {
    try {
      const response = await api.put(`/api/thoughts/${id}/edit`, {
        post: editPost,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLike(id) {
    try {
      const response = await api.post(`/api/thought/${id}/like`
       );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Header />

      <div className={styles.container}>
        <div className={styles.feed}>
          {thoughts.map((item) => (
            <Thought
              key={item.thought_id}
              id={item.thought_id}
              post={item.text}
              date={item.date}
              avatar={item.avatar || "/noavatar.png"}
              name={item.name || "no name"}
              lastname={item.lastname || ""}
              username={item.username}
              likeButton={
                <FaThumbsUp size={20} color="#007AFF" fill="#007AFF" />
              }
              likedCount={item.likes}
              onLike={handleLike}
              deleteClicked={() => deleteThought(item.thought_id)}
              editClicked={editThought}
              isEdited={item.edited_thought && "edited"}
            />
          ))}
        </div>

        <Form onAdd={addThoughts} />
      </div>
    </>
  );
}

export default ListOfThoughts;
