import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthCheck = ({ children, isProtected }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (isProtected) {
      if (!token) {
        navigate("/login", {replace: true});
        /* Without replace:
	•	user can press Back
	•	goes back to prev page such as protected page(bad UX)

With replace:
	•	prev page removed from history
	•	cleaner auth flow */

        setLoading(false) //this statement is essential in edge cases, if we dont use it here right now its fine as react unmounts the component anyways but not safe for edge cases
      } else {
        setLoading(false)
      }
    } else {
      if (token) {
        navigate("/", {replace: true})
      }else{
        setLoading(false)
      }
    }
  }, [navigate, isProtected]);

  if (loading) {
    return <div>Loading...</div>
  }

  return children
};

export default AuthCheck;
