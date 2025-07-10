// frontend/src/components/AlumnosList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { ENV } from "../env";
import Loading from "./Loading";

const AlumnosList = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Estados para el modal de pago
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const fetchAlumnos = async () => {
    setLoading(true);
    try {
      const response = await fetch(ENV.URL);
      const data = await response.json();
      if (response.ok) {
        setAlumnos(data.reverse());
      } else {
        setError(data.error || "Error al cargar alumnos");
      }
    } catch (err) {
      console.error("Error fetching alumnos:", err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (alumno) => {
    setCurrentStudent(alumno);
    setPaymentAmount("");
    setPaymentError(null);
    setShowModal(true);
  };

  const closePaymentModal = () => {
    setShowModal(false);
    setCurrentStudent(null);
  };

  const handlePaymentSubmit = async () => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      setPaymentError("Por favor ingrese un monto válido");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const response = await fetch(
        `${ENV.URL}agregar-pago/${currentStudent.dni}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: parseFloat(paymentAmount) }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el pago");
      }

      // Actualizar lista de alumnos localmente sin recargar todo
      const updatedAlumnos = alumnos.map((alumno) => {
        if (alumno.dni === currentStudent.dni) {
          return {
            ...alumno,
            paymentDueDate: data.student.paymentDueDate,
            paymentHistory: data.student.paymentHistory,
          };
        }
        return alumno;
      });

      setAlumnos(updatedAlumnos);
      closePaymentModal();
    } catch (err) {
      console.error("Error al agregar pago:", err);
      setPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
  // Si la fecha viene en formato MongoDB { $date: ... }
  let isoDate = dateString;
  if (dateString && typeof dateString === 'object' && dateString.$date) {
    isoDate = dateString.$date;
  }

  // Crear fecha sin ajuste de zona horaria
  const date = new Date(isoDate);

  // Ajustar para compensar la zona horaria
  const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'  // Forzar zona horaria UTC
  };

  return adjustedDate.toLocaleDateString('es-ES', options);
};
  const calculateStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due >= today ? "Al día" : "Vencido";
  };

  if (loading) return <Loading />;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="alumnos-list">
      {/* Modal para agregar pago */}
      {showModal && currentStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Registrar Pago</h3>
              <button className="close-btn" onClick={closePaymentModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p>
                <strong>Alumno:</strong> {currentStudent.name}{" "}
                {currentStudent.lastName}
              </p>
              <p>
                <strong>DNI:</strong> {currentStudent.dni}
              </p>
              <p>
                <strong>Vencimiento actual:</strong>{" "}
                {formatDate(currentStudent.paymentDueDate)}
              </p>
              <p>
                <strong>Proximo Vencimiento</strong>{" "}
                {formatDate(
                  currentStudent.paymentDueDate
                    ? new Date(currentStudent.paymentDueDate).setMonth(
                        new Date(currentStudent.paymentDueDate).getMonth() + 1
                      )
                    : ""
                )}
              </p>
              <p>
                <strong>Plan:</strong> {currentStudent.planType}
              </p>

              <div className="form-group">
                <label htmlFor="paymentAmount">Monto del pago:</label>
                <input
                  type="number"
                  id="paymentAmount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Ingrese el monto"
                />
              </div>

              {paymentError && (
                <div className="error-message">{paymentError}</div>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={closePaymentModal}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "Confirmar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="list-header">
        <h2>Listado de Alumnos</h2>

        <div className="list-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to="/alumnos/nuevo" className="btn-new">
            Nuevo Alumno
          </Link>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>DNI</th>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Plan</th>
              <th>Ingreso</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {alumnos
              .filter(
                (alumno) =>
                  alumno.dni.includes(searchTerm) ||
                  alumno.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  alumno.lastName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              )
              .map((alumno) => (
                <tr key={alumno.dni}>
                  <td>{alumno.dni}</td>
                  <td>
                    {alumno.name} {alumno.lastName}
                  </td>
                  <td>{alumno.phone}</td>
                  <td>{alumno.planType}</td>
                  <td>{formatDate(alumno.joinDate)}</td>
                  <td>{formatDate(alumno.paymentDueDate)}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        calculateStatus(alumno.paymentDueDate) === "Al día"
                          ? "success"
                          : "danger"
                      }`}
                    >
                      {calculateStatus(alumno.paymentDueDate)}
                    </span>
                  </td>
                  <td className="td-acciones">
                    <Link
                      to={`/alumnos/editar/${alumno.dni}`}
                      className="btn-edit"
                    >
                      Editar
                    </Link>
                    <button
                      className="btn-edit-renovar"
                      onClick={() => openPaymentModal(alumno)}
                    >
                      Agregar Pago
                    </button>
                    <Link
                      to={`/alumnos/editar/${alumno.dni}`}
                      className="btn-edit-baja"
                    >
                      Dar de Baja
                    </Link>

                    <FaWhatsapp
                      size={30}
                      color="green"
                      className="btn-whatsapp"
                      onClick={() =>
                        window.open(
                          `https://wa.me/549${alumno.phone}?text=Hola, ${
                            alumno.name
                          }! ¿Cómo estás? te escribo desde Galli Gym para informarte sobre tu estado de cuenta y próximos vencimientos. ${formatDate(
                            alumno.paymentDueDate
                          )}, Este es un mensaje automático, por favor no respondas.`
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlumnosList;
