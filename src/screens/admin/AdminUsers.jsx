import React, { useState } from 'react';

export function AdminUsers({ setAdminScreen, API_URL, setAlertData }) {
  const [banUserId, setBanUserId] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banScope, setBanScope] = useState('ALL'); // ALL | LOTS | BIDS
  const [banDays, setBanDays] = useState('7');

  const handleBanAction = (isBannedAction) => {
    if (!banUserId.trim()) {
      return setAlertData({ message: '⚠️ Введите ID пользователя', onClose: () => {} });
    }
    if (isBannedAction && !banReason.trim()) {
      return setAlertData({ message: '⚠️ Укажите причину блокировки', onClose: () => {} });
    }

    fetch(`${API_URL}/api/admin/users/${banUserId.trim()}/ban`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isBanned: isBannedAction,
        banReason: isBannedAction ? banReason : '',
        banScope: isBannedAction ? banScope : 'ALL',
        banDays: isBannedAction ? parseInt(banDays, 10) : 0
      })
    })
    .then(res => res.json())
    .then(() => {
      setAlertData({ 
        message: isBannedAction 
          ? `🚫 Пользователь ${banUserId} успешно ограничен (${banScope})!` 
          : `✅ Все ограничения с пользователя ${banUserId} сняты!`, 
        onClose: () => {
          if (!isBannedAction) {
            setBanUserId('');
            setBanReason('');
          }
        } 
      });
    })
    .catch(() => setAlertData({ message: '❌ Ошибка выполнения операции на сервере', onClose: () => {} }));
  };

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh', boxSizing: 'border-box' }}>
      <button onClick={() => setAdminScreen('dashboard')} style={{ background: 'none', border: 'none', color: '#1976d2', fontWeight: 'bold', marginBottom: '16px', cursor: 'pointer' }}>← В меню</button>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🚫 Блокировка пользователей</h3>

      <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #eee' }}>
        <input type="text" value={banUserId} onChange={(e) => setBanUserId(e.target.value)} placeholder="Вставьте Telegram ID пользователя..." style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', marginBottom: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        <input type="text" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Причина (выведется пользователю)..." style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', marginBottom: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <select value={banScope} onChange={(e) => setBanScope(e.target.value)} style={{ flex: 1, height: '38px', border: '1px solid #ddd', borderRadius: '8px', padding: '0 6px', fontSize: '13px', outline: 'none', background: '#fff' }}>
            <option value="ALL">Полный бан аккаунта</option>
            <option value="LOTS">Запретить выставлять лоты</option>
            <option value="BIDS">Запретить делать ставки</option>
          </select>

          <select value={banDays} onChange={(e) => setBanDays(e.target.value)} style={{ width: '100px', height: '38px', border: '1px solid #ddd', borderRadius: '8px', padding: '0 6px', fontSize: '13px', outline: 'none', background: '#fff' }}>
            <option value="1">1 день</option>
            <option value="3">3 дня</option>
            <option value="7">7 дней</option>
            <option value="30">30 дней</option>
            <option value="365">1 год</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => handleBanAction(true)} style={{ flex: 1, height: '38px', background: '#c62828', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Применить ограничения</button>
          <button onClick={() => handleBanAction(false)} style={{ width: '120px', height: '38px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Разлочить</button>
        </div>
      </div>
    </div>
  );
}