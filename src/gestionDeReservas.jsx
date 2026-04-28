import React, { useState, useEffect } from 'react';
import { API_URL } from './config';

const GestionReservas = ({ onBack, user }) => {
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState('PENDIENTE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar reservas según el filtro
  useEffect(() => {
    cargarReservas();
  }, [filtro]);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '${API_URL}/reserva';
      
      // Si el filtro es PENDIENTE, usar el endpoint específico
      if (filtro === 'PENDIENTE') {
        url = `${API_URL}/admin/reservas/pendientes`;
      }

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        let data = await response.json();
        
        // Si no es el endpoint de pendientes, filtrar por estado
        if (filtro !== 'PENDIENTE' && filtro !== 'TODAS') {
          data = data.filter(r => r.ESTADO === filtro);
        }
        
        setReservas(data);
      } else {
        setError('No se pudieron cargar las reservas');
      }
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (reservaId, nuevoEstado) => {
    const confirmar = window.confirm(
      `¿Estás seguro de ${nuevoEstado === 'CONFIRMADA' ? 'APROBAR' : 'RECHAZAR'} esta reserva?`
    );

    if (!confirmar) return;

    try {
      const response = await fetch(`${API_URL}/admin/reserva/${reservaId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ESTADO: nuevoEstado })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Reserva ${nuevoEstado.toLowerCase()} exitosamente`);
        cargarReservas(); // Recargar la lista
      } else {
        alert(`❌ Error: ${data.mensaje || 'No se pudo actualizar'}`);
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      alert('❌ Error de conexión');
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🛡️ Gestión de Reservas</h1>
              <p className="text-gray-600 mt-1">Panel de administrador</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
            >
              ← Volver al Dashboard
            </button>
          </div>

          {/* Filtros */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setFiltro('PENDIENTE')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === 'PENDIENTE'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ⏳ Pendientes
            </button>
            <button
              onClick={() => setFiltro('CONFIRMADA')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === 'CONFIRMADA'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ✅ Confirmadas
            </button>
            <button
              onClick={() => setFiltro('CANCELADA')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === 'CANCELADA'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ❌ Canceladas
            </button>
            <button
              onClick={() => setFiltro('TODAS')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === 'TODAS'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Todas
            </button>
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando reservas...</p>
          </div>
        ) : (
          <>
            {/* Lista de reservas */}
            {reservas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">
                  No hay reservas {filtro !== 'TODAS' ? filtro.toLowerCase() + 's' : ''}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {reservas.map((reserva) => (
                  <div
                    key={reserva.RESERVAS_ID}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {reserva.RECURSO_NOMBRE}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${obtenerColorEstado(
                              reserva.ESTADO
                            )}`}
                          >
                            {reserva.ESTADO}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                          <div>
                            <p className="text-sm text-gray-500">👤 Usuario</p>
                            <p className="font-medium">{reserva.USUARIO_NOMBRE}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">🆔 ID Reserva</p>
                            <p className="font-medium">#{reserva.RESERVAS_ID}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">📅 Inicio</p>
                            <p className="font-medium">{formatearFecha(reserva.FECHA_INICIO)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">🏁 Fin</p>
                            <p className="font-medium">{formatearFecha(reserva.FECHA_FIN)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción solo para PENDIENTES */}
                      {reserva.ESTADO === 'PENDIENTE' && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => cambiarEstado(reserva.RESERVAS_ID, 'CONFIRMADA')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={() => cambiarEstado(reserva.RESERVAS_ID, 'CANCELADA')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionReservas;