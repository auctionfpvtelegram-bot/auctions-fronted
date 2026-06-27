import React from 'react';

function CompletedLot({ setCurrentScreen, selectedLot, currentUser, isFavorite, toggleFavorite, handleOpenPublicProfile }) {
  const isWinner = selectedLot?.bids?.[0]?.userId === currentUser.id;
  const isSeller = selectedLot?.sellerId === currentUser.id;
  const canReview = isWinner || isSeller;
  
  // ⚡ Ищем конкретный отзыв текущего пользователя, чтобы показать его статус
  const userReview = selectedLot?.reviews?.find(r => r.authorId === currentUser.id);

  return (
    <div className="app-container" style={{ paddingBottom: '32px' }}>
      <div className="screen-header" style={{ marginBottom: '16px' }}>
        <button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button>
        <h2 className="screen-title">Завершенный лот</h2>
        <div className="lot-header-icons" style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '20px' }}>
          <span onClick={() => toggleFavorite(selectedLot)} style={{cursor: 'pointer'}}>{isFavorite ? '❤️' : '♡'}</span>
        </div>
      </div>
      
      <div className="lot-image-large" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', height: '18px', padding: '60px 0', borderRadius: '12px', overflow: 'hidden' }}>
        {selectedLot.photos && selectedLot.photos.length > 0 ? (
          <img src={selectedLot.photos[0]} alt="Lot" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : '🔒'}
      </div>
      
      <div style={{ marginTop: '12px' }}>
        <span className="tag-category">Аукцион завершен</span>
        <span className="lot-id-text">Лот #{selectedLot?.id}</span>
      </div>
      <h1 className="lot-page-title">{selectedLot?.title}</h1>
      <p className="lot-page-location">📍 {selectedLot?.location}</p>
      
      <div className="lot-section">
        <h3 className="lot-section-title">Описание</h3>
        <p className="lot-description-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{selectedLot?.description}</p>
      </div>
      
      <div className="lot-section">
        <h3 className="lot-section-title">История всех ставок ({selectedLot?.bids?.length || 0})</h3>
        <div className="bid-history-list">
          {selectedLot?.bids?.map((bid, index) => (
            <div key={bid.id} className="bid-item" style={index === 0 ? { background: '#f1f8e9', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' } : { display: 'flex', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid #eee' }}>
              <div className="bid-user-info">
                <span className="bid-username" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleOpenPublicProfile(bid.userId, 'completedLot')}>
                  {index === 0 ? 'Победитель ' : 'Участник '}(ID: {bid.userId})
                </span>
              </div>
              <span className="bid-amount" style={{ fontWeight: 'bold', color: index === 0 ? '#2e7d32' : '#111' }}>{bid.amount.toLocaleString('ru-RU')} ₽</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lot-section seller-block" onClick={() => handleOpenPublicProfile(selectedLot?.sellerId, 'completedLot')} style={{ cursor: 'pointer' }}>
        <p className="seller-username">Продавец ID: {selectedLot?.sellerId}</p>
      </div>
      
      {/* ⚡ Логика отображения кнопки отзыва или его статуса */}
      {canReview && !userReview && (
        <button className="btn-review" onClick={() => setCurrentScreen('writeReview')}>
          ⭐ Оставить отзыв {isSeller ? 'покупателю' : 'продавцу'}
        </button>
      )}

      {userReview && (
        <div style={{ 
          marginTop: '16px', padding: '12px', borderRadius: '12px', textAlign: 'center',
          background: userReview.status === 'REJECTED' ? '#ffebee' : userReview.status === 'MODERATION' ? '#fff8e1' : '#e8f5e9' 
        }}>
          {userReview.status === 'ACTIVE' && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Ваш отзыв опубликован</span>}
          {userReview.status === 'MODERATION' && <span style={{ color: '#f57f17', fontWeight: 'bold' }}>⏳ Отзыв проверяется модератором</span>}
          {userReview.status === 'REJECTED' && (
            <>
              <span style={{ color: '#c62828', fontWeight: 'bold' }}>❌ Ваш отзыв отклонен</span>
              {userReview.rejectReason && (
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#c62828' }}>
                  Причина: {userReview.rejectReason}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default CompletedLot;