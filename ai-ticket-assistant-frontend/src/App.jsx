import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import AuthCheck from "./components/AuthCheck.jsx";
import Tickets from "./pages/Tickets.jsx";
import TicketDetailsPage from "./pages/Ticket.jsx";
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Admin from "./pages/Admin.jsx"

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <AuthCheck isProtected={true}>
              <Tickets />
            </AuthCheck>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <AuthCheck isProtected={true}>
              <TicketDetailsPage />
            </AuthCheck>
          }
        />
        <Route
          path="/login"
          element={
            <AuthCheck isProtected={false}>
              <Login/>
            </AuthCheck>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthCheck isProtected={false}>
              <Signup/>
            </AuthCheck>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthCheck isProtected={true}>
              <Admin/>
            </AuthCheck>
          }
        />
      </Routes>
    </>
  );
}

export default App;
