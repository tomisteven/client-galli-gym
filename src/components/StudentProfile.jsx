// frontend/src/components/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import PaymentHistory from "./PaymentHistory";
import AttendanceStats from "./AttendanceStats";
import { useNavigate } from "react-router-dom";

const StudentProfile = ({ student, onClose, setCurrentStudent }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setInterval(() => {
      console.log(`Time left: ${timeLeft}s`);

      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000000);

    return () => clearInterval(timer);
  }, [onClose, timeLeft]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("es-ES", options);
  };

  const calculateStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due >= today ? "Al día" : "Vencido";
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="student-profile">
      {calculateStatus(student.paymentDueDate) === "Al día" ? (
        <div className="status-alumno-habilitado">
          <p>HABILITADO</p>
        </div>
      ) : (
        <div className="status-alumno-inhabilitado">
          <p>INHABILITADO</p>
        </div>
      )}
      <div className="profile-header">
        <div className="student-info">
          <div className="avatar">
            {student.image ? (
              <img
                src={student.image}
                alt={`${student.name} ${student.lastName}`}
                onClick={() => navigate(`/alumnos/editar/${student._id}`)}
              />
            ) : (
              <div className="placeholder-avatar">
                <span>{student.name ? student.name[0] : "A"}</span>
              </div>
            )}
          </div>

          <div className="student-meta">
            <h2>
              {student.name} {student.lastName}{" "}
              <button
                className="btn-edit"
                onClick={() => navigate(`/alumnos/editar/${student.dni}`)}
              >
                Editar
              </button>
            </h2>
            <div className="status-container">
              <div
                className={`status-badge ${
                  calculateStatus(student.paymentDueDate) === "Al día"
                    ? "success"
                    : "danger"
                }`}
              >
                {calculateStatus(student.paymentDueDate)}
              </div>
              <div className="plan-badge">{student.planType}</div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-close" onClick={() => setCurrentStudent(null)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="total-asistencias">
        <h3 className="total-asistencias-title">
          <AttendanceStats asistencias={student.asistencias} />
        </h3>
      </div>

      <div className="profile-details-grid">
        <div className="detail-card critical">
          <h3>Información Financiera</h3>
          <div className="detail-item">
            <span className="detail-label">Próximo Vencimiento:</span>
            <span className="detail-value">
              {formatDate(student.paymentDueDate)}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Estado de Cuenta:</span>
            <span className="detail-value">
              {calculateStatus(student.paymentDueDate)}
            </span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Datos Personales</h3>
          <div className="detail-item">
            <span className="detail-label">DNI:</span>
            <span className="detail-value">{student.dni}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Teléfono:</span>
            <span className="detail-value">{student.phone}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{student.email}</span>
          </div>
        </div>
      </div>

      <div className="attendance-section">
        <h3>Historial de Asistencias</h3>
        {student.asistencias && student.asistencias.length > 0 ? (
          <ul className="attendance-list">
            {student.asistencias.map((date, index) => (
              <li key={index}>· {formatDateTime(date)}</li>
            ))}
          </ul>
        ) : (
          <p>No hay asistencias registradas</p>
        )}
      </div>

      <div
        className="detail-card full-width"
        style={{ backgroundColor: "#fff7e8", borderLeft: "4px solid orange" }}
      >
        <h3>Historial Académico</h3>
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Fecha de Ingreso:</span>
            <span className="detail-value">{formatDate(student.joinDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Plan Actual:</span>
            <span className="detail-value plan-badge">{student.planType}</span>
          </div>
        </div>
      </div>

      <div className="detail-card full-width">
        <h3>Historial de Pagos</h3>
        <PaymentHistory payments={student.paymentHistory} />
      </div>
    </div>
  );
};

export default StudentProfile;
