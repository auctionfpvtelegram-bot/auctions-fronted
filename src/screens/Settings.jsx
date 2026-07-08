import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';

function Settings({ setCurrentScreen, currentUser, setAlertData }) {
  const [notifyNewLots, setNotifyNewLots] = useState(true);
  const [notifyBids, setNotifyBids] = useState(true);
  const [notifyEnding, setNotifyEnding] = useState(true);
  
  const [newName, setNewName] = useState(currentUser?.customName || currentUser?.username || '');
  const [newAvatar, setNewAvatar] = useState(currentUser?.avatarUrl || null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [localProfileStatus, setLocalProfileStatus] = useState(currentUser?.profileStatus || 'APPROVED');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setLocalProfileStatus(currentUser.profileStatus || 'APPROVED');
      setNewName(currentUser.customName || currentUser.username || '');
      setNewAvatar(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  const isModeration = localProfileStatus === 'MODERATION';
  const isRejected = localProfileStatus === 'REJECTED';

  // ⚡ ВСТРОЕННЫЙ КОМПРЕССОР ИЗОБРАЖЕНИЙ (Убирает тормоза и ошибки отправки)
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400; // Идеальный размер для аватарки
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Сжимаем в легкий JPEG
        callback(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsImageLoading(true);
      compressImage(file, (compressedDataUrl) => {
        setNewAvatar(compressedDataUrl);
        setHasChanges(true);
        setIsImageLoading(false);
      });
    }
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    setIsSubmitting(true);
    fetch(`${API_URL}/api/users/${currentUser.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customName: newName, avatarUrl: newAvatar })
    })
      .then(async res => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Ошибка сохранения');
        
        setLocalProfileStatus('MODERATION');
        if (setAlertData) {
          setAlertData({ message: '✅ Данные успешно отправлены на модерацию!', onClose: () => {} });
        }
        setHasChanges(false);
        setIsSubmitting(false);
      })
      .catch(err => {
        if (setAlertData) {
          setAlertData({ message: `⚠️ ${err.message}`, onClose: () => {} });
        }
        setIsSubmitting(false);
      });
  };

  // ⚡ УМНАЯ ФУНКЦИЯ ДЛЯ ОТОБРАЖЕНИЯ АВАТАРКИ
  // Понимает и обычные ссылки (http/data), и file_id из Telegram
  const getAvatarSrc = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:')) {
      return avatarUrl;
    }
    // Если это file_id из Telegram — используем наш эндпоинт-переходник
    return `${API_URL}/api/image/${avatarUrl}`;
  };

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Настройки</h2>
      </div>

      {/* 👤 БЛОК ПРОФИЛЯ */}
      <div style={{ background: '#fff', margin: '16px', borderRadius: '16px', padding: '24px 16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        
        {/* Аватарка */}
        <div style={{ position: 'relative', marginBottom: '20px', width: '90px', height: '90px' }}>
          {isImageLoading ? (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #f3f3f3', borderTop: '3px solid #1976d2', animation: 'spin 1s linear infinite', boxSizing: 'border-box' }} />
          ) : newAvatar ? (
            <img 
              src={getAvatarSrc(newAvatar)} 
              alt="avatar" 
              style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1976d2', opacity: isModeration ? 0.7 : 1 }} 
            />
          ) : (
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', opacity: isModeration ? 0.7 : 1 }}>👤</div>
          )}
          
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} />
          
          {/* Карандаш скрыт во время модерации */}
          {!isImageLoading && !isModeration && (
            <button 
              onClick={() => fileInputRef.current.click()} 
              style={{ position: 'absolute', bottom: '0px', right: '0px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', zIndex: 10 }}
            >
              ✏️
            </button>
          )}
        </div>

        {/* Имя пользователя (Блокируется во время модерации) */}
        <div style={{ width: '100%', maxWidth: '240px', position: 'relative' }}>
          <input 
            type="text" 
            value={newName} 
            onChange={handleNameChange}
            placeholder="Ваш никнейм"
            disabled={isModeration}
            style={{ width: '100%', height: '44px', border: '1px solid #ddd', borderRadius: '12px', padding: isModeration ? '0 16px' : '0 36px 0 16px', outline: 'none', fontSize: '16px', textAlign: 'center', boxSizing: 'border-box', fontWeight: 'bold', color: isModeration ? '#666' : '#111', background: isModeration ? '#f5f5f5' : '#fff' }}
          />
          {!isModeration && (
            <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px', color: '#999', pointerEvents: 'none' }}>✏️</span>
          )}
        </div>

        {/* ⚡ БЛОКИРОВКА И ИНФОРМАЦИЯ О МОДЕРАЦИИ */}
        {isModeration && !hasChanges && (
          <div style={{ marginTop: '16px', background: '#fff3e0', border: '1px solid #ffe0b2', padding: '12px', borderRadius: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>⏳</div>
            <div style={{ fontSize: '13px', color: '#e65100', fontWeight: 'bold', marginBottom: '4px' }}>Профиль отправлен на модерацию</div>
            <div style={{ fontSize: '11px', color: '#f57c00' }}>До вынесения решения вносить изменения, делать ставки и выставлять лоты — нельзя.</div>
          </div>
        )}

        {isRejected && !hasChanges && (
          <div style={{ marginTop: '16px', background: '#ffebee', border: '1px solid #ffcdd2', padding: '12px', borderRadius: '12px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '13px', color: '#c62828', fontWeight: 'bold', marginBottom: '4px' }}>🚫 Профиль отклонен</div>
            <div style={{ fontSize: '11px', color: '#d32f2f' }}>Причина: {currentUser?.profileRejectReason || 'Нарушение правил'}</div>
            <div style={{ fontSize: '11px', color: '#d32f2f', marginTop: '4px' }}>Вы можете загрузить новые данные и отправить повторно.</div>
          </div>
        )}

        {/* Кнопка отправки */}
        {hasChanges && !isModeration && (
          <button 
            onClick={handleSaveProfile}
            disabled={isSubmitting}
            style={{ marginTop: '20px', width: '100%', maxWidth: '240px', height: '44px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)' }}
          >
            {isSubmitting ? 'Отправка...' : 'Отправить на проверку'}
          </button>
        )}
      </div>

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

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Settings;