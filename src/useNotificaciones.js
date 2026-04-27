import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const useNotificaciones = (user) => {
    const [socket, setSocket] = useState(null);
    const [notificaciones, setNotificaciones] = useState([]);
    const [noLeidas, setNoLeidas] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Conectar al servidor
        const newSocket = io(API_URL, {
            withCredentials: true
        
        });
        
        setSocket(newSocket);

        // Unirse a sala personal
        newSocket.emit('unirse', user.id);

        // Si es admin, unirse a sala de admins
        if (user.rolId === 1) {
            newSocket.emit('unirse_admin');
        }

        // Escuchar nueva reserva (solo admin)
        newSocket.on('nueva_reserva', (data) => {
            const nuevaNotif = {
                id: Date.now(),
                mensaje: data.mensaje,
                detalle: `Solicitado por: ${data.usuario}`,
                tipo: 'nueva_reserva',
                leida: false,
                fecha: new Date()
            };
            setNotificaciones(prev => [nuevaNotif, ...prev]);
            setNoLeidas(prev => prev + 1);
        });

        // Escuchar cambio de estado de reserva
        newSocket.on('reserva_actualizada', (data) => {
            const nuevaNotif = {
                id: Date.now(),
                mensaje: data.mensaje,
                detalle: `Estado: ${data.nuevoEstado}`,
                tipo: data.nuevoEstado === 'CONFIRMADA' ? 'confirmada' : 'cancelada',
                leida: false,
                fecha: new Date()
            };
            setNotificaciones(prev => [nuevaNotif, ...prev]);
            setNoLeidas(prev => prev + 1);
        });

        // Limpiar al desmontar
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    const marcarTodasLeidas = () => {
        setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
        setNoLeidas(0);
    };

    const eliminarNotificacion = (id) => {
        setNotificaciones(prev => {
            const notif = prev.find(n => n.id === id);
            if (notif && !notif.leida) setNoLeidas(c => Math.max(0, c - 1));
            return prev.filter(n => n.id !== id);
        });
    };

    return { notificaciones, noLeidas, marcarTodasLeidas, eliminarNotificacion };
};

export default useNotificaciones;