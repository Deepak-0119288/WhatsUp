// App.jsx
import React, { useEffect } from "react";
import { Outlet, Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./data/useAuth";
import { Toaster } from "react-hot-toast";

function Layout() {
  return (
    <div>
      <Outlet />
      <Toaster />
    </div>
  );
}

export default function App() {
  const { authUser, checkAuth, ischeckingAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (ischeckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
}