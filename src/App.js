// App.js - Updated
import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { BrandProvider } from "./context/BrandContext";
import { ColorHistoryProvider } from "./context/ColorHistoryContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

// Main App Layout (with sidebar)
function AppLayout() {
  const [activeTab, setActiveTab] = useState("brand");
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        Checking your session...
      </div>
    );
  }

  // If user is not logged in, show login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <MainContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

// Main App with all providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminProvider>
          <BrandProvider>
            <ColorHistoryProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/*" element={<AppLayout />} />
                </Routes>
              </BrowserRouter>
            </ColorHistoryProvider>
          </BrandProvider>
        </AdminProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;