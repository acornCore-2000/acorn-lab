import React, { useEffect, useState } from "react";
import api from "../axiosConfig";
import Thought from "../components/Thought";
import Header from "../components/Header";
import Form from "../components/Form";
import { FaThumbsUp } from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "./MyThoughts.module.css";


function MyThoughts() {
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

  if (!thoughts || !user) return <div>please wait...</div>;

  async function addThoughts(newthought) {
    try {
      const addPost = await api.post("/api/thoughts/add-post", {
        post: newthought.post,
        username: user.username,
      });
      setThoughts([...thoughts, addPost.data]);
      
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteThought(id) {
    try {
      await api.delete(`/api/thoughts/${id}/clear`);
      setThoughts(thoughts.filter((item) => item.thought_id !== id));
    } catch (error) {
      console.error(error);
    }
  }

  async function editThought(id, editPost) {
    try {
      const response = await api.put(`/api/thoughts/${id}/edit`, {
        post: editPost,
      });
      const editedThought = response.data;
      setThoughts(
        thoughts.map((item) => {
          if (item.thought_id === id) {
            return {
              ...item,
              post: editedThought.text,
            };
          }
          return item;
        }),
      );
      const result = await api.get("/api/fetch-thoughts");
      setThoughts(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleLike(id) {
    try {
      const response = await api.post(`/api/thought/${id}/like`, {
        userId: user.id,
      });
      setThoughts(response.data);
      
    } catch (error) {
      console.error(error);
    }
  }



  return (
    <>
      <Header />{" "}
      <Link to="/thoughts" className={styles.backBtn}>back to the main page</Link>
      {thoughts && (
        <div className={styles.container}>
          <div className={styles.feed}>
          {thoughts
            .filter((item) => item.username)
            .map((item) => {
              if (item.username === user.username) {
                return (
                  <Thought
                    key={item.thought_id}
                    id={item.thought_id}
                    avatar={item.avatar || "/noavatar.png"}
                    name={!item.name ? "no name" : item.name}
                    lastname={!item.lastname ? "" : item.lastname}
                    username={item.username}
                    post={item.text}
                    date={item.date}
                    likeButton={<FaThumbsUp size={20} color="#007AFF"fill="#007AFF"/>}
                    likedCount={item.likes}
                    onLike={handleLike}
                    deleteClicked={() => {
                      deleteThought(item.thought_id);
                    }}
                    editClicked={editThought}
                    isEdited ={ item.edited_thought && "edited"}
                  ></Thought>
                );
              }
            })}</div>
        </div>
      )}
      <Form onAdd={addThoughts}></Form>
    </>
  );
}

export default MyThoughts;
