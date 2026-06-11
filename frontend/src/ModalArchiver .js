import React from "react";
import "./ModalArchiver.css";

function ModalArchiver({ nomClasse, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <div className="modal-icon">
          <span>!</span>
        </div>

        <h2 className="modal-title">Archiver cette classe ?</h2>

        <p className="modal-text">
          Vous êtes sur le point d'archiver la classe{" "}
          <strong>"{nomClasse}"</strong>.<br />
          Cette action la rendra indisponible pour les opérations courantes.
        </p>

        <p className="modal-hint">
          Vous pourrez la retrouver dans le filtre "Archivées".
        </p>

        <div className="modal-actions">
          <button className="btn-annuler" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn-archiver" onClick={onConfirm}>
            Archiver
          </button>
        </div>

      </div>
    </div>
  );
} 
export default ModalArchiver;