import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function CompletedLot({ setCurrentScreen, selectedLot, currentUser, isAdmin, isFavorite, toggleFavorite, handleOpenPublicProfile }) {
  const [localLot, setLocalLot] = useState(selectedLot);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [sellerData, setSellerData] = useState(null);
  const [winnerData, setWinnerData] = useState(null);

  // ⚡ Переменные для работы с завершённым лотом
  const isWinner = localLot?.bids?.[0]?.userId === currentUser.id;
  const isSeller = localLot?.sellerId === currentUser.id;
  const canReview = isWinner || isSeller;
  const userReview = localLot?.reviews?.find(r => r.authorId === currentUser.id);
  const winnerName = localLot?.bids?.[0]?.user?.customName || localLot?.bids?.[0]?.user?.firstName || winnerData?.customName || winnerData?.firstName || `ID: ${localLot?.bids?.[0]?.userId}`;
  const sellerName = localLot?.seller?.customName || localLot?.seller?.firstName || sellerData?.customName || sellerData?.firstName || `ID: ${localLot?.sellerId}`;

  // ⚡ Функция для аватарок (отсеивает пустоты)
  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  useEffect(() => {
    if (selectedLot) {
      setLocalLot(selectedLot);
      
      // Если профиль продавца не прилетел в лоте, запрашиваем его по ID
      if (!selectedLot.seller && selectedLot.sellerId) {
        fetch(`${API_URL}/api/users/${selectedLot.sellerId}/public`)
          .then(res => res.json())
          .then(data => setSellerData(data))
          .catch(() => {});
      }
      
      // Если профиль победителя не прилетел, запрашиваем его по ID ставки
      const topBid = selectedLot.bids?.[0];
      if (topBid && !topBid.user && topBid.userId) {
        fetch(`${API_URL}/api/users/${topBid.userId}/public`)
          .then(res => res.json())
          .then(data => setWinnerData(data))
          .catch(() => {});
      }
    }
  }, [selectedLot]);

  if (!localLot) return <div className="app-container">Лот не найден</div>;

  const handleDeleteBid = (bidId) => {
    setConfirmData({
      message: 'Вы уверены, что хотите удалить эту ставку?',
      onConfirm: () => {
        fetch(`${API_URL}/api/bids/${bidId}`, { method: 'DELETE' })
        .then(() => {
          setAlertData({ message: 'Ставка успешно удалена.' });
          setLocalLot(prev => ({
            ...prev,
            bids: prev.bids.filter(b => b.id !== bidId)
          }));
        })
        .catch(() => setAlertData({ message: 'Ошибка при удалении ставки.' }));
      }
    });
  };

  // Получаем данные продавца (приоритет: вложенный объект → подгруженные данные)
  const seller = localLot.user || localLot.seller || sellerData || {};

  return (
    <>
      {/* 📸 СЛАЙДЕР ФОТОГРАФИЙ */}
      <div className="lot-image-large" style={{ position: 'relative', background: '#f0f0f0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', fontSize: '60px', overflow: 'hidden' }}>
        
        {/* 🌟 Кнопка избранного */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(localLot); }}
          style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, fontSize: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        {localLot.photos && localLot.photos.length > 0 ? (
          <>
            <img src={localLot.photos[photoIndex]} alt="Lot" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            
            {localLot.photos.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(prev => prev > 0 ? prev - 1 : localLot.photos.length - 1); }}
                  style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                >
                  ❮
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex(prev => prev < localLot.photos.length - 1 ? prev + 1 : 0); }}
                  style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                >
                  ❯
                </button>
                <div style={{ position: 'absolute', bottom: '12px', display: 'flex', gap: '6px', zIndex: 2 }}>
                  {localLot.photos.map((_, idx) => (
                    <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === photoIndex ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : '🚁'}
      </div>

      <div style={{ marginTop: '12px', marginBottom: '8px' }}>
        {localLot.category && <span className="tag-category" style={{marginRight: '8px'}}>{localLot.category}</span>}
        <span className="lot-id-text">Лот #{localLot.id}</span>
        {/* ⚡ ПЛАШКА ЗАВЕРШЕНИЯ */}
        <span className="status-badge-large ended" style={{ background: '#e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', marginLeft: '8px' }}>
          🏁 Торги завершены
        </span>
      </div>

      <h1 className="lot-page-title">{localLot.title}</h1>
      <p className="lot-page-location">📍 {localLot.location}</p>

      {localLot.buyNowPrice && (
        <div className="instant-buy-box" style={{ background: '#fff8e1', border: '1px solid #ffcc00', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#f57f17', display: 'block', marginBottom: '4px' }}>⚡️ Мгновенный выкуп</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f57f17' }}>
            {localLot.buyNowPrice.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      )}

      {/* ОПИСАНИЕ */}
      <div className="lot-section">
        <h3 className="lot-section-title">Описание</h3>
        <p className="lot-description-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {localLot.description}
        </p>
      </div>

      {/* 🌟 КАРТОЧКА ПРОДАВЦА */}
      <div className="lot-section seller-block" style={{ marginBottom: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }} onClick={() => handleOpenPublicProfile(localLot.sellerId, 'completedLot')}>
        
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          {seller.avatarUrl && getAvatarSrc(seller.avatarUrl) ? (
            <img src={getAvatarSrc(seller.avatarUrl)} alt="seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
          <span className="seller-username" style={{ margin: 0, padding: 0, fontWeight: 'bold', fontSize: '15px', lineHeight: '1.2', color: '#111' }}>
            {sellerName}
          </span>
          <span style={{ fontSize: '13px', color: '#f57c00', marginTop: '2px', lineHeight: '1.2', fontWeight: 'bold' }}>
            ⭐ {seller.rating ? seller.rating.toFixed(1) : '0.0'} <span style={{ color: '#999', fontWeight: 'normal' }}>({seller.reviewsCount || 0} отзывов)</span>
          </span>
        </div>

        <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0 }}>
          Продавец
        </span>
      </div>

      {/* 🌟 ИСТОРИЯ СТАВОК */}
      <div className="lot-section">
        <h3 className="lot-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span>История ставок</span>
          <span style={{ background: '#f0f2f5', color: '#666', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            {localLot.bids?.length || 0}
          </span>
        </h3>

        <div className="bid-history-list">
          {localLot.bids?.map((bid, index) => {
            const isWinner = index === 0;
            const bidUser = bid.user || (index === 0 ? winnerData : {}) || {};

            return (
              <div 
                key={bid.id} 
                className="bid-item" 
                style={isWinner 
                  ? { background: '#f1f8e9', borderRadius: '8px', padding: '10px 12px', marginBottom: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } 
                  : { display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 4px', borderBottom: '1px solid #eee', alignItems: 'center' }
                }
              >
                <div className="bid-user-info" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }} onClick={() => handleOpenPublicProfile(bid.userId, 'completedLot')}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', cursor: 'pointer' }}>
                    {bidUser.avatarUrl && getAvatarSrc(bidUser.avatarUrl) ? <img src={getAvatarSrc(bidUser.avatarUrl)} alt="bidder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <span className="bid-username" style={{ margin: 0, fontSize: '14px', color: isWinner ? '#2e7d32' : '#333', cursor: 'pointer', fontWeight: isWinner ? 'bold' : '600', display: 'flex', alignItems: 'center' }}>
                    {bidUser.customName || bidUser.firstName || bidUser.username || 'Аноним'} {isWinner && <span style={{marginLeft: '4px'}}>🏆</span>}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <span className="bid-amount" style={{ fontWeight: 'bold', fontSize: '15px', color: isWinner ? '#2e7d32' : '#111' }}>
                    {bid.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteBid(bid.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0}}>🗑</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ⚡ БЛОК ОТЗЫВА (без зелёной плашки победителя) */}
      <div style={{ marginTop: '16px' }}>
        {canReview && !userReview && (
          <button 
            className="submit-btn" 
            onClick={() => setCurrentScreen('writeReview')} 
            style={{ width: '100%', height: '48px', background: '#ffcc00', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}
          >
            ⭐ Оставить отзыв
          </button>
        )}

        {userReview && (
          <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', textAlign: 'center', fontSize: '13px', background: userReview.status === 'REJECTED' ? '#ffebee' : userReview.status === 'MODERATION' ? '#fff8e1' : '#e8f5e9', border: `1px solid ${userReview.status === 'REJECTED' ? '#ef9a9a' : userReview.status === 'MODERATION' ? '#ffe082' : '#a5d6a7'}` }}>
            {userReview.status === 'ACTIVE' && <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>✓ Ваш отзыв успешно опубликован</span>}
            {userReview.status === 'MODERATION' && <span style={{ color: '#f57f17', fontWeight: 'bold' }}>⏳ Ваш отзыв находится на модерации</span>}
            {userReview.status === 'REJECTED' && (
              <><span style={{ color: '#c62828', fontWeight: 'bold' }}>❌ Ваш отзыв отклонен модератором</span></>
            )}
          </div>
        )}
      </div>

      <div style={{height: '80px'}}></div>

      {/* МОДАЛКИ */}
      {alertData && (
        <div className="modal-overlay" onClick={() => { if(alertData.onClose) alertData.onClose(); setAlertData(null); }} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: 1.4 }}>{alertData.message}</p>
            <button style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', fontWeight: 'bold', cursor: 'pointer', border: 'none' }} onClick={() => { if(alertData.onClose) alertData.onClose(); setAlertData(null); }}>Понятно</button>
          </div>
        </div>
      )}

      {confirmData && (
        <div className="modal-overlay" onClick={() => setConfirmData(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: 1.4 }}>{confirmData.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ background: '#f5f5f5', color: '#111', padding: '12px', borderRadius: '8px', flex: 1, fontWeight: 'bold', border: 'none', cursor: 'pointer' }} onClick={() => setConfirmData(null)}>Отмена</button>
              <button style={{ background: '#c62828', color: '#fff', padding: '12px', borderRadius: '8px', flex: 1, fontWeight: 'bold', border: 'none', cursor: 'pointer' }} onClick={() => { confirmData.onConfirm(); setConfirmData(null); }}>Подтвердить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CompletedLot;