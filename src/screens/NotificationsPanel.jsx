import React from 'react';
import { API_URL } from '../config';

function NotificationsPanel({ notifications, onClose, onRead, userId }) {
  const handleRead = () => {
    fetch(`${API_URL}/api/users/${userId}/notifications/read`, { method: 'PATCH' });
    onRead(); 
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000, background: 'rgba(0,0,0,0.4)', alignItems: 'flex-start', paddingTop: '60px' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxHeight: '80vh', overflowY: 'auto', borderRadius: '16px', padding: '20px', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Уведомления</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#888', cursor: 'pointer', lineHeight: '1' }}>×</button>
        </div>
        
        {notifications.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px 0' }}>У вас пока нет уведомлений 🔕</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ padding: '12px', background: n.isRead ? '#f5f5f5' : '#e3f2fd', borderLeft: n.isRead ? 'none' : '4px solid #1976d2', borderRadius: '8px', marginBottom: '8px' }}>
              <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#111' }}>{n.text}</p>
              <span style={{ fontSize: '11px', color: '#888' }}>
                {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {new Date(n.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          ))
        )}
        
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleRead} style={{ width: '100%', padding: '12px', background: '#e0e0e0', border: 'none', borderRadius: '8px', marginTop: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
            Прочитать всё
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;