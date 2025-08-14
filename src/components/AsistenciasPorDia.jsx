import React, { useEffect, useState } from "react";
import "./AsistenciasPorDia.css"; // importá este CSS
import { ENV } from "../env";

const formatDateToArgentina = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(d);
  } catch (e) {
    console.error("Error formateando fecha:", e);
    return iso;
  }
};

const todayInArg = () => {
  const now = new Date();
  const tz = "America/Argentina/Buenos_Aires";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map = {};
  parts.forEach((p) => (map[p.type] = p.value));
  return `${map.year}-${map.month}-${map.day}`;
};

export default function AsistenciasPorDia() {
  const [fecha, setFecha] = useState(todayInArg());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterText, setFilterText] = useState("");

  const fetchData = async (fechaStr) => {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const resp = await fetch(`${ENV.URL}asistencias-por-dia/${fechaStr}`, {
        headers: { "Content-Type": "application/json" },
        method: "GET",
      });
      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(
          errBody.error || `Error ${resp.status} al consultar asistencias`
        );
      }
      const json = await resp.json();
      setData(json);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al recuperar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(fecha);
  }, [fecha]);

  const filtered = (data?.alumnos || []).filter((a) => {
    if (!filterText) return true;
    const t = filterText.toLowerCase();
    return (
      (a.name || "").toLowerCase().includes(t) ||
      (a.lastName || "").toLowerCase().includes(t) ||
      (a.dni || "").toLowerCase().includes(t) ||
      (a.email || "").toLowerCase().includes(t)
    );
  });

  const subirUnDia = () => {
    const nextDate = new Date(fecha);
    nextDate.setDate(nextDate.getDate() + 1);
    setFecha(nextDate.toISOString().split("T")[0]);
  };

  const bajarUnDia = () => {
    const prevDate = new Date(fecha);
    prevDate.setDate(prevDate.getDate() - 1);
    setFecha(prevDate.toISOString().split("T")[0]);
  };

  return (
    <div className="wrapper">
      <div className="controls">
        <div className="field">
          <label>Fecha de asistencia</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="field flex-grow">
          <label>Buscar / filtrar</label>
          <input
            type="text"
            placeholder="Nombre, apellido, DNI o email..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>
      <div className="navigation">
        <button onClick={bajarUnDia} className="btn-navigation-dias">
          <span className="material-icons"> - Anterior </span>
        </button>
        <button onClick={subirUnDia} className="btn-navigation-dias">
          <span className="material-icons"> + Siguiente</span>
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <p className="subtext">
              Total: {data ? data.cantidad || data.alumnos.length : "--"}{" "}
              alumno(s)
            </p>
            <h2>Asistencias del {fecha}</h2>
          </div>
          {loading && <div className="loader">Cargando...</div>}
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Asistencias ese día</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    No se encontraron alumnos para esa fecha o con ese filtro.
                  </td>
                </tr>
              )}
              {filtered.map((a) => (
                <tr key={a.dni}>
                  <td>{a.dni}</td>
                  <td>{a.name || "-"}</td>
                  <td>{a.lastName || "-"}</td>
                  <td>{a.email || "-"}</td>
                  <td className="badges-cell">
                    {a.asistenciasEseDia && a.asistenciasEseDia.length ? (
                      a.asistenciasEseDia.map((iso, i) => (
                        <span key={i} className="badge">
                          {formatDateToArgentina(iso)}
                        </span>
                      ))
                    ) : (
                      <span className="muted">(sin hora)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.alumnos && data.alumnos.length > 0 && (
          <div className="footer-note">
            Datos obtenidos de la API para {fecha}.
            {data.alumnos.length !== filtered.length && (
              <span>
                {" "}
                Filtrados {filtered.length} de {data.alumnos.length}.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
