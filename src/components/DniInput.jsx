import React, { useState, useRef} from 'react';

const DniInput = ({ onStudentFound }) => {
  const [dni, setDni] = useState('');
  const inputRef = useRef(null);

  // ... código anterior ...



// ... resto del código ...

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/students/alumno/${dni}`);
      const data = await response.json();

      if (response.ok) {
        onStudentFound(data);
      } else {
        alert(data.error || 'Estudiante no encontrado');
      }
    } catch (err) {
      alert('Error al conectar con el servidor');
        console.error('Error fetching student:', err);
    }
  };

  return (
    <div className="dni-input-container">
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
          placeholder="Ingrese su DNI"
          maxLength={8}
          autoComplete="off"
        />
        <button type="submit">Buscar</button>
      </form>
    </div>
  );
};

export default DniInput;