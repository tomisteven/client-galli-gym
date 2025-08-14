import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ENV } from "../env";
import Loading from "./Loading";
import { toast } from "react-toastify";

const DniInput = ({ onStudentFound }) => {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Enfocar el input automáticamente y mantenerlo enfocado
  useEffect(() => {
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    focusInput();

    // Enfocar el input cada 2 segundos para asegurar que siempre esté activo
    const focusInterval = setInterval(focusInput, 2000);

    return () => clearInterval(focusInterval);
  }, []);

  // Escuchar cambios en el DNI
  useEffect(() => {
    //onStudentFound(null); // Limpiar el estado al iniciar
    // Si el DNI tiene 8 dígitos, realizar búsqueda automáticamente
    if (dni.length === 8) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dni]);

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${ENV.URL}ingresa/${dni}`);
      const data = await response.json();
      onStudentFound(null);
      if (response.ok) {
        onStudentFound(data);
        // Limpiar el input después de encontrar un alumno
        setDni("");
        setLoading(false);
      } else {
        // Si no se encuentra el alumno, mostrar un mensaje de error
        toast.warn(data.error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        onStudentFound(data.student);
        // Limpiar el input si hay error
        setDni("");
        setLoading(false);
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
      console.error("Error fetching student:", err);
      setDni("");
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dni-input-container">
      <Link to={"/alumnos"} className="panel-administracion">
        Administracion
      </Link>
      <Link to={"/asistencias"} className="panel-administracion-2">
        Asistencias
      </Link>
      <div class="group">
        <svg viewBox="0 0 24 24" aria-hidden="true" class="search-icon">
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
          </g>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
          placeholder="Ingrese su DNI"
          maxLength={8}
          autoComplete="off"
          autoFocus
          class="dni-input"
        />
      </div>
    </div>
  );
};

export default DniInput;
