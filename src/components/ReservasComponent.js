import { useAuth0 } from "@auth0/auth0-react";

import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Alert } from "react-bootstrap";
import "../App.css"; // Asegúrate de tener estilos CSS adecuados importados
import GeneraReservaComponent from "./GeneraReservaComponent";
import { API_URLS } from "../app_config";


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

    dates[fecha][canchaId][bloque] = {
      nombre_reserva: nombreReserva ?? 'disponible',
      fecha_reserva: fecha,
      bloque: bloque,
      telefono_contacto: reserva.fono ?? 'No disponible',
      username: username ?? 'No disponible',
      fecha_hora_creacion: reserva.fecha_hora_creacion ?? 'No disponible',
      id: reserva.reserva_id,
      // Agregamos una nueva propiedad para marcar si la reserva está activa o no.
      reservado: reserva.reserva_id !== null
    };
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
  const { user, isAuthenticated } = useAuth0();
  const [puedeAnular, setPuedeAnular] = useState(false);
  const [showAlert, setShowAlert] = useState({ visible: false, mensaje: "", variant: "success" });
  const [usuarioId, setUsuarioId] = useState(null);




  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadReservas(user.email, 7); // 7 días por defecto
      obtenerPermisosDeAnulacion(user.email);
    }
  }, [user, isAuthenticated]);

  const obtenerPermisosDeAnulacion = (username) => {
    const url = `${API_URLS.getUser}/${encodeURIComponent(username)}`; // Modificación aquí

    axios.get(url)
      .then((response) => {
        const data = response.data[0]; // Asumiendo que la respuesta es un array con un solo objeto.
        setPuedeAnular(data.puedeanular === 1);
        setUsuarioId(data.usuario_id);
      })
      .catch((error) => {
        console.error("Error al obtener permisos de anulación", error);
      });
  };


  const loadReservas = (username, dias) => {
    const params = {
      username: username,
      dias: dias
    };
    axios.post(API_URLS.getAllReservasProximosDias, params)
      .then((response) => {
        setReservas(response.data);
        const formattedData = formatData(response.data);
        setDatesData(formattedData);
      })
      .catch((error) => {
        console.error("Error al obtener las reservas", error);
        setShowAlert({ visible: true, mensaje: "Error al obtener las reservas", variant: "warning" });
        setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
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
      usuario_id: usuarioId,
      cancha_id: reservaDetails.cancha_id,
      nombre_reserva: reservaDetails.nombre_reserva,
      fecha_reserva: reservaDetails.fecha,
      fono: reservaDetails.telefono_contacto,
      bloque: selectedBlock + 16,
    };

    axios
      .post(API_URLS.insertReserva, nuevaReserva)
      .then((response) => {
        loadReservas(user.email, 7);
        setShowReservaForm(false);
        setShowAlert({ visible: true, mensaje: "Reserva ingresada con exito", variant: "success" });
        setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);

      })
      .catch((error) => {
        console.error("Error al insertar la reserva", error);
        setShowAlert({ visible: true, mensaje: "Error al insertar la reserva", variant: "warning" });
        setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
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

  const OLDhandleDeleteReserva = (reservaId) => {
    console.log("=== handleDeleteReserva ===")

    const dataReserva = { reservaId: reservaId };
    const payload = API_URLS.deleteBloqueReserva

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

  const handleDeleteReserva = (reserva) => {
    if (puedeAnular) {
      axios.post(API_URLS.deleteBloqueReserva, { reservaId: modalContent.id })
        .then((response) => {
          loadReservas(user.email, 7); // o el intervalo de días que prefieras
          closeModal();
          setShowAlert({ visible: true, mensaje: "Reserva eliminada con exito", variant: "success" });
          setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
        })
        .catch((error) => {
          console.error("Error al anular la reserva", error);
          closeModal();
          setShowAlert({ visible: true, mensaje: "Error al anular la reserva", variant: "danger" });
          setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
        });
    } else {
      if (user.email === modalContent.username) {
        axios.post(API_URLS.deleteBloqueReserva, { reservaId: modalContent.id })
          .then((response) => {
            loadReservas(user.email, 7); // o el intervalo de días que prefieras
            closeModal();
            setShowAlert({ visible: true, mensaje: "Reserva eliminada con exito", variant: "success" });
            setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
          })
          .catch((error) => {
            console.error("Error al anular la reserva", error);
            closeModal();
            setShowAlert({ visible: true, mensaje: "Error al anular la reserva", variant: "danger" });
            setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
          });
      }
      else {
        closeModal();
        setShowAlert({ visible: true, mensaje: "No posee los permisos necesarios para eliminar reservas de otros usuarios.", variant: "warning" });
        setTimeout(() => setShowAlert({ visible: false, mensaje: "", variant: "success" }), 3000);
      }
    }
  };


  return (
    <div>
      <div className="contenedor-relativo">
        <h2 className="apple-style-h2">Reservas de Complejo Deportivo La Giocata</h2>
      </div>
      {showAlert.visible && (
        <Alert variant={showAlert.variant}>
          {showAlert.mensaje}
        </Alert>
      )}
      {Object.keys(datesData).map((fecha) => (
        <div key={fecha} className="fecha">
          <h2 className="detalle-fecha">{fecha}</h2>
          {Object.keys(datesData[fecha]).map((canchaId) => (
            <div key={canchaId} className="cancha">
              <h3 className="apple-style-h3">Cancha Nº {canchaId}</h3>
              <div className="bloque-row">
                {Array.from({ length: 8 }, (_, i) => {
                  const bloque = i;
                  const reserva = datesData[fecha][canchaId][bloque + 16];
                  const content = reserva && reserva.nombre_reserva !== "disponible"
                    ? `Reserva a nombre de ${reserva.nombre_reserva}`
                    : "disponible";

                  const blockClass = reserva && reserva.nombre_reserva !== "disponible"
                    ? "reservado"
                    : "disponible";

                  return (
                    <div
                      key={bloque}
                      className={`bloque ${blockClass}`}
                      onClick={() => {
                        setSelectedBlock(bloque);
                        console.log("reserva.nombre_reserva: " + reserva.nombre_reserva)
                        if (reserva.nombre_reserva === "disponible") {
                          console.log("esta disponible ")
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

      <GeneraReservaComponent
        showModal={showReservaForm}
        handleClose={closeReservaForm}
        handleReservaSubmit={handleReservaSubmit}
        handleReservaFormChange={handleReservaFormChange}
        reservaDetails={reservaDetails}
        bloqueReserva={formatTime(selectedBlock)}
      />
    </div>
  );
}

export default ReservasComponent;
