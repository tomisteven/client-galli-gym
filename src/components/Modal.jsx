import "./modal.css";

const Modal = ({ children, onClose }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <button onClick={onClose} className="modal-close">&times;</button>
      {children}
    </div>
  </div>
);

export default Modal;
