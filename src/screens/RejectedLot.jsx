import React, { useState } from 'react';
import { API_URL } from '../config';
import { EditLotModal } from './EditLotModal'; // Подключаем форму редактирования

function RejectedLot({ setCurrentScreen, currentUser, lot, setAlertData }) {
  // Стейт для открытия модалки редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Детали лота</h2>
      </div>
      
      <div className="lot-details-header">
        <span className="status-badge-large rejected">Отклоненный лот</span>
      </div>
      
      <div className="alert-box">
        <div className="alert-header"><span>⚠️</span> Причина отклонения:</div>
        {/* ⚡ Теперь данные берутся из корректного пропа lot */}
        <p className="alert-text">{lot?.rejectReason || 'Нарушение правил размещения. Модератор не одобрил публикацию.'}</p>
      </div>

      {/* ⚡ Кнопка редактирования лота */}
      <div style={{ padding: '0 16px', marginTop: '20px' }}>
        <button 
          onClick={() => setIsEditModalOpen(true)} 
          style={{ width: '100%', height: '48px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)' }}
        >
          ✏️ Редактировать лот
        </button>
      </div>

      {/* ⚡ Всплывающая форма редактирования лота */}
      <EditLotModal 
        lot={lot}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        API_URL={API_URL}
        currentUser={currentUser}
        onUpdateSuccess={(updatedLot) => {
          if (setAlertData) {
            setAlertData({ message: '🔄 Лот успешно исправлен и отправлен на повторную модерацию!', onClose: () => {} });
          }
          setCurrentScreen('profile'); // Возвращаем в профиль
        }}
      />
    </div>
  );
}

export default RejectedLot;