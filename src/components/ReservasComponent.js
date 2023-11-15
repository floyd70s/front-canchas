import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Alert } from "react-bootstrap";
import "../App.css"; // Asegúrate de tener estilos CSS adecuados importados

const API_URL = 'http://localhost:3002/api/getAllReservasProximosDias/3';
const INSERT_API_URL = 'http://localhost:3002/api/insert-Reserva';
const DELETE_API_URL = 'http://localhost:3002/api/delete-bloque-reserva';

function formatDate(fecha) {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatData(reservas) {
  const dates = {};

  reservas.forEach((reserva) => {
    const fecha = formatDate(reserva.fecha);
    const canchaId = reserva.cancha_id;
    const bloque = reserva.bloque;
    const nombreReserva = reserva.nombre_reserva;
    const username = reserva.nombre_usuario;

    if (!dates[fecha]) {
      dates[fecha] = {};
    }

    if (!dates[fecha][canchaId]) {
      dates[fecha][canchaId] = {};
    }

    if (typeof dates[fecha][canchaId][bloque] ==='undefined') {
      dates[fecha][canchaId][bloque] = {
        nombre_reserva: nombreReserva ?? 'disponible',
        fecha_reserva: fecha,
        bloque: bloque,
        telefono_contacto: reserva.fono ?? 'No disponible',
        username: username ?? 'No disponible',
        fecha_hora_creacion: reserva.fecha_hora_creacion ?? 'No disponible',
        id: reserva.reserva_id,
      };
    }
  });

  return dates;
}

function formatTime(bloque) {
  const hour = bloque + 16;
  return `${hour}:00`;
}

function ReservasComponent() {
  const [reservas, setReservas] = useState([]);
  const [datesData, setDatesData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [reservaDetails, setReservaDetails] = useState({
    nombre_reserva: "",
    telefono_contacto: "",
    fecha: formatDate(new Date()),
    cancha_id: "",
  });
  const [showReservaForm, setShowReservaForm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = () => {
    axios
      .get(API_URL)
      .then((response) => {
        setReservas(response.data);
        const formattedData = formatData(response.data);
        setDatesData(formattedData);
      })
      .catch((error) => {
        console.error("Error al obtener las reservas", error);
      });
  };

  const openModal = (content, canchaId) => {
    setModalContent(content);
    setShowModal(true);
    if (canchaId) {
      setModalContent({ ...content, cancha_id: canchaId });
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleReservaFormChange = (e) => {
    const { name, value } = e.target;
    setReservaDetails({
      ...reservaDetails,
      [name]: value,
    });
  };

  const handleReservaSubmit = () => {
    const nuevaReserva = {
      usuario_id: 1,
      cancha_id: reservaDetails.cancha_id,
      nombre_reserva: reservaDetails.nombre_reserva,
      fecha_reserva: reservaDetails.fecha,
      fono: reservaDetails.telefono_contacto,
      bloque: selectedBlock + 16,
    };

    axios
      .post(INSERT_API_URL, nuevaReserva)
      .then((response) => {
        console.log(response.data);
        loadReservas();
        setShowReservaForm(false);
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      })
      .catch((error) => {
        console.error("Error al insertar la reserva", error);
      });
  };

  const openReservaForm = (fecha, canchaId) => {
    setShowReservaForm(true);
    setReservaDetails({
      ...reservaDetails,
      fecha,
      cancha_id: canchaId,
    });
  };

  const closeReservaForm = () => {
    setShowReservaForm(false);
  };

  const handleDeleteReserva = (reservaId) => {
    const dataReserva = { reservaId: reservaId };
    const payload = DELETE_API_URL + "/" + reservaId;
    axios
      .post(payload, dataReserva)
      .then((response) => {
        console.log(response.data);
        loadReservas();
        closeModal();
      })
      .catch((error) => {
        console.error("Error al anular la reserva", error);
      });
  };

  return (
    <div>
      {showSuccessAlert && (
        <Alert variant="success">
          Reserva realizada con éxito.
        </Alert>
      )}
      {Object.keys(datesData).map((fecha) => (
        <div key={fecha} className="fecha">
          <h2>Fecha: {fecha}</h2>
          {Object.keys(datesData[fecha]).map((canchaId) => (
            <div key={canchaId} className="cancha">
              <h3>Cancha Nº {canchaId}</h3>
              <div className="bloque-row">
                {Array.from({ length: 8 }, (_, i) => {
                  const bloque = i;
                  const reserva = datesData[fecha][canchaId][bloque + 16];
                  const content = reserva
                    ? `Reserva a nombre de ${reserva.nombre_reserva}`
                    : "disponible";
                  const blockClass = reserva ? "reservado" : "disponible";

                  return (
                    <div
                      key={bloque}
                      className={`bloque ${blockClass}`}
                      onClick={() => {
                        setSelectedBlock(bloque);
                        if (!reserva) {
                          openReservaForm(fecha, canchaId);
                        } else {
                          openModal(reserva, canchaId);
                        }
                      }}
                    >
                      {formatTime(bloque)} {content}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}

      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalContent.nombre_reserva ? (
              `Reserva en Cancha Nº ${modalContent.cancha_id || "No disponible"} el ${modalContent.fecha_reserva} bloque: ${modalContent.bloque}`
            ) : (
              `Bloque disponible el ${modalContent.fecha_reserva}`
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Reservado por: {modalContent.username || "No disponible"}</p>
          <p>Nombre de la Reserva: {modalContent.nombre_reserva || "No disponible"}</p>
          <p>Teléfono de Contacto: {modalContent.telefono_contacto || "No disponible"}</p>
          <p>Fecha de Reserva: {modalContent.fecha_reserva || "No disponible"}</p>
          <p>Realizada el: {modalContent.fecha_hora_creacion || "No disponible"}</p>
        </Modal.Body>
        <Modal.Footer>
          {modalContent.nombre_reserva && (
            <Button variant="danger" onClick={() => handleDeleteReserva(modalContent.id)}>
              Anular Reserva
            </Button>
          )}
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Resto del código (GeneraReservaComponent) permanece sin cambios */}
    </div>
  );
}

export default ReservasComponent;