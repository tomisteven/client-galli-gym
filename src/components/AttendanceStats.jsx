// frontend/src/components/AttendanceStats.jsx
import React, { useState, useEffect } from "react";
import "../styles/AttendanceStats.css"; // Asegúrate de tener un archivo CSS para estilos

const AttendanceStats = ({ asistencias }) => {
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [calendar, setCalendar] = useState([]);

  // Función para agrupar asistencias por semana
  useEffect(() => {
    if (!asistencias || asistencias.length === 0) return;

    // Filtrar asistencias por mes/año seleccionado
    const filteredAsistencias = asistencias.filter((dateStr) => {
      const date = new Date(dateStr);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    // Agrupar por semana
    //const stats = [];
    const weeks = {};

    filteredAsistencias.forEach((dateStr) => {
      const date = new Date(dateStr);
      const weekNumber = getWeekNumber(date);

      if (!weeks[weekNumber]) {
        weeks[weekNumber] = {
          week: weekNumber,
          startDate: new Date(date),
          count: 0,
          days: {},
        };
      }

      weeks[weekNumber].count++;
      const day = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      weeks[weekNumber].days[day] = (weeks[weekNumber].days[day] || 0) + 1;
    });

    // Convertir a array y ordenar
    const result = Object.values(weeks).sort((a, b) => a.week - b.week);
    setWeeklyStats(result);

    // Generar calendario
    generateCalendar(month, year);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asistencias, month, year]);

  // Obtener número de semana
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Generar calendario mensual
  const generateCalendar = (targetMonth, targetYear) => {
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Crear matriz para el calendario
    const calendarMatrix = [];
    let week = [];

    // Días vacíos al inicio
    for (let i = 0; i < firstDay.getDay(); i++) {
      week.push(null);
    }

    // Llenar con días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const hasAttendance = asistencias.some((assist) => {
        const assistDate = new Date(assist);
        return (
          assistDate.getDate() === day &&
          assistDate.getMonth() === targetMonth &&
          assistDate.getFullYear() === targetYear
        );
      });

      week.push({ day, date, hasAttendance });

      // Nueva semana cuando llega al domingo
      if (date.getDay() === 6 || day === daysInMonth) {
        calendarMatrix.push(week);
        week = [];
      }
    }

    setCalendar(calendarMatrix);
  };

  // Cambiar mes
  const changeMonth = (direction) => {
    setMonth((prev) => {
      let newMonth = prev + direction;
      let newYear = year;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setYear(newYear);
      return newMonth;
    });
  };

  // Nombres de días y meses
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <div className="attendance-stats">
      <div className="stats-header">
        <h3>Estadísticas de Asistencia</h3>
        <div className="month-selector">
          <button onClick={() => changeMonth(-1)}>&lt;</button>
          <span>
            {monthNames[month]} {year}
          </span>
          <button onClick={() => changeMonth(1)}>&gt;</button>
        </div>
      </div>

      <div className="stats-container">
        <div className="calendar-view">
          <h4>Calendario Mensual</h4>
          <div className="calendar-grid">
            {dayNames.map((day) => (
              <div key={day} className="calendar-header">
                {day}
              </div>
            ))}

            {calendar.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((dayInfo, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`calendar-day ${
                      dayInfo
                        ? dayInfo.hasAttendance
                          ? "attended"
                          : "not-attended"
                        : "empty"
                    }`}
                  >
                    {dayInfo ? dayInfo.day : ""}
                    {dayInfo?.hasAttendance && (
                      <div className="attendance-dot"></div>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="chart-view">
          <h4>Asistencias por Semana</h4>
          <div className="week-chart">
            {weeklyStats.length > 0 ? (
              weeklyStats.map((week) => (
                <div key={week.week} className="week-bar">
                  <div className="bar-label">Semana {week.week}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ height: `${week.count * 20}px` }}
                    ></div>
                  </div>
                  <div className="bar-count">{week.count} asistencias</div>
                </div>
              ))
            ) : (
              <p>No hay asistencias registradas este mes</p>
            )}
          </div>
        </div>
      </div>

      <div className="summary">
        <p>
          <strong>Total del mes:</strong>{" "}
          {weeklyStats.reduce((sum, week) => sum + week.count, 0)} asistencias
        </p>
        <p>
          <strong>Promedio semanal:</strong>{" "}
          {weeklyStats.length > 0
            ? (
                weeklyStats.reduce((sum, week) => sum + week.count, 0) /
                weeklyStats.length
              ).toFixed(1)
            : 0}{" "}
          asistencias
        </p>
      </div>
    </div>
  );
};

export default AttendanceStats;
