import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function ActiveLot({ setCurrentScreen, selectedLot, currentUser, isAdmin, isFavorite, toggleFavorite, handleOpenPublicProfile }) {
  const [localLot, setLocalLot] = useState(selectedLot);
  const [bidAmount, setBidAmount] = useState('');
  const [now, setNow] = useState(Date.now());
  
  const [photoIndex, setPhotoIndex] = useState(0);
  
  const [userActionModal, setUserActionModal] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // ⚡ Функция для аватарок
  const getAvatarSrc = (url) => {
    if (!url || url === 'null' || url === 'undefined') return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  useEffect(() => {
    if (selectedLot) {
      setLocalLot(selectedLot);
    }
  }, [selectedLot]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (localLot) {
      const minIncrement = localLot.currentPrice * 0.001;
      const recommendedBid = Math.ceil(localLot.currentPrice + minIncrement);
      setBidAmount(recommendedBid.toString());
    }
  }, [localLot]);

  if (!localLot) return <div className="app-container">Лот не найден</div>;

  const formatTimeLeft = (endTime) => {
    if (!endTime) return '';
    const diff = new Date(endTime).getTime() - now;
    if (diff <= 0) return 'Завершено';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  const handlePlaceBid = () => {
    const amount = parseInt(bidAmount, 10);
    const minIncrement = localLot.currentPrice * 0.001;
    const minAllowedBid = Math.ceil(localLot.currentPrice + minIncrement);
    
    if (isNaN(amount) || amount < minAllowedBid) {
      setAlertData({ message: `Минимальная ставка: ${minAllowedBid.toLocaleString('ru-RU')} ₽ (+0.1%)` });
      return;
    }

    fetch(`${API_URL}/api/lots/${localLot.id}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, userId: currentUser.id })
    })
    .then(async res => {
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    })
    .then(updatedLot => {
      setAlertData({ message: '🎉 Ставка успешно принята!' });
      setUserActionModal(null);
      setLocalLot(updatedLot);
    })
    .catch(err => {
      setAlertData({ message: `❌ ${err.message}` });
      setUserActionModal(null);
    });
  };

  const handleEarlyComplete = () => {
    setConfirmData({
      message: 'Вы уверены, что хотите досрочно завершить этот лот?',
      onConfirm: () => {
        fetch(`${API_URL}/api/lots/${localLot.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' })
        })
        .then(() => {
          setAlertData({ 
            message: '🛑 Лот успешно завершен досрочно!',
            onClose: () => setCurrentScreen('profile')
          });
        })
        .catch(() => setAlertData({ message: '❌ Ошибка при завершении лота.' }));
      }
    });
  };

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

  const seller = localLot.user || localLot.seller || {};

  return (
    <>
      <div className="screen-header" style={{ marginBottom: '16px' }}>
        <button className="back-btn" onClick={() => setCurrentScreen('home')}>{'<'}</button>
        <div className="lot-header-icons" style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '20px' }}>
          <span onClick={() => toggleFavorite(localLot)} style={{cursor: 'pointer'}}>{isFavorite ? '❤️' : '♡'}</span>
        </div>
      </div>

      <div className="lot-image-large" style={{ position: 'relative', background: '#f0f0f0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', fontSize: '60px', overflow: 'hidden' }}>
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
        <span className="tag-timer" style={{marginLeft: '8px', background: '#ffebee', color: '#c62828', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>
          ⏱ {formatTimeLeft(localLot.endTime)}
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

      <div className="lot-section">
        <h3 className="lot-section-title">Описание</h3>
        <p className="lot-description-text" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {localLot.description}
        </p>
      </div>

      <div className="lot-section">
        <h3 className="lot-section-title">История ставок ({localLot.bids?.length || 0})</h3>
        <div className="bid-history-list">
          {localLot.bids?.map((bid, index) => {
            const isWinner = index === 0;
            const bidUser = bid.user || {};

            return (
              <div 
                key={bid.id} 
                className="bid-item" 
                style={isWinner 
                  ? { background: '#f1f8e9', borderRadius: '8px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } 
                  : { display: 'flex', justifyContent: 'space-between', padding: '8px 4px', borderBottom: '1px solid #eee', alignItems: 'center' }
                }
              >
                <div className="bid-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={() => handleOpenPublicProfile(bid.userId, 'activeLot')}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                    {bidUser.avatarUrl && getAvatarSrc(bidUser.avatarUrl) ? <img src={getAvatarSrc(bidUser.avatarUrl)} alt="bidder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                  </div>
                  <span className="bid-username" style={{ fontSize: '14px', color: isWinner ? '#2e7d32' : '#333', cursor: 'pointer', fontWeight: isWinner ? 'bold' : 'normal' }}>
                    {bidUser.customName || bidUser.firstName || bidUser.username || 'Аноним'} {isWinner && '🏆'}
                  </span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <span className="bid-amount" style={{ fontWeight: 'bold', fontSize: '15px', color: isWinner ? '#2e7d32' : '#111' }}>
                    {bid.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDeleteBid(bid.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px'}}>🗑</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="lot-section seller-block" style={{ marginBottom: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => handleOpenPublicProfile(localLot.sellerId, 'activeLot')}>
        <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          {seller.avatarUrl && getAvatarSrc(seller.avatarUrl) ? (
            <img src={getAvatarSrc(seller.avatarUrl)} alt="seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="seller-username" style={{ margin: 0, padding: 0, fontWeight: 'bold', fontSize: '15px' }}>
            {seller.customName || seller.firstName || seller.username || 'Аноним'}
          </span>
          <span style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
            ⭐ {seller.rating ? seller.rating.toFixed(1) : '0.0'} ({seller.reviewsCount || 0} отзывов)
          </span>
        </div>
      </div>

      {localLot.sellerId === currentUser.id && (
        <button className="btn-reject" style={{ width: '100%', padding: '14px', marginBottom: '80px' }} onClick={handleEarlyComplete}>
          🛑 Завершить досрочно
        </button>
      )}
      
      <div style={{height: '80px'}}></div>

      <div className="bottom-bid-bar">
        <div className="bottom-bid-info">
          <div className="bottom-bid-price-block">
            <span className="bottom-bid-label">Текущая ставка</span>
            <p className="bottom-bid-price">{localLot.currentPrice?.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
        <div className="bottom-bid-actions">
          <input type="text" className="bid-input" value={bidAmount} onChange={(e) => setBidAmount(e.target.value.replace(/\D/g, ''))} />
          {/* ⚡ Желтая кнопка "Ставка" */}
          <button className="bid-btn" style={{ background: '#ffcc00', color: '#000', border: 'none' }} onClick={() => setUserActionModal('bid')}>Ставка</button>
        </div>
      </div>

      {/* МОДАЛКИ */}
      {userActionModal === 'bid' && (
        <div className="modal-overlay" onClick={() => setUserActionModal(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Подтверждение ставки</h3>
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '16px', margin: '20px 0' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#111' }}>
                {parseFloat(bidAmount || 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>
            <button style={{ background: '#000', color: '#fff', padding: '16px', borderRadius: '12px', width: '100%', marginTop: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={handlePlaceBid}>Подтвердить</button>
          </div>
        </div>
      )}

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

export default ActiveLot;