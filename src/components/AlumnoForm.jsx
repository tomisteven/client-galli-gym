import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ENV } from "../env";
import { toast } from "react-toastify";
import Loading from "./Loading";
import Modal from "./Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AlumnoForm = () => {
  const { dni } = useParams();
  const navigate = useNavigate();

  const [alumno, setAlumno] = useState({
    dni: "",
    name: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    planType: "Full",
    paymentDueDate: "",
    status: "Al día",
    joinDate: new Date().toISOString().split("T")[0],
    medicamento: "Ninguno",
    patologias: "Ninguna",
    activo: true,
  });

  const [loading, setLoading] = useState(!!dni);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  //const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  //const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (dni) {
      const fetchAlumno = async () => {
        try {
          const response = await fetch(`${ENV.URL}alumno/${dni}`);
          const data = await response.json();
          if (response.ok) {
            const adjustedData = {
              ...data,
              birthDate: data.birthDate?.split("T")[0] || "",
              paymentDueDate: data.paymentDueDate?.split("T")[0] || "",
              joinDate: data.joinDate?.split("T")[0] || "",
              medicamento: data.medicamento || "Ninguno",
              patologias: data.patologias || "Ninguna",
              activo: data.activo !== undefined ? data.activo : true,
            };
            setAlumno(adjustedData);
          } else {
            toast.error(data.error || "Alumno no encontrado");
            setError(data.error || "Alumno no encontrado");
          }
        } catch (err) {
          toast.error("Error de conexión");
          console.error(err);
          setError("Error de conexión");
        } finally {
          setLoading(false);
        }
      };
      fetchAlumno();
    }
  }, [dni]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAlumno((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const method = dni ? "PUT" : "POST";
    const url = dni ? `${ENV.URL}actualizar/${dni}` : `${ENV.URL}nuevo`;

    try {
      const formData = new FormData();

      for (const key in alumno) {
        const value = alumno[key];

        if (value === null || value === undefined || value === "") continue;

        if (key === "paymentHistory" && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }

      // Agregamos la imagen si hay
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(dni ? "Alumno actualizado" : "Alumno creado");
        navigate("/alumnos");
      } else {
        toast.error(data.error || "Error al guardar los datos");
        setError(data.error);
      }
    } catch (err) {
      toast.error("Error de conexión con el servidor");
      console.error(err);
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* const handleImageUpload = async () => {
    if (!selectedImage || !alumno.dni) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch(
        `${ENV.URL}actualizar-imagen/${alumno.dni}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success("Imagen actualizada correctamente");
        setAlumno((prev) => ({ ...prev, image: data.image }));
        setShowImageModal(false);
        setSelectedImage(null);
      } else {
        toast.error(data.error || "Error al subir imagen");
      }
    } catch (err) {
      console.error(err);
      setError("Error al subir imagen");
      toast.error("Error al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  }; */

  if (loading) return <Loading />;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="alumno-form">
      <h2>{dni ? "Editar Alumno" : "Nuevo Alumno"}</h2>

      <div className="cont-img-alumno">
        {alumno.image ? (
          <img
            className="img-alumno"
            src={alumno.image}
            alt="Imagen del alumno"
          />
        ) : (
          <p style={{ color: "#888" }}>Sin imagen aún</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Foto del Alumno</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
          />
          {selectedImage && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Vista previa"
                style={{ width: "150px", height: "auto", objectFit: "cover" }}
              />
            </div>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>DNI *</label>
            <input
              type="text"
              name="dni"
              value={alumno.dni}
              onChange={handleChange}
              pattern="[0-9]{8}"
              title="El DNI debe tener 8 dígitos"
              required
            />
          </div>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="name"
              value={alumno.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="lastName"
              value={alumno.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={alumno.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="phone"
              value={alumno.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="text"
              name="birthDate"
              value={alumno.birthDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Medicamentos</label>
            <input
              type="text"
              name="medicamento"
              value={alumno.medicamento}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Patologías</label>
            <input
              type="text"
              name="patologias"
              value={alumno.patologias}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Plan *</label>
            <select
              name="planType"
              value={alumno.planType}
              onChange={handleChange}
              required
            >
              <option value="Full">Full</option>
              <option value="Semanal">Semanal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado de Cuenta *</label>
            <select
              name="status"
              value={alumno.status}
              onChange={handleChange}
              required
            >
              <option value="Al día">Al día</option>
              <option value="Vencido">Vencido</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Próximo Vencimiento *</label>
            <DatePicker
              selected={
                alumno.paymentDueDate ? new Date(alumno.paymentDueDate) : null
              }
              onChange={(date) =>
                setAlumno({
                  ...alumno,
                  paymentDueDate: date.toISOString().split("T")[0],
                })
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccionar fecha"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Fecha de Ingreso</label>
            <DatePicker
              selected={alumno.joinDate ? new Date(alumno.joinDate) : null}
              onChange={(date) =>
                setAlumno({
                  ...alumno,
                  joinDate: date.toISOString().split("T")[0],
                })
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccionar fecha"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="activo"
                checked={alumno.activo}
                onChange={handleChange}
              />
              Activo
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/alumnos")}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : dni ? "Actualizar" : "Crear"}
          </button>
        </div>
      </form>

      {/* {showImageModal && (
        <Modal onClose={() => setShowImageModal(false)}>
          <div className="image-modal">
            <h3>Subir Imagen de Perfil</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files[0])}
            />
            <div className="modal-actions">
              <button
                onClick={() => setShowImageModal(false)}
                className="btn-cancel"
              >
                Cancelar
              </button>
              <button
                onClick={handleImageUpload}
                className="btn-submit"
                disabled={uploadingImage || !selectedImage}
              >
                {uploadingImage ? "Subiendo..." : "Subir Imagen"}
              </button>
            </div>
          </div>
        </Modal>
      )} */}
    </div>
  );
};

export default AlumnoForm;
