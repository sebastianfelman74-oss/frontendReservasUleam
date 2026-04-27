import React, { useState, useEffect } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 5000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.correo || !formData.contrasena) {
      showAlert('Por favor, completa todos los campos', 'error');
      return;
    }

    setLoading(true);

    try {
      // URL directa y simple
      const response = await fetch('http://${API_URL}/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          CORREO: formData.correo,
          CONTRASENA: formData.contrasena
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      setLoading(false);

      if (data.usuario) {
        showAlert(`¡Bienvenido ${data.usuario.nombre}!`, 'success');
        
        setTimeout(() => {
          onLoginSuccess(data);
        }, 1500);
      } else {
        showAlert(data.mensaje || 'Error en las credenciales', 'error');
      }
      
    } catch (error) {
      setLoading(false);
      console.error('Error completo:', error);
      
      if (error.message.includes('Failed to fetch')) {
        showAlert('No se puede conectar al servidor en http://${API_URL}', 'error');
      } else if (error.message.includes('NetworkError')) {
        showAlert('Error de red. Verifica tu conexión.', 'error');
      } else if (error.message.includes('HTTP error')) {
        showAlert(`Error del servidor: ${error.message}`, 'error');
      } else {
        showAlert(`Error: ${error.message}`, 'error');
      }
    }
  };

  // Verificar sesión al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const response = await fetch('http://${API_URL}/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Sesión existente:', data);
          onLoginSuccess(data);
        } else {
          console.log('No hay sesión activa');
        }
      } catch (error) {
        console.log('Error verificando sesión:', error.message);
      }
    };

    verificarSesion();
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-3xl font-bold text-white mb-2">ULEAM Reservas</h2>
          <p className="text-blue-100">Sistema de Reservas de Espacios</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Iniciar Sesión</h3>
            <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>

        

          {/* Alerta */}
          {alert.show && (
            <div className={`p-4 rounded-lg ${
              alert.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {alert.message}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Verificando credenciales...</p>
            </div>
          )}

          {/* Formulario de login */}
          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="usuario@uleam.edu.ec"
                />
              </div>

              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="********"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                Iniciar Sesión
              </button>
            </form>
          )}

          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-center text-blue-100 text-sm">
          <p>© 2025 Universidad Laica Eloy Alfaro de Manabí</p>
          <p>Sistema de Reservas de Espacios Físicos</p>
        </div>
      </div>
    </div>
  );
};

export default Login;