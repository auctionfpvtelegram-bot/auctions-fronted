import React, { useState, useRef } from 'react';
import { API_URL } from '../config';

function Settings({ setCurrentScreen, currentUser, setAlertData }) {
  // Тумблеры уведомлений
  const [notifyNewLots, setNotifyNewLots] = useState(true);
  const [notifyBids, setNotifyBids] = useState(true);
  const [notifyEnding, setNotifyEnding] = useState(true);

  // Стейты для редактирования профиля
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser?.customName || currentUser?.username || '');
  const fileInputRef = useRef(null);

  const isModeration = currentUser?.profileStatus === 'MODERATION';
  const isRejected = currentUser?.profileStatus === 'REJECTED';

  // Функция отправки данных на сервер
  const updateProfile = (data) => {
    fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(async res => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка сохранения');
      
      if (setAlertData) {
        setAlertData({ message: '⏳ Данные отправлены на модерацию!', onClose: () => {} });
      }
      setIsEditingName(false);
    })
    .catch(err => {
      // ⚡ Тут вылезут наши баннеры про "3 дня" или "Активный лот"
      if (setAlertData) {
        setAlertData({ message: `⚠️ ${err.message}`, onClose: () => {} });
      }
    });
  };

  // Обработка выбора аватарки
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateProfile({ avatarUrl: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  // Сохранение ника
  const handleSaveName = () => {
    if (!newName.trim() || newName === (currentUser?.customName || currentUser?.username)) {
      setIsEditingName(false);
      return;
    }
    updateProfile({ customName: newName });
  };

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Настройки</h2>
      </div>

      {/* 👤 БЛОК ПРОФИЛЯ В НАСТРОЙКАХ */}
      <div style={{ background: '#fff', margin: '16px', borderRadius: '16px', padding: '16px', border: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        
        {/* Аватарка */}
        <div style={{ position: 'relative' }}>
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
          )}
          
          {/* Скрытый инпут для фото */}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
          
          {/* Карандаш на аватарке */}
          <button 
            onClick={() => fileInputRef.current.click()} 
            style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
          >
            ✏️
          </button>
        </div>

        {/* Имя и статус */}
        <div style={{ flex: 1 }}>
          {isEditingName ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 1, height: '36px', border: '1px solid #1976d2', borderRadius: '8px', padding: '0 8px', outline: 'none', fontSize: '15px' }}
                autoFocus
              />
              <button onClick={handleSaveName} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', height: '36px', padding: '0 12px', fontWeight: 'bold' }}>✓</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111' }}>
                {currentUser?.customName || currentUser?.username || 'Без имени'}
              </h3>
              <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0 }}>
                ✏️
              </button>
            </div>
          )}

          {/* Статус модерации профиля */}
          {isModeration && (
            <div style={{ fontSize: '12px', color: '#f57c00', fontWeight: 'bold', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>⏳ На проверке (ограничения активны)</span>
            </div>
          )}
          {isRejected && (
            <div style={{ fontSize: '12px', color: '#c62828', fontWeight: 'bold', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🚫 Профиль отклонен: {currentUser?.profileRejectReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* ⚙️ БЛОК УВЕДОМЛЕНИЙ */}
      <div className="settings-list" style={{ marginTop: '20px' }}>
        <div className="setting-card">
          <p className="setting-title">Уведомления об отправке на модерацию / публикации</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifyNewLots} onChange={(e) => setNotifyNewLots(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-card">
          <p className="setting-title">Уведомления о том, что ставку перебили</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifyBids} onChange={(e) => setNotifyBids(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-card">
          <p className="setting-title">Уведомления о победе / завершении торгов</p>
          <label className="toggle-switch">
            <input type="checkbox" checked={notifyEnding} onChange={(e) => setNotifyEnding(e.target.checked)} />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Settings;