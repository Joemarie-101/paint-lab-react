import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";
import { BrandProvider } from "./context/BrandContext";
import { ColorHistoryProvider } from "./context/ColorHistoryContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

function AppContent() {
  const [activeTab, setActiveTab] = useState("brand");
  const { currentUser } = useAuth();

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

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrandProvider>
          <ColorHistoryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/*" element={<AppContent />} />
              </Routes>
            </BrowserRouter>
          </ColorHistoryProvider>
        </BrandProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
