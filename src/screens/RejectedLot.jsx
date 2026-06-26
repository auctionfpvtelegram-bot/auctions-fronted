import React from 'react';

function RejectedLot({ setCurrentScreen, selectedLot }) {
  return (
    <div className="app-container">
      <div className="screen-header"><button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button><h2 className="screen-title">Детали лота</h2></div>
      <div className="lot-details-header"><span className="status-badge-large rejected">Отклоненный лот</span></div>
      <div className="alert-box"><div className="alert-header"><span>⚠️</span> Причина отклонения:</div><p className="alert-text">{selectedLot?.rejectReason || 'Нарушение правил размещения. Модератор не одобрил публикацию.'}</p></div>
    </div>
  );
}

export default RejectedLot;