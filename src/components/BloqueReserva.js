import React from "react";
import { Button, Modal } from "react-bootstrap";

function BloqueReserva({
  bloqueData,
  handleReservaFormOpen,
  handleModalOpen,
  handleModalClose,
  handleDeleteReserva,
}) {
  const {
    id,
    nombre_reserva,
    fecha_reserva,
    bloque,
    telefono_contacto,
    username,
    fecha_hora_creacion,
  } = bloqueData;

  const formatTime = (bloque) => {
    const hour = bloque + 16;
    return `${hour}:00`;
  };

  const openReservaForm = () => {
    handleReservaFormOpen(fecha_reserva, id);
  };

  return (
    <div className={`bloque ${nombre_reserva ? "reservado" : "disponible"}`}>
      {formatTime(bloque)}{" "}
      {nombre_reserva ? `Reserva a nombre de ${nombre_reserva}` : "disponible"}
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleDeleteReserva(id)}
        style={{ marginLeft: "10px" }}
      >
        Eliminar
      </Button>
    </div>
  );
}

export default BloqueReserva;
