import React, { useState, useEffect } from 'react';
import { API_URL } from './config';

const MisReservas = ({ onBack, user }) => {
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState('TODAS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar reservas al montar el componente
  useEffect(() => {
    cargarMisReservas();
  }, [filtro]);

  const cargarMisReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://${API_URL}/reserva`, {
        credentials: 'include'
      });

      if (response.ok) {
        let data = await response.json();
        
        // Filtrar según el estado seleccionado
        if (filtro !== 'TODAS') {
          data = data.filter(r => r.ESTADO === filtro);
        }
        
        // Ordenar por fecha más reciente primero
        data.sort((a, b) => new Date(b.FECHA_INICIO) - new Date(a.FECHA_INICIO));
        
        setReservas(data);
      } else {
        setError('No se pudieron cargar tus reservas');
      }
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cancelarReserva = async (reservaId) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas cancelar esta reserva?');
    if (!confirmar) return;

    try {
      const response = await fetch(`http://${API_URL}/reserva/${reservaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ESTADO: 'CANCELADA'
        })
      });

      if (response.ok) {
        alert('✅ Reserva cancelada exitosamente');
        cargarMisReservas(); // Recargar la lista
      } else {
        alert('❌ Error al cancelar la reserva');
      }
    } catch (err) {
      console.error('Error al cancelar reserva:', err);
      alert('❌ Error de conexión');
    }
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return '⏳';
      case 'CONFIRMADA':
        return '✅';
      case 'CANCELADA':
        return '❌';
      default:
        return '📋';
    }
  };

  const esPasada = (fechaFin) => {
    return new Date(fechaFin) < new Date();
  };

  const puedeEditar = (reserva) => {
    // Solo se pueden editar/cancelar reservas PENDIENTES o CONFIRMADAS que no hayan pasado
    return (reserva.ESTADO === 'PENDIENTE' || reserva.ESTADO === 'CONFIRMADA') && 
           !esPasada(reserva.FECHA_FIN);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 Mis Reservas</h1>
              <p className="text-gray-600 mt-1">Gestiona todas tus reservas</p>
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
              onClick={() => setFiltro('TODAS')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filtro === 'TODAS'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 Todas
            </button>
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
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando tus reservas...</p>
          </div>
        ) : (
          <>
            {/* Lista de reservas */}
            {reservas.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes reservas {filtro !== 'TODAS' && filtro.toLowerCase() + 's'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filtro === 'TODAS' 
                    ? 'Aún no has realizado ninguna reserva'
                    : `No tienes reservas ${filtro.toLowerCase()}s en este momento`
                  }
                </p>
                <button
                  onClick={onBack}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hacer una reserva
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {reservas.map((reserva) => (
                  <div
                    key={reserva.RESERVAS_ID}
                    className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition ${
                      esPasada(reserva.FECHA_FIN) ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {reserva.RECURSO_NOMBRE}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${obtenerColorEstado(
                              reserva.ESTADO
                            )}`}
                          >
                            {obtenerIconoEstado(reserva.ESTADO)} {reserva.ESTADO}
                          </span>
                          {esPasada(reserva.FECHA_FIN) && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700">
                              🕒 Finalizada
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">
                          Reserva #{reserva.RESERVAS_ID}
                        </p>
                      </div>

                      {/* Botones de acción */}
                      {puedeEditar(reserva) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => cancelarReserva(reserva.RESERVAS_ID)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Columna izquierda: Fecha y hora */}
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                            📅 Fecha
                          </div>
                          <p className="text-gray-900 font-medium">
                            {formatearFecha(reserva.FECHA_INICIO)}
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800 font-semibold mb-2">
                            ⏰ Horario
                          </div>
                          <p className="text-gray-900 font-medium">
                            {formatearHora(reserva.FECHA_INICIO)} - {formatearHora(reserva.FECHA_FIN)}
                          </p>
                        </div>
                      </div>

                      {/* Columna derecha: Detalles */}
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-purple-800 font-semibold mb-2">
                            👤 Usuario
                          </div>
                          <p className="text-gray-900 font-medium">
                            {reserva.USUARIO_NOMBRE || user?.nombre}
                          </p>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-orange-800 font-semibold mb-2">
                            📊 Estado
                          </div>
                          <p className="text-gray-900 font-medium">
                            {reserva.ESTADO === 'PENDIENTE' && 'Esperando aprobación del administrador'}
                            {reserva.ESTADO === 'CONFIRMADA' && 'Reserva aprobada y confirmada'}
                            {reserva.ESTADO === 'CANCELADA' && 'Esta reserva fue cancelada'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mensaje adicional según el estado */}
                    {reserva.ESTADO === 'PENDIENTE' && (
                      <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                        <p className="text-yellow-800 text-sm">
                          ⏳ Tu reserva está pendiente de aprobación. El administrador la revisará pronto.
                        </p>
                      </div>
                    )}
                    
                    {reserva.ESTADO === 'CONFIRMADA' && !esPasada(reserva.FECHA_FIN) && (
                      <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                        <p className="text-green-800 text-sm">
                          ✅ Tu reserva está confirmada. No olvides asistir en la fecha y hora programada.
                        </p>
                      </div>
                    )}
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

export default MisReservas;