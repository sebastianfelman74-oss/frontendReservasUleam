// src/components/reservas.jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from './config';
import { ChevronLeft, ChevronRight, Clock, MapPin, X } from 'lucide-react';

const Reservar = ({ onBack, user }) => {
  const [recursos, setRecursos] = useState([]);
  const [reservasDelDia, setReservasDelDia] = useState([]);
  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRecurso, setSelectedRecurso] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    horaInicio: '',
    horaFin: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar recursos
  useEffect(() => {
    const cargarRecursos = async () => {
      try {
        const response = await fetch(`http://${API_URL}/recurso`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setRecursos(data);
        }
      } catch (err) {
        console.error('Error al cargar recursos:', err);
      }
    };
    cargarRecursos();
  }, []);

  // Cargar reservas del día cuando se selecciona fecha y recurso
  useEffect(() => {
    if (selectedDate && selectedRecurso) {
      cargarReservasDelDia();
    }
  }, [selectedDate, selectedRecurso]);

  const cargarReservasDelDia = async () => {
    try {
      const fechaStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `http://${API_URL}/recurso/${selectedRecurso}/disponibilidad?fecha=${fechaStr}`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        setReservasDelDia(data.reservas || []);
        setHorariosOcupados(data.bloqueados || []);
      }
    } catch (err) {
      console.error('Error al cargar disponibilidad:', err);
    }
  };

  // Generar días del mes
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
    
    setSelectedDate(date);
    setShowModal(true);
    setError('');
    setFormData({ horaInicio: '', horaFin: '' });
    setSelectedRecurso('');
    setReservasDelDia([]);
    setHorariosOcupados([]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    if (!selectedRecurso || !formData.horaInicio || !formData.horaFin) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (formData.horaFin <= formData.horaInicio) {
      setError('La hora de fin debe ser posterior a la de inicio');
      setLoading(false);
      return;
    }

    try {
      const fechaBase = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`http://${API_URL}/reserva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          RECURSOS_ID: parseInt(selectedRecurso),
          FECHA_INICIO: `${fechaBase}T${formData.horaInicio}:00`,
          FECHA_FIN: `${fechaBase}T${formData.horaFin}:00`
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Reserva creada con éxito');
        setShowModal(false);
        setSelectedRecurso('');
        setFormData({ horaInicio: '', horaFin: '' });
      } else {
        setError(data.mensaje || 'Error al crear la reserva');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direccion);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📅 Reservar Espacio</h1>
              <p className="text-gray-600 mt-1">Selecciona un día en el calendario</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700 transition"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Calendario */}
        <div className="bg-white shadow-lg p-6">
          {/* Controles del mes */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => cambiarMes(1)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {diasSemana.map(dia => (
              <div key={dia} className="text-center font-semibold text-gray-600 py-2">
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, idx) => (
              <button
                key={idx}
                onClick={() => handleDateClick(date)}
                disabled={!date || isPastDate(date)}
                className={`
                  aspect-square p-2 rounded-lg text-center transition-all
                  ${!date ? 'invisible' : ''}
                  ${isPastDate(date) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-100 cursor-pointer'}
                  ${isToday(date) ? 'bg-blue-500 text-white font-bold hover:bg-blue-600' : ''}
                  ${isSelected(date) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                  ${!isPastDate(date) && !isToday(date) && !isSelected(date) ? 'bg-white border border-gray-200' : ''}
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Reserva */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="bg-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">
                  Reserva para {selectedDate?.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-blue-700 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Selector de recurso */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin size={18} />
                    Selecciona el espacio
                  </label>
                  <select
                    value={selectedRecurso}
                    onChange={(e) => setSelectedRecurso(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Elige un espacio...</option>
                    {recursos.map(recurso => (
                      <option key={recurso.RECURSOS_ID} value={recurso.RECURSOS_ID}>
                        {recurso.NOMBRE} - {recurso.ESTADO}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reservas existentes */}
                {selectedRecurso && (horariosOcupados.length > 0 || reservasDelDia.length > 0) && (
                  <div className="space-y-3">
                    {/* Clases programadas */}
                    {horariosOcupados.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-800 mb-2">
                          🚫 Horarios de clases (NO disponible):
                        </h4>
                        <div className="space-y-2">
                          {horariosOcupados.map((horario, idx) => (
                            <div key={idx} className="text-sm text-red-700 flex items-center gap-2">
                              <Clock size={16} />
                              {horario.HORA_INICIO?.substring(0, 5)} - {horario.HORA_FIN?.substring(0, 5)}
                              {horario.MOTIVO && <span className="text-xs">({horario.MOTIVO})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reservas de usuarios */}
                    {reservasDelDia.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          ⚠️ Reservas existentes:
                        </h4>
                        <div className="space-y-2">
                          {reservasDelDia.map((reserva, idx) => (
                            <div key={idx} className="text-sm text-yellow-700 flex items-center gap-2">
                              <Clock size={16} />
                              {new Date(reserva.FECHA_INICIO).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {new Date(reserva.FECHA_FIN).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Horas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Clock size={18} />
                      Hora de inicio
                    </label>
                    <input
                      type="time"
                      value={formData.horaInicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaInicio: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Clock size={18} />
                      Hora de fin
                    </label>
                    <input
                      type="time"
                      value={formData.horaFin}
                      onChange={(e) => setFormData(prev => ({ ...prev, horaFin: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
                      loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Guardando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservar;