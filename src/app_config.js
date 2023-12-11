const API_BASE_URL = 'https://reservas-ukdq.onrender.com/api';
const API_BASE_URL_dev = 'http://localhost:3002/api';

export const API_URLS = {
  getAllReservasProximosDias: `${API_BASE_URL}/getAllReservasProximosDias`,
  insertReserva: `${API_BASE_URL}/insert-Reserva`,
  deleteBloqueReserva: `${API_BASE_URL}/delete-bloque-reserva`,
  getUser: `${API_BASE_URL}/getUser`,
};