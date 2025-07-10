// frontend/src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { ToastContainer } from 'react-toastify';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import DniInput from "./components/DniInput";
import StudentProfile from "./components/StudentProfile";
import AlumnosList from "./components/AlumnosList";
import AlumnoForm from "./components/AlumnoForm";
import "./index.css";

// Componente principal con rutas
function AppRoutes() {
  const [currentStudent, setCurrentStudent] = useState(null);
  const timeoutRef = useRef(null);
  const location = useLocation();

  // Solo activar el temporizador en la página principal
  const isHomePage = location.pathname === "/";

  // Función para iniciar el temporizador de 30 segundos
  const startTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCurrentStudent(null);
    }, 300000);
  };

  useEffect(() => {
    if (currentStudent && isHomePage) {
      startTimer();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStudent, isHomePage]);

  const handleStudentFound = (student) => {
    setCurrentStudent(student);
  };

  const handleCloseProfile = () => {
    setCurrentStudent(null);
  };

  return (
    <div className="app">

      <Link to={"/"} className="voler-inicio">
        Inicio
      </Link>
      <header>
        <Routes>
          <Route
            path="/"
            element={
              <DniInput
                onStudentFound={handleStudentFound}
                onSearchStart={startTimer}
              />
            }
          />
        </Routes>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div className="student-view-container">
                <div className="profile-section">
                  {currentStudent && (
                    <StudentProfile
                      student={currentStudent}
                      onClose={handleCloseProfile}
                      setCurrentStudent={setCurrentStudent}
                    />
                  )}
                </div>
              </div>
            }
          />

          <Route path="/alumnos" element={<AlumnosList />} />
          <Route path="/alumnos/nuevo" element={<AlumnoForm />} />
          <Route path="/alumnos/editar/:dni" element={<AlumnoForm />} />
        </Routes>
         <ToastContainer />
      </main>
    </div>
  );
}

// Componente wrapper para BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
