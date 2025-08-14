import React from "react";
import "./ModalAsistencias.css";

export default function ModalAsistencias({ student, onClose }) {
  if (!student) return null;

  // Ordenar asistencias de más reciente a más antigua
  const asistenciasOrdenadas = [...(student.asistencias || [])].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2 className="modal-title">Asistencias del Alumno</h2>

        <div className="modal-info">
          <p>
            <strong>Nombre:</strong> {student.name} {student.lastName}
          </p>
          <p>
            <strong>DNI:</strong> {student.dni}
          </p>
        </div>

        {asistenciasOrdenadas.length > 0 ? (
          <p className="modal-subtitle">
            Total de asistencias: {asistenciasOrdenadas.length}
          </p>
        ) : (
          <p className="modal-subtitle">No hay asistencias registradas.</p>
        )}

        <div className="modal-list">
          {asistenciasOrdenadas.length > 0 ? (
            asistenciasOrdenadas.map((fecha, i) => (
              <div key={i} className="asistencia-item">
                {new Date(fecha).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            ))
          ) : (
            <p className="no-asistencias">No hay asistencias registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
