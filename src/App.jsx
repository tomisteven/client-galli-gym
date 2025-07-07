import React, { useState } from "react";
import DniInput from "./components/DniInput";
import StudentProfile from "./components/StudentProfile";

import "./index.css";

function App() {
  const [currentStudent, setCurrentStudent] = useState(null);

  const handleStudentFound = (student) => {
    setCurrentStudent(student);
  };

  return (
    <div className="app">
      <header>
        <h1>Sistema de Gestión Gimnasio</h1>
      </header>

      <main>
        {!currentStudent ? (
          <DniInput onStudentFound={handleStudentFound} />
        ) : (
          <StudentProfile setCurrentStudent={setCurrentStudent} student={currentStudent} />
        )}
      </main>
    </div>
  );
}

export default App;
