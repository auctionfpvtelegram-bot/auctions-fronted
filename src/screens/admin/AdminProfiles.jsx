import React, { useState, useEffect } from 'react';

export function AdminProfiles({ setAdminScreen, API_URL, setAlertData }) {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfiles = () => {
    setIsLoading(true);
    fetch(`${API_URL}/api/admin/profiles`)
      .then(res => res.json())
      .then(data => setProfiles(Array.isArray(data) ? data : []))
      .catch(() => setAlertData({ message: '❌ Ошибка загрузки профилей', onClose: () => {} }))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleUpdateStatus = (id, status) => {
    let rejectReason = '';
    
    // Если отклоняем, запрашиваем причину
    if (status === 'REJECTED') {
      rejectReason = prompt('Укажите причину отклонения никнейма/аватарки:');
      if (!rejectReason) return; 
    }

    fetch(`${API_URL}/api/admin/profiles/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectReason })
    })
    .then(res => res.json())
    .then(() => {
      setAlertData({ 
        message: status === 'APPROVED' ? '✅ Профиль успешно одобрен!' : '🚫 Профиль отклонен!', 
        onClose: () => {} 
      });
      // Убираем проверенный профиль из списка
      setProfiles(prev => prev.filter(p => p.id !== id));
    })
    .catch(() => setAlertData({ message: '❌ Ошибка на сервере при обновлении статуса', onClose: () => {} }));
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', marginBottom: '16px', cursor: 'pointer' }}>← В меню</button>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>👤 Модерация профилей</h3>

      {isLoading ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '20px' }}>Загрузка профилей...</p>
      ) : profiles.length === 0 ? (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #eee' }}>
          <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>🎉</span>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Очередь чиста! Нет профилей на проверке.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {profiles.map(p => (
            <div key={p.id} style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
                
                {/* Отображение аватарки */}
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                )}
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>ID: {p.id}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#111' }}>{p.customName || p.username || 'Без имени'}</div>
                  <div style={{ fontSize: '11px', color: '#f57c00', marginTop: '4px', fontWeight: '700', background: '#fff3e0', display: 'inline-block', padding: '4px 8px', borderRadius: '8px' }}>ОЖИДАЕТ ПРОВЕРКИ</div>
                </div>
              </div>

              {/* Кнопки действий */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleUpdateStatus(p.id, 'APPROVED')} style={{ flex: 1, height: '40px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Одобрить</button>
                <button onClick={() => handleUpdateStatus(p.id, 'REJECTED')} style={{ flex: 1, height: '40px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Отклонить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}