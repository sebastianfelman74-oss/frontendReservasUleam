import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from './config';

const Notificaciones = ({ notificaciones, noLeidas, marcarTodasLeidas, eliminarNotificacion }) => {
    const [abierto, setAbierto] = useState(false);
    const ref = useRef(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickFuera = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickFuera);
        return () => document.removeEventListener('mousedown', handleClickFuera);
    }, []);

    const getIcono = (tipo) => {
        switch (tipo) {
            case 'nueva_reserva': return '📬';
            case 'confirmada': return '✅';
            case 'cancelada': return '❌';
            default: return '🔔';
        }
    };

    const getTiempo = (fecha) => {
        const diff = Math.floor((new Date() - new Date(fecha)) / 1000);
        if (diff < 60) return 'ahora mismo';
        if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
        return `hace ${Math.floor(diff / 86400)} días`;
    };

    return (
        <div className="relative" ref={ref}>
            {/* Botón campana */}
            <button
                onClick={() => {
                    setAbierto(!abierto);
                    if (!abierto && noLeidas > 0) marcarTodasLeidas();
                }}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
                <span className="text-2xl">🔔</span>
                {noLeidas > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {noLeidas > 9 ? '9+' : noLeidas}
                    </span>
                )}
            </button>

            {/* Panel de notificaciones */}
            {abierto && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
                    <div className="flex justify-between items-center px-4 py-3 border-b">
                        <h3 className="font-bold text-gray-900">🔔 Notificaciones</h3>
                        {notificaciones.length > 0 && (
                            <button
                                onClick={() => {
                                    notificaciones.forEach(n => eliminarNotificacion(n.id));
                                }}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notificaciones.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">🔕</div>
                                <p className="text-sm">No hay notificaciones</p>
                            </div>
                        ) : (
                            notificaciones.map((notif) => (
                                <div key={notif.id}
                                    className={`px-4 py-3 border-b hover:bg-gray-50 flex gap-3 items-start ${!notif.leida ? 'bg-blue-50' : ''}`}>
                                    <span className="text-xl mt-1">{getIcono(notif.tipo)}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{notif.mensaje}</p>
                                        <p className="text-xs text-gray-500">{notif.detalle}</p>
                                        <p className="text-xs text-gray-400 mt-1">{getTiempo(notif.fecha)}</p>
                                    </div>
                                    <button
                                        onClick={() => eliminarNotificacion(notif.id)}
                                        className="text-gray-400 hover:text-red-500 text-xs ml-1"
                                    >✕</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notificaciones;