import React, { useState, useEffect, useCallback } from 'react';
import Login from './Login.jsx';
import Reservar from './reservas.jsx';
import VerEspacios from './verEspacios.jsx';
import GestionReservas from './gestionDeReservas.jsx';
import MisReservas from './MisReservas.jsx'; // para ver las reservas del usuario 
import Reportes from './Reportes.jsx';
import GestionBloqueos from './GestionBloqueos.jsx';
import useNotificaciones from './useNotificaciones';
import Notificaciones from './Notificaciones.jsx';

const UleamReservas = () => {
  const [activeReservas, setActiveReservas] = useState(0);
  const [availableSpaces, setAvailableSpaces] = useState(0);
  const [todayReservas, setTodayReservas] = useState(0);


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showReservar, setShowReservar] = useState(false);
  const [showEspacios, setShowEspacios] = useState(false);
  const [showAgregarRecurso, setShowAgregarRecurso] = useState(false);
  const [showGestionReservas, setShowGestionReservas] = useState(false); // Para acceptar o rechazar reservas
  const [showMisReservas, setShowMisReservas] = useState(false); // Para ver las reservas del usuario
  const [showReportes, setShowReportes] = useState(false);
  const [showBloqueos, setShowBloqueos] = useState(false);
  const { notificaciones, noLeidas, marcarTodasLeidas, eliminarNotificacion } = useNotificaciones(user); // Hook personalizado para notificaciones

  const [recentReservas, setRecentReservas] = useState([]);
  const [loadingReservas, setLoadingReservas] = useState(false);


  // Cargar reservas y estadísticas cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      cargarReservasYEstadisticas();
    }
  }, [isAuthenticated]);


  const cargarReservasYEstadisticas = async () => {
    setLoadingReservas(true);
    try {
      // Cargar reservas
      const reservasResponse = await fetch(`http://${API_URL}/reserva`, {
        credentials: 'include'
      });

      if (reservasResponse.ok) {
        const reservasData = await reservasResponse.json();

        // Tomar solo las 3 más recientes
        setRecentReservas(reservasData.slice(0, 3));

        // Calcular estadísticas
        const hoy = new Date().toISOString().split('T')[0];
        const reservasHoy = reservasData.filter(r =>
          r.FECHA_INICIO?.startsWith(hoy)
        ).length;

        const reservasActivas = reservasData.filter(r =>
          r.ESTADO === 'CONFIRMADA' || r.ESTADO === 'PENDIENTE'
        ).length;

        setTodayReservas(reservasHoy);
        setActiveReservas(reservasActivas);
      }

      // Cargar espacios disponibles
      const espaciosResponse = await fetch(`http://${API_URL}/recurso`, {
        credentials: 'include'
      });

      if (espaciosResponse.ok) {
        const espaciosData = await espaciosResponse.json();
        setAvailableSpaces(espaciosData.length);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoadingReservas(false);
    }
  };

  const spaceTypes = [
    {
      id: 'aulas',
      name: 'Aulas',
      description: 'Aulas para clases y conferencias',
      icon: '🏛️',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'laboratorios',
      name: 'Laboratorios',
      description: 'Laboratorios especializados',
      icon: '🧪',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'canchas',
      name: 'Canchas',
      description: 'Canchas deportivas',
      icon: '⚽',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'auditorios',
      name: 'Auditorios',
      description: 'Auditorios para eventos',
      icon: '🎤',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData.usuario);
  };

  const handleLogout = () => {
    console.log('🔄 Cerrando sesión...');

    // Limpiar estados de React
    setIsAuthenticated(false);
    setUser(null);

    // Limpiar todo el almacenamiento local
    localStorage.clear();
    sessionStorage.clear();

    // Llamada al servidor en segundo plano (opcional)
    fetch(`http://${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).catch(() => { });

    console.log('✅ Sesión cerrada correctamente');
  };

  const volverAlDashboard = () => {
    setShowReservar(false);
    setShowEspacios(false);
    setShowAgregarRecurso(false);
    setShowGestionReservas(false);
    setShowMisReservas(false);
    setShowReportes(false);
    setShowBloqueos(false);
  };

  // ✅ Verificar si el usuario es administrador
  // IMPORTANTE: Cambia 'rolId' por el nombre correcto del campo en tu objeto user
  const esAdmin = user?.rolId === 1;

  // Si el usuario no está autenticado
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Si estamos en modo "Hacer Reserva"
  if (showReservar) {
    return <Reservar onBack={volverAlDashboard} user={user} />;
  }
  // ✅ AGREGAR ESTE BLOQUE
  if (showMisReservas) {
    return <MisReservas onBack={volverAlDashboard} user={user} />;
  }

  // Si estamos en modo "Ver Espacios"
  if (showEspacios) {
    return (
      <VerEspacios
        onBack={volverAlDashboard}
        user={user}
        onAgregarRecurso={() => setShowAgregarRecurso(true)}
      />
    );
  }


  // ✅ NUEVO: Si estamos en modo "Gestión de Reservas" (solo admin)
  if (showGestionReservas) {
    return <GestionReservas onBack={volverAlDashboard} user={user} />;
  }

  if (showReportes) {
    return <Reportes onBack={volverAlDashboard} user={user} />;
  }

  if (showBloqueos) {
    return <GestionBloqueos onBack={volverAlDashboard} user={user} />;
  }

  // Vista principal (dashboard)
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-blue-600">
                🏛️ ULEAM Reservas
              </div>
            </div>
            <nav className="flex space-x-8 items-center">
              <a href="#" className="text-gray-900 hover:text-blue-600 font-medium">Inicio</a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowReservar(true);
                }}
                className="text-gray-500 hover:text-blue-600"
              >
                Reservar
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowEspacios(true);
                }}
                className="text-gray-500 hover:text-blue-600"
              >
                Espacios
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowMisReservas(true); // Regresar al dashboard principal
                }}
                className="text-gray-500 hover:text-blue-600"
              >
                Mis Reservas
              </a>

              {/* ✅ NUEVO: Botón de Gestión solo visible para admins */}
              {esAdmin && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowGestionReservas(true);
                  }}
                  className="text-gray-500 hover:text-blue-600 font-medium"
                >
                  🛡️ Gestión
                </a>
              )}
              {esAdmin && (
                <a href="#" onClick={(e) => { e.preventDefault(); setShowReportes(true); }}
                  className="text-gray-500 hover:text-blue-600 font-medium">
                  📊 Reportes
                </a>
              )}
              {esAdmin && (
                <a href="#" onClick={(e) => { e.preventDefault(); setShowBloqueos(true); }}
                  className="text-gray-500 hover:text-blue-600 font-medium">
                  🔒 Bloqueos
                </a>
              )}

              <div className="flex items-center space-x-4">
                <Notificaciones
                  notificaciones={notificaciones}
                  noLeidas={noLeidas}
                  marcarTodasLeidas={marcarTodasLeidas}
                  eliminarNotificacion={eliminarNotificacion}
                />
                <span className="text-gray-700">
                  Hola, {user?.nombre} {esAdmin && <span className="text-yellow-600 font-semibold">(Admin)</span>}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bienvenido, {user?.nombre}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Sistema de Reservas ULEAM - Reserva espacios físicos de manera fácil y eficiente.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowReservar(true)}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                📅 Hacer Reserva
              </button>
              <button
                onClick={() => setShowEspacios(true)}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                🏛️ Ver Espacios
              </button>

              {/* ✅ NUEVO: Botón de Gestión de Reservas solo para admins */}
              {esAdmin && (
                <button
                  onClick={() => setShowGestionReservas(true)}
                  className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                >
                  🛡️ Gestionar Reservas
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              🏛️
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{availableSpaces}</div>
            <div className="text-gray-600">Espacios Disponibles</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📅
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{activeReservas}</div>
            <div className="text-gray-600">Reservas Activas</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              ⏰
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{todayReservas}</div>
            <div className="text-gray-600">Reservas Hoy</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tipos de Espacios</h2>
          <p className="text-xl text-gray-600">
            Tenemos diferentes tipos de espacios disponibles para satisfacer todas tus necesidades
            académicas y deportivas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {spaceTypes.map((type) => (
            <div key={type.id} className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border ${type.borderColor}`}>
              <div className={`w-16 h-16 ${type.lightColor} rounded-full flex items-center justify-center mx-auto mb-4 text-3xl`}>
                {type.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{type.name}</h3>
              <p className="text-gray-600 text-center mb-4">{type.description}</p>
              <button
                onClick={() => setShowEspacios(true)}
                className={`w-full ${type.color} text-white py-2 rounded-lg hover:opacity-90 transition-opacity`}
              >
                Ver {type.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Reservas Recientes</h2>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Ver Todas →
          </button>
        </div>

        {loadingReservas ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando reservas...</p>
          </div>
        ) : recentReservas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay reservas recientes
            </h3>
            <p className="text-gray-600 mb-4">
              Aún no has realizado ninguna reserva
            </p>
            <button
              onClick={() => setShowReservar(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Hacer tu primera reserva
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReservas.map((reserva) => (
              <div key={reserva.RESERVAS_ID} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {reserva.RECURSO_NOMBRE || 'Recurso'}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reserva.ESTADO)}`}>
                    {reserva.ESTADO}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📅</span>
                    <span>{new Date(reserva.FECHA_INICIO).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>⏰</span>
                    <span>
                      {new Date(reserva.FECHA_INICIO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {' '}
                      {new Date(reserva.FECHA_FIN).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>👤</span>
                    <span>{reserva.USUARIO_NOMBRE || 'Usuario'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-900 font-medium">
                    ID Reserva: #{reserva.RESERVAS_ID}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para hacer tu reserva?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Reserva el espacio que necesitas de manera rápida y sencilla. Nuestro
            sistema está disponible 24/7.
          </p>
          <button
            onClick={() => setShowReservar(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Hacer Reserva Ahora
          </button>
        </div>
      </div>

      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-2xl font-bold text-blue-400 mb-4">
                🏛️ ULEAM Reservas
              </div>
              <p className="text-gray-400">
                Sistema de reservas de espacios físicos de la
                Universidad Laica Eloy Alfaro de Manabí Extensión El Carmen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <div className="space-y-2 text-gray-400">
                <div className="cursor-pointer hover:text-white" onClick={() => setShowReservar(true)}>
                  Hacer Reserva
                </div>
                <div className="cursor-pointer hover:text-white" onClick={() => setShowEspacios(true)}>
                  Ver Espacios
                </div>
                <div className="cursor-pointer hover:text-white" onClick={() => setShowMisReservas(true)}>
                  Mis Reservas
                </div>
                {esAdmin && (
                  <div className="cursor-pointer hover:text-white" onClick={() => setShowGestionReservas(true)}>
                    Gestión de Reservas
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  📞 +593 xxx-xxx-xxxx
                </div>
                <div className="flex items-center gap-2">
                  📧 reservas@uleam.edu.ec
                </div>
                <div className="flex items-center gap-2">
                  📍 El Carmen, Manabí, Ecuador
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 ULEAM. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UleamReservas;