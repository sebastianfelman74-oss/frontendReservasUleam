import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Reportes = ({ onBack, user }) => {
  const [porEspacio, setPorEspacio] = useState([]);
  const [porMes, setPorMes] = useState([]);
  const [masUsados, setMasUsados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    setLoading(true);
    setError(null);
    try {
      const [espacioRes, mesRes, usadosRes] = await Promise.all([
        fetch('http://${API_URL}/reportes/por-espacio', { credentials: 'include' }),
        fetch('http://${API_URL}/reportes/por-mes', { credentials: 'include' }),
        fetch('http://${API_URL}/reportes/espacios-mas-usados', { credentials: 'include' })
      ]);

      if (!espacioRes.ok || !mesRes.ok || !usadosRes.ok) {
        throw new Error('Error al obtener los reportes');
      }

      const [espacioData, mesData, usadosData] = await Promise.all([
        espacioRes.json(),
        mesRes.json(),
        usadosRes.json()
      ]);

      setPorEspacio(espacioData);
      setPorMes(mesData);
      setMasUsados(usadosData);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
      setError('No se pudieron cargar los reportes. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={cargarReportes}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
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
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-blue-600 flex items-center gap-2"
              >
                ← Volver
              </button>
              <h1 className="text-xl font-bold text-gray-900">📊 Reportes Estadísticos</h1>
            </div>
            <span className="text-gray-600">
              Hola, {user?.nombre} <span className="text-yellow-600 font-semibold">(Admin)</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* GRÁFICA 1 - Reservas por espacio */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Total de Reservas por Espacio</h2>
          {porEspacio.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={porEspacio} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="espacio" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmadas" name="Confirmadas" fill="#10B981" />
                <Bar dataKey="pendientes" name="Pendientes" fill="#F59E0B" />
                <Bar dataKey="canceladas" name="Canceladas" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* GRÁFICA 2 - Reservas por mes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Reservas por Mes</h2>
          {porMes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={porMes} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes_nombre" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" name="Total" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="confirmadas" name="Confirmadas" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="canceladas" name="Canceladas" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* GRÁFICA 3 - Espacios más usados */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🏆 Top 5 Espacios Más Usados</h2>
          {masUsados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={masUsados}
                    dataKey="total_reservas"
                    nameKey="espacio"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ espacio, percent }) => `${espacio} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {masUsados.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Tabla resumen */}
              <div className="w-full md:w-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-8 text-gray-600">Espacio</th>
                      <th className="text-right py-2 text-gray-600">Reservas</th>
                      <th className="text-right py-2 pl-8 text-gray-600">Confirmadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masUsados.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-8 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          {item.espacio}
                        </td>
                        <td className="py-2 text-right font-semibold">{item.total_reservas}</td>
                        <td className="py-2 pl-8 text-right text-green-600 font-semibold">{item.confirmadas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reportes;