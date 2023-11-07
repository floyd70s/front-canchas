import React from "react";
import { Modal, Form, Button, Col, Row } from "react-bootstrap";

function GeneraReservaComponent({
  showModal,
  handleClose,
  handleReservaSubmit,
  handleReservaFormChange,
  reservaDetails,
  bloqueReserva,
}) {
  const tituloModal = `Reserva ${reservaDetails.fecha} para el bloque ${bloqueReserva}`;

  return (
    <Modal show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{tituloModal}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} controlId="formNombreReserva">
            <Form.Label column sm="3">
              Nombre de la Reserva
            </Form.Label>
            <Col sm="9">
              <Form.Control
                type="text"
                name="nombre_reserva"
                value={reservaDetails.nombre_reserva}
                onChange={handleReservaFormChange}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} controlId="formTelefonoContacto">
            <Form.Label column sm="3">
              Teléfono de Contacto
            </Form.Label>
            <Col sm="9">
              <Form.Control
                type="text"
                name="telefono_contacto"
                value={reservaDetails.telefono_contacto}
                onChange={handleReservaFormChange}
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleReservaSubmit}>
          Realizar Reserva
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default GeneraReservaComponent;
