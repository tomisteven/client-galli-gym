import React from "react";
import "./ResumenAlumnos.css";

const ResumenAlumnos = ({ alumnos, setFilterStatus }) => {
  const vencidos = alumnos.filter(
    (a) => new Date(a.paymentDueDate) < new Date()
  ).length;

  const alDia = alumnos.filter(
    (a) => new Date(a.paymentDueDate) >= new Date()
  ).length;

  return (
    <div className="resumen-container">
      <div className="card-r card-total" onClick={() => setFilterStatus("todos")}>
        <h3>{alumnos.length}</h3>
        <p>Inscriptos</p>
      </div>
      <div
        className="card-r card-vencidos"
        onClick={() => setFilterStatus("vencidos")}
      >
        <h3>{vencidos}</h3>
        <p>Vencidos</p>
      </div>
      <div
        className="card-r card-al-dia"
        onClick={() => setFilterStatus("aldia")}
      >
        <h3>{alDia}</h3>
        <p>Al Día</p>
      </div>
    </div>
  );
};

export default ResumenAlumnos;
