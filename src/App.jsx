import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ListOfThoughts from "./pages/ListOfThoughts";
import SetProfile from "./pages/SetProfile";
import Settings from "./pages/Settings";
import MyThoughts from "./pages/MyThoughts";
import ProtectedRoute from "./components/ProtectedRoute";
import Comments from "./pages/Comments.jsx"; 
import ThemeLoader from "./components/ThemeLoader.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
    <ThemeLoader />
      <Routes>
        
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/sign-up" element={<SignUp />}></Route>
        <Route path="/thoughts" element={<ProtectedRoute><ListOfThoughts/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><SetProfile/></ProtectedRoute>}/>
        <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
        <Route path="/my-thoughts" element={<ProtectedRoute><MyThoughts/></ProtectedRoute>}/>
        <Route path="/comments/:postId/" element= {<ProtectedRoute> <Comments /> </ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
