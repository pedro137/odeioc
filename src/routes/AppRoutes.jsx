import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebaseConfig";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { PaginaDesejada } from "../pages/paginadesejada";

export function AppRouter() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <PaginaDesejada /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/paginadesejada" element={user ? <PaginaDesejada /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
