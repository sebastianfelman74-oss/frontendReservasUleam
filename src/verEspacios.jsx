// src/components/VerEspacios.jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from './config';

const VerEspacios = ({ onBack, user }) => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formularioData, setFormularioData] = useState({
    NOMBRE: '',
    DESCRIPCION: '',
    ESTADO: 'DISPONIBLE'
  });
  const [guardandoRecurso, setGuardandoRecurso] = useState(false);

  // Cargar espacios al montar el componente
  useEffect(() => {
    cargarEspacios();
  }, []);

  const cargarEspacios = async () => {
    try {
      const response = await fetch(`http://${API_URL}/recurso`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setEspacios(data);
      } else {
        setError('No se pudieron cargar los espacios');
      }
    } catch (err) {
      console.error('Error al cargar espacios:', err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleFormularioChange = (e) => {
    const { name, value } = e.target;
    setFormularioData(prev => ({ ...prev, [name]: value }));
  };

  // Guardar nuevo recurso
  const guardarRecurso = async (e) => {
    e.preventDefault();
    if (!formularioData.NOMBRE.trim()) {
      setError('El nombre del recurso es obligatorio');
      return;
    }

    setGuardandoRecurso(true);
    setError('');

    try {
      const response = await fetch(`http://${API_URL}/recurso` , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          NOMBRE: formularioData.NOMBRE.trim(),
          DESCRIPCION: formularioData.DESCRIPCION.trim(),
          ESTADO: formularioData.ESTADO
        })
      });

      const data = await response.json();

      if (response.ok) {
        setFormularioData({
          NOMBRE: '',
          DESCRIPCION: '',
          ESTADO: 'DISPONIBLE'
        });
        setMostrarFormulario(false);
        await cargarEspacios();
        alert(`Recurso "${formularioData.NOMBRE}" creado exitosamente`);
      } else {
        setError(data.mensaje || 'Error al crear el recurso');
      }
    } catch (err) {
      console.error('Error de red:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setGuardandoRecurso(false);
    }
  };

  // Filtrar espacios por nombre
  const espaciosFiltrados = filtroTipo 
    ? espacios.filter(espacio => espacio.NOMBRE?.toLowerCase().includes(filtroTipo.toLowerCase()))
    : espacios;

  // Obtener tipos únicos basado en el nombre
  const detectarTipo = (nombre) => {
    const nombreLower = nombre?.toLowerCase() || '';
    if (nombreLower.includes('aula')) return 'AULA';
    if (nombreLower.includes('laboratorio')) return 'LABORATORIO';
    if (nombreLower.includes('auditorio')) return 'AUDITORIO';
    if (nombreLower.includes('cancha')) return 'CANCHA';
    if (nombreLower.includes('gimnasio')) return 'GIMNASIO';
    return 'OTRO';
  };

  const tiposDetectados = [...new Set(espacios.map(espacio => detectarTipo(espacio.NOMBRE)))];

  // Función para obtener el icono según el tipo detectado
  const obtenerIcono = (nombre) => {
    const tipo = detectarTipo(nombre);
    const iconos = {
      'AULA': '🏫',
      'LABORATORIO': '🖥️',
      'AUDITORIO': '🎭',
      'CANCHA': '⚽',
      'GIMNASIO': '🏃‍♂️',
      'OTRO': '🏢'
    };
    return iconos[tipo] || iconos.OTRO;
  };

  // Función para obtener color según el estado
  const obtenerColorEstado = (estado) => {
    const colores = {
      'DISPONIBLE': 'bg-green-100 text-green-800',
      'OCUPADO': 'bg-red-100 text-red-800',
      'MANTENIMIENTO': 'bg-yellow-100 text-yellow-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colores[estado] || colores.default;
  };

  // 📸 Función para obtener la ruta de la imagen
  const obtenerImagen = (espacio) => {
    // Si tiene imagen en la BD, usarla
    if (espacio.IMAGEN) {
      return `/images/espacios/${espacio.IMAGEN}`;
    }
    // Sino, usar imagen por defecto
    return '/images/espacios/default.png';
  };

  // 📸 Manejar error de carga de imagen
  const handleImageError = (e) => {
    e.target.src = '/images/espacios/default.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando espacios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏢 Espacios Disponibles</h1>
              <p className="text-gray-600 mt-1">Explora todos los espacios físicos disponibles</p>
            </div>
            <div className="flex space-x-3">
              {user?.rolId === 1 && (
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Agregar Recurso</span>
                </button>
              )}
              <button
                onClick={onBack}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-medium transition-colors"
              >
                ← Volver al Dashboard
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los espacios</option>
                {tiposDetectados.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {obtenerIcono(tipo)} {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Mostrando {espaciosFiltrados.length} de {espacios.length} espacios
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Grid de espacios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {espaciosFiltrados.map(espacio => (
            <div key={espacio.RECURSOS_ID} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* 📸 IMAGEN DEL ESPACIO */}
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={obtenerImagen(espacio)} 
                  alt={espacio.NOMBRE}
                  onError={handleImageError}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                {/* Badge de estado sobre la imagen */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${obtenerColorEstado(espacio.ESTADO)}`}>
                    {espacio.ESTADO}
                  </span>
                </div>
                {/* Icono del tipo sobre la imagen */}
                <div className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-lg">
                  <span className="text-2xl">{obtenerIcono(espacio.NOMBRE)}</span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-bold text-lg text-gray-900 truncate" title={espacio.NOMBRE}>
                    {espacio.NOMBRE}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">{detectarTipo(espacio.NOMBRE)}</p>
                </div>

                <div className="space-y-3">
                  {/* Descripción */}
                  {espacio.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {espacio.descripcion}
                    </p>
                  )}

                  {/* ID */}
                  <div className="flex items-center text-sm text-gray-700">
                    <span className="w-4 h-4 mr-2">🆔</span>
                    <span>ID: <strong>{espacio.RECURSOS_ID}</strong></span>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {espacio.ESTADO === 'DISPONIBLE' ? (
                    <button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      onClick={() => {
                        alert(`¿Deseas reservar ${espacio.NOMBRE}? (Funcionalidad por implementar)`);
                      }}
                    >
                      📅 Reservar Espacio
                    </button>
                  ) : (
                    <button 
                      disabled 
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                    >
                      {espacio.ESTADO === 'OCUPADO' ? '🔒 No Disponible' : '🔧 ' + espacio.ESTADO}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay espacios */}
        {espaciosFiltrados.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron espacios
            </h3>
            <p className="text-gray-600">
              {filtroTipo 
                ? `No hay espacios del tipo "${filtroTipo}" disponibles.`
                : 'No hay espacios registrados en el sistema.'
              }
            </p>
            {filtroTipo && (
              <button
                onClick={() => setFiltroTipo('')}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todos los espacios
              </button>
            )}
          </div>
        )}

        {/* Resumen en el footer */}
        {espacios.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumen de Espacios</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{espacios.length}</div>
                <div className="text-sm text-gray-600">Total de Espacios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {espacios.filter(e => e.ESTADO === 'DISPONIBLE').length}
                </div>
                <div className="text-sm text-gray-600">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {espacios.filter(e => e.ESTADO === 'OCUPADO').length}
                </div>
                <div className="text-sm text-gray-600">Ocupados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {espacios.filter(e => e.ESTADO === 'MANTENIMIENTO').length}
                </div>
                <div className="text-sm text-gray-600">En Mantenimiento</div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar recurso */}
        {mostrarFormulario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">➕ Agregar Nuevo Recurso</h3>
                  <button
                    onClick={() => setMostrarFormulario(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={guardarRecurso} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Recurso *
                    </label>
                    <input
                      type="text"
                      name="NOMBRE"
                      value={formularioData.NOMBRE}
                      onChange={handleFormularioChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Aula 101, Laboratorio de Química"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      name="DESCRIPCION"
                      value={formularioData.DESCRIPCION}
                      onChange={handleFormularioChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción del recurso..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="ESTADO"
                      value={formularioData.ESTADO}
                      onChange={handleFormularioChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DISPONIBLE">Disponible</option>
                      <option value="OCUPADO">Ocupado</option>
                      <option value="MANTENIMIENTO">En Mantenimiento</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardandoRecurso}
                      className={`px-4 py-2 rounded-lg text-white ${
                        guardandoRecurso ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {guardandoRecurso ? 'Guardando...' : 'Crear Recurso'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerEspacios;