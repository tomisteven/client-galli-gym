// frontend/src/components/AlumnoForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ENV } from "../env";
import { toast } from "react-toastify";
import Loading from "./Loading";

const AlumnoForm = () => {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState({
    dni: "",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    planType: "Full",
    paymentDueDate: "",
    status: "Al día",
    joinDate: new Date().toISOString().split("T")[0],
    medicamento: "Ninguno",
    patologias: "Ninguna",
    activo: true,
  });

  const [loading, setLoading] = useState(!!dni);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dni) {
      const fetchAlumno = async () => {
        try {
          const response = await fetch(`${ENV.URL}alumno/${dni}`);
          const data = await response.json();
          if (response.ok) {
            const adjustedData = {
              ...data,
              birthDate: data.birthDate.split("T")[0],
              paymentDueDate: data.paymentDueDate.split("T")[0],
              joinDate: data.joinDate
                ? data.joinDate.split("T")[0]
                : new Date().toISOString().split("T")[0],
              medicamento: data.medicamento || "Ninguno",
              patologias: data.patologias || "Ninguna",
              activo: data.activo !== undefined ? data.activo : true,
            };
            setAlumno(adjustedData);
          } else {
            toast.error(data.error || "Alumno no encontrado");
            setError(data.error || "Alumno no encontrado");
          }
        } catch (err) {
          toast.error(err);
          setError("Error de conexión");
        } finally {
          setLoading(false);
        }
      };
      fetchAlumno();
    }
  }, [dni]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAlumno((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = dni ? "PUT" : "POST";
      const url = dni ? `${ENV.URL}actualizar/${dni}` : `${ENV.URL}nuevo`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alumno),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(
          dni
            ? "Alumno actualizado correctamente"
            : "Alumno creado correctamente"
        );
        navigate("/alumnos");
      } else {
        toast.error(data.error || "Error al guardar los datos");
        setError(data.error || "Error al guardar los datos");
      }
    } catch (err) {
      toast.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="alumno-form">
      <h2>{dni ? "Editar Alumno" : "Nuevo Alumno"}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>DNI *</label>
            <input
              type="text"
              name="dni"
              value={alumno.dni}
              onChange={handleChange}


              pattern="[0-9]{8}"
              title="El DNI debe tener 8 dígitos"
            />
          </div>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="name"
              value={alumno.name}
              onChange={handleChange}

            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="lastName"
              value={alumno.lastName}
              onChange={handleChange}

            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={alumno.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={alumno.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Edad</label>
            <input
              type="text"
              name="birthDate"
              value={alumno.birthDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Nuevos campos médicos */}
        <div className="form-row">
          <div className="form-group">
            <label>Medicamentos</label>
            <input
              type="text"
              name="medicamento"
              value={alumno.medicamento}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Patologías</label>
            <input
              type="text"
              name="patologias"
              value={alumno.patologias}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Plan *</label>
            <select
              name="planType"
              value={alumno.planType}
              onChange={handleChange}
              required
            >
              <option value="Full">Full</option>
              <option value="Semanal">Semanal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado de Cuenta *</label>
            <select
              name="status"
              value={alumno.status}
              onChange={handleChange}
              required
            >
              <option value="Al día">Al día</option>
              <option value="Vencido">Vencido</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Próximo Vencimiento *</label>
            <input
              type="date"
              name="paymentDueDate"
              value={alumno.paymentDueDate}
              onChange={handleChange}

            />
          </div>

          <div className="form-group">
            <label>Fecha de Ingreso</label>
            <input
              type="date"
              name="joinDate"
              value={alumno.joinDate}
              onChange={handleChange}

            />
          </div>
        </div>

        {/* Campo de estado activo */}
        <div className="form-row">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="activo"
                checked={alumno.activo}
                onChange={handleChange}
              />
              Activo
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/alumnos")}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : dni ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlumnoForm;
