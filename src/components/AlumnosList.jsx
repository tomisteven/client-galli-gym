// frontend/src/components/AlumnosList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp, FaMoneyBillWave, FaHistory, FaEdit } from "react-icons/fa";
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

  //const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false); // Nuevo estado para modal de agregar pago
  const [addPaymentAmount, setAddPaymentAmount] = useState(""); // Monto para agregar pago

  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);

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
      console.log("Payment response:", data);

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

  // Función para abrir el modal de historial de pagos
  const openPaymentHistoryModal = async (alumno) => {
    setCurrentStudent(alumno);
    setPaymentError(null);

    try {
      // Obtener el alumno completo con historial actualizado
      const response = await fetch(`${ENV.URL}alumno/${alumno.dni}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentHistory(data.paymentHistory || []);
        setShowPaymentHistoryModal(true);
      } else {
        throw new Error(data.error || "Error al obtener historial de pagos");
      }
    } catch (err) {
      console.error("Error al obtener historial de pagos:", err);
      setPaymentError(err.message);
    }
  };

  const closePaymentHistoryModal = () => {
    setShowPaymentHistoryModal(false);
    setCurrentStudent(null);
  };

  // Función para abrir el modal de agregar pago al historial
  const openAddPaymentModal = (alumno) => {
    setCurrentStudent(alumno);
    setAddPaymentAmount("");
    setPaymentError(null);
    setShowAddPaymentModal(true);
  };

  const closeAddPaymentModal = () => {
    setShowAddPaymentModal(false);
    setCurrentStudent(null);
  };

  // Función para agregar pago al historial (sin modificar vencimiento)
  const handleAddPaymentSubmit = async () => {
    if (!addPaymentAmount || isNaN(parseFloat(addPaymentAmount))) {
      setPaymentError("Por favor ingrese un monto válido");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const response = await fetch(
        `${ENV.URL}agregar-pago/historial/${currentStudent.dni}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: parseFloat(addPaymentAmount) }),
        }
      );

      const data = await response.json();
      console.log("Add payment response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el pago");
      }

      // Actualizar lista de alumnos localmente sin recargar todo
      const updatedAlumnos = alumnos.map((alumno) => {
        if (alumno.dni === currentStudent.dni) {
          return {
            ...alumno,
            paymentHistory: data.student.paymentHistory,
          };
        }
        return alumno;
      });

      setAlumnos(updatedAlumnos);
      closeAddPaymentModal();
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
    if (dateString && typeof dateString === "object" && dateString.$date) {
      isoDate = dateString.$date;
    }

    // Crear fecha sin ajuste de zona horaria
    const date = new Date(isoDate);

    // Ajustar para compensar la zona horaria
    const adjustedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );

    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Forzar zona horaria UTC+
    };

    return adjustedDate.toLocaleDateString("es-ES", options);
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
              <p className="warning-message">
                IMPORTANTE: Solo usar para renovar el vencimiento del alumno, en
                este caso se modificara el vencimiento cambiando unicamente el
                mes. Si se vuelve a pagar el mismo mes, se VOLVERA A MODIFICAR
                el vencimiento.
              </p>
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
                <strong>Proximo Vencimiento: </strong>
                {formatDate(
                  new Date(
                    new Date(currentStudent.paymentDueDate).setMonth(
                      new Date(currentStudent.paymentDueDate).getMonth() + 1
                    )
                  )
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

      {/* Modal de Historial de Pagos */}
      {showPaymentHistoryModal && currentStudent && (
        <div className="modal-backdrop">
          <div className="modal payment-history-modal">
            <div className="modal-header">
              <h3>Historial Completo de Pagos</h3>
              <button className="close-btn" onClick={closePaymentHistoryModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="student-info-header">
                <h4>
                  {currentStudent.name} {currentStudent.lastName}
                </h4>
                <p>
                  DNI: {currentStudent.dni} - Plan: {currentStudent.planType}
                </p>
                <p></p>
              </div>

              <div className="payment-history-container">
                {paymentHistory.length > 0 ? (
                  <table className="payment-history-table">
                    <thead>
                      <tr>
                        <th>Fecha de Pago</th>
                        <th>Monto</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment, index) => (
                        <tr key={index}>
                          <td>{formatDate(payment.paymentDate)}</td>
                          <td>${payment.amount.toFixed(2)}</td>
                          <td>
                            <span className="payment-status completed">
                              Completado
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-payments">
                    <p>No se encontraron registros de pagos</p>
                  </div>
                )}
              </div>

              <div className="payment-summary">
                <p>
                  <strong>Total pagado:</strong> $
                  {paymentHistory
                    .reduce((sum, payment) => sum + payment.amount, 0)
                    .toFixed(2)}
                </p>
                <p>
                  <strong>Cantidad de pagos:</strong> {paymentHistory.length}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closePaymentHistoryModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nuevo Modal para AGREGAR PAGO al historial */}
      {showAddPaymentModal && currentStudent && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Agregar Pago al Historial</h3>
              <button className="close-btn" onClick={closeAddPaymentModal}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p className="warning-message">
                IMPORTANTE: Solo usar para agregar un pago al historial sin
                modificar el vencimiento del alumno. Esta funcion es para poder
                agregar multiples pagos al mismo alumno sin modificar el
                vencimiento actual.
              </p>
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
                <strong>Fecha de vencimiento no cambiará</strong>
              </p>
              <p>
                <strong>Plan:</strong> {currentStudent.planType}
              </p>

              <div className="form-group">
                <label htmlFor="addPaymentAmount">Monto del pago:</label>
                <input
                  type="number"
                  id="addPaymentAmount"
                  value={addPaymentAmount}
                  onChange={(e) => setAddPaymentAmount(e.target.value)}
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
                onClick={closeAddPaymentModal}
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                className="btn-confirm"
                onClick={handleAddPaymentSubmit}
                disabled={isProcessing}
              >
                {isProcessing ? "Procesando..." : "Agregar Pago"}
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
                      <FaEdit />
                    </Link>
                    <button
                      className="btn-payment-history"
                      onClick={() => openPaymentHistoryModal(alumno)}
                      title="Ver historial completo de pagos"
                    >
                      <FaHistory /> Historial
                    </button>
                    {/* Nuevo botón para AGREGAR PAGO al historial */}
                    <button
                      className="btn-add-payment"
                      onClick={() => openAddPaymentModal(alumno)}
                      title="Agregar pago al historial sin cambiar fecha de vencimiento"
                    >
                      <FaMoneyBillWave /> Agregar Pago
                    </button>
                    <button
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        fontSize: "14px",
                      }}
                      className="btn-edit-renovar"
                      onClick={() => openPaymentModal(alumno)}
                    >
                      Renovar
                    </button>
                    <button
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                      }}
                      className="btn-edit-renovar"
                      onClick={() => {
                        if (
                          window.confirm(
                            `¿Estás seguro de eliminar a ${alumno.name} ${alumno.lastName}?`
                          )
                        ) {
                          fetch(`${ENV.URL}baja/${alumno.dni}`, {
                            method: "DELETE",
                          })
                            .then((response) => {
                              if (response.ok) {
                                setAlumnos((prev) =>
                                  prev.filter((a) => a.dni !== alumno.dni)
                                );
                              } else {
                                throw new Error("Error al eliminar alumno");
                              }
                            })
                            .catch((err) => {
                              console.error("Error deleting student:", err);
                              alert("Error al eliminar el alumno");
                            });
                        }
                      }}
                      disabled={isProcessing}
                    >
                      X
                    </button>

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
