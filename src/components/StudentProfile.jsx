// frontend/src/components/StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import PaymentHistory from './PaymentHistory';

const StudentProfile = ({ student, onClose, setCurrentStudent }) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [showActionMenu, setShowActionMenu] = useState(false);

  useEffect(() => {
    if (!document.body.classList.contains('kiosk-mode')) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onClose]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const calculateStatus = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due >= today ? 'Al día' : 'Vencido';
  };

 const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const handleDelete = () => {
    alert('Función de eliminar estudiante se implementará próximamente');
  };

  const handleEdit = () => {
    alert('Función de editar datos se implementará próximamente');
  };

  const handleDeactivate = () => {
    alert('Función de dar de baja se implementará próximamente');
  };

  return (
    <div className="student-profile">
      {document.body.classList.contains('kiosk-mode') && (
        <div className="countdown">
          Volviendo en: {timeLeft}s
        </div>
      )}

      <div className="profile-header">
        <div className="student-info">
          <div className="avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 3.58-8 8h16c0-4.42-3.58-8-8-8Z"/>
            </svg>
          </div>
          <div className="student-meta">
            <h2>{student.name} {student.lastName}</h2>
            <div className="status-container">
              <div className={`status-badge ${calculateStatus(student.paymentDueDate) === 'Al día' ? 'success' : 'danger'}`}>
                {calculateStatus(student.paymentDueDate)}
              </div>
              <div className="plan-badge">
                {student.planType}
              </div>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-close" onClick={() => setCurrentStudent(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <div className="action-menu">
            <button
              className="btn-menu"
              onClick={() => setShowActionMenu(!showActionMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>

            {showActionMenu && (
              <div className="action-dropdown">
                <button className="dropdown-item" onClick={handleDelete}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                  Eliminar
                </button>
                <button className="dropdown-item" onClick={handleEdit}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Editar Datos
                </button>
                <button className="dropdown-item" onClick={handleDeactivate}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-2-9c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                  </svg>
                  Dar de Baja
                </button>
              </div>
            )}
          </div>
        </div>
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
          <div className="detail-item">
            <span className="detail-label">Fecha de Nacimiento:</span>
            <span className="detail-value">
              {formatDate(student.birthDate)}
            </span>
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

      <div className="detail-card full-width">
        <h3>Historial Académico</h3>
        <div className="detail-row">
          <div className="detail-item">
            <span className="detail-label">Fecha de Ingreso:</span>
            <span className="detail-value">
              {formatDate(student.joinDate)}
            </span>
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