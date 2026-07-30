import { useContext } from "react";
import { Navigate } from "react-router-dom";
import api from "../axiosConfig.js";
import {ClipLoader} from "react-spinners";
import AuthContext from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
const {user, loading} = useContext(AuthContext); 

  if (loading) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <ClipLoader size={30} color="#333" />
    </div>
  );
}
  if (!user) return <Navigate to="/login" replace/>;




  return children;
}
export default ProtectedRoute;
