import React, { useState } from 'react';
import { API_URL } from '../config';
import { EditLotModal } from './EditLotModal'; 

function RejectedLot({ setCurrentScreen, currentUser, lot, setAlertData }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px' }}>
      
      <div className="lot-details-header" style={{ marginBottom: '16px', marginTop: '12px' }}>
        <span className="status-badge-large rejected" style={{ background: '#ffebee', color: '#c62828', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', border: '1px solid #ef9a9a' }}>
          ❌ Отклоненный лот
        </span>
      </div>
      
      <div className="alert-box" style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div className="alert-header" style={{ fontWeight: 'bold', color: '#c53030', fontSize: '15px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⚠️</span> Причина отклонения:
        </div>
        <p className="alert-text" style={{ margin: 0, fontSize: '14px', color: '#9b2c2c', lineHeight: '1.5' }}>
          {lot?.rejectReason || 'Нарушение правил размещения. Модератор не одобрил публикацию этого лота.'}
        </p>
      </div>

      {/* Кнопка редактирования лота */}
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setIsEditModalOpen(true)} 
          style={{ width: '100%', height: '48px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(25, 118, 210, 0.3)' }}
        >
          ✏️ Редактировать и отправить заново
        </button>
      </div>

      {/* Всплывающая форма редактирования лота */}
      <EditLotModal 
        lot={lot}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        API_URL={API_URL}
        currentUser={currentUser}
        onUpdateSuccess={(updatedLot) => {
          setIsEditModalOpen(false);
          setAlertData({ message: '✅ Изменения сохранены! Лот отправлен на повторную модерацию.' });
          setCurrentScreen('profile');
        }}
      />

    </div>
  );
}

export default RejectedLot;