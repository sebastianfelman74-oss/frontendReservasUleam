import React, { useState, useEffect } from 'react';
import { API_URL } from './config';

const GestionBloqueos = ({ onBack, user }) => {
  const [bloqueos, setBloqueos] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const formInicial = {
    RECURSOS_ID: '',
    DIA_SEMANA: '',
    HORA_INICIO: '',
    HORA_FIN: '',
    MATERIA: '',
    PROFESOR: '',
    NIVEL: '',
    FECHA_INICIO: '',
    FECHA_FIN: '',
    TIPO: 'CLASE'
  };

  const [form, setForm] = useState(formInicial);

  const diasSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [bloqueosRes, recursosRes] = await Promise.all([
        fetch(`${API_URL}/bloqueos`, { credentials: 'include' }),
        fetch(`${API_URL}/recurso`, { credentials: 'include' })
      ]);

      const bloqueosData = await bloqueosRes.json();
      const recursosData = await recursosRes.json();

      setBloqueos(bloqueosData);
      setRecursos(recursosData);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editando
        ? `${API_URL}/bloqueos/${editando}`
        : `${API_URL}/bloqueos`;
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        mostrarMensaje(data.mensaje || 'Error al guardar', 'error');
        return;
      }

      mostrarMensaje(data.mensaje, 'success');
      setShowForm(false);
      setEditando(null);
      setForm(formInicial);
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error al guardar el bloqueo', 'error');
    }
  };

  const handleEditar = (bloqueo) => {
    setForm({
      RECURSOS_ID: bloqueo.RECURSOS_ID,
      DIA_SEMANA: bloqueo.DIA_SEMANA,
      HORA_INICIO: bloqueo.HORA_INICIO,
      HORA_FIN: bloqueo.HORA_FIN,
      MATERIA: bloqueo.MATERIA || '',
      PROFESOR: bloqueo.PROFESOR || '',
      NIVEL: bloqueo.NIVEL || '',
      FECHA_INICIO: bloqueo.FECHA_INICIO?.split('T')[0],
      FECHA_FIN: bloqueo.FECHA_FIN?.split('T')[0],
      TIPO: bloqueo.TIPO || 'CLASE'
    });
    setEditando(bloqueo.ID);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este bloqueo?')) return;

    try {
      const res = await fetch(`${API_URL}/bloqueos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json();
      mostrarMensaje(data.mensaje, res.ok ? 'success' : 'error');
      if (res.ok) cargarDatos();
    } catch (err) {
      mostrarMensaje('Error al eliminar', 'error');
    }
  };

  const bloqueosFiltrados = filtroTipo === 'TODOS'
    ? bloqueos
    : bloqueos.filter(b => b.TIPO === filtroTipo);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando bloqueos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="text-gray-500 hover:text-blue-600 flex items-center gap-2">
                ← Volver
              </button>
              <h1 className="text-xl font-bold text-gray-900">🔒 Gestión de Bloqueos</h1>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditando(null); setForm(formInicial); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Nuevo Bloqueo
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Mensaje */}
        {mensaje.texto && (
          <div className={`mb-6 p-4 rounded-lg ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {editando ? '✏️ Editar Bloqueo' : '➕ Nuevo Bloqueo'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Bloqueo *</label>
                  <select name="TIPO" value={form.TIPO} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="CLASE">📚 Clase</option>
                    <option value="MANTENIMIENTO">🔧 Mantenimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Espacio *</label>
                  <select name="RECURSOS_ID" value={form.RECURSOS_ID} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccionar espacio...</option>
                    {recursos.map(r => (
                      <option key={r.RECURSOS_ID} value={r.RECURSOS_ID}>{r.NOMBRE}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana *</label>
                  <select name="DIA_SEMANA" value={form.DIA_SEMANA} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccionar día...</option>
                    {diasSemana.map(dia => (
                      <option key={dia} value={dia}>{dia}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio *</label>
                  <input type="time" name="HORA_INICIO" value={form.HORA_INICIO} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin *</label>
                  <input type="time" name="HORA_FIN" value={form.HORA_FIN} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
                  <input type="date" name="FECHA_INICIO" value={form.FECHA_INICIO} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
                  <input type="date" name="FECHA_FIN" value={form.FECHA_FIN} onChange={handleChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Campos solo para CLASE */}
              {form.TIPO === 'CLASE' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                    <input type="text" name="MATERIA" value={form.MATERIA} onChange={handleChange}
                      placeholder="Ej: Base de datos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profesor *</label>
                    <input type="text" name="PROFESOR" value={form.PROFESOR} onChange={handleChange}
                      placeholder="Ej: MORA ALEX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
                    <input type="text" name="NIVEL" value={form.NIVEL} onChange={handleChange}
                      placeholder="Ej: TERCERO SOFTWARE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              {form.TIPO === 'MANTENIMIENTO' && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del mantenimiento</label>
                    <input type="text" name="MATERIA" value={form.MATERIA} onChange={handleChange}
                      placeholder="Ej: Limpieza general, Reparación de equipos..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  {editando ? 'Guardar cambios' : 'Crear bloqueo'}
                </button>
                <button type="button"
                  onClick={() => { setShowForm(false); setEditando(null); setForm(formInicial); }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          {['TODOS', 'CLASE', 'MANTENIMIENTO'].map(tipo => (
            <button key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroTipo === tipo ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              {tipo === 'TODOS' ? '📋 Todos' : tipo === 'CLASE' ? '📚 Clases' : '🔧 Mantenimientos'}
              <span className="ml-2 text-sm">
                ({tipo === 'TODOS' ? bloqueos.length : bloqueos.filter(b => b.TIPO === tipo).length})
              </span>
            </button>
          ))}
        </div>

        {/* Lista de bloqueos */}
        {bloqueosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">🔓</div>
            <p className="text-gray-600">No hay bloqueos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bloqueosFiltrados.map((bloqueo) => (
              <div key={bloqueo.ID} className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${bloqueo.TIPO === 'CLASE' ? 'border-blue-500' : 'border-orange-500'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${bloqueo.TIPO === 'CLASE' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {bloqueo.TIPO === 'CLASE' ? '📚 Clase' : '🔧 Mantenimiento'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditar(bloqueo)}
                      className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                    <button onClick={() => handleEliminar(bloqueo.ID)}
                      className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 mb-1">{bloqueo.RECURSO_NOMBRE}</h3>
                <p className="text-gray-600 text-sm mb-3">{bloqueo.MATERIA}</p>

                <div className="space-y-1 text-sm text-gray-600">
                  <div>📅 {bloqueo.DIA_SEMANA}</div>
                  <div>⏰ {bloqueo.HORA_INICIO?.substring(0, 5)} - {bloqueo.HORA_FIN?.substring(0, 5)}</div>
                  {bloqueo.TIPO === 'CLASE' && (
                    <>
                      <div>👤 {bloqueo.PROFESOR}</div>
                      <div>🎓 {bloqueo.NIVEL}</div>
                    </>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Vigente: {bloqueo.FECHA_INICIO?.split('T')[0]} → {bloqueo.FECHA_FIN?.split('T')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionBloqueos;