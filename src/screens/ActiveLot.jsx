import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config'; // ⚡ КРИТИЧНО ДЛЯ ЗАГРУЗКИ АВАТАРОК!

function ActiveLot({
  setCurrentScreen,
  selectedLot,
  currentUser,
  isAdmin,
  isFavorite,
  toggleFavorite,
  handleOpenPublicProfile
}) {
  const [localLot, setLocalLot] = useState(selectedLot);
  const [bidAmount, setBidAmount] = useState('');
  const [now, setNow] = useState(Date.now());
  const [photoIndex, setPhotoIndex] = useState(0);
  const [userActionModal, setUserActionModal] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [bids, setBids] = useState([]);
  const scrollRef = useRef(null);

  // ⚡ Умная функция для получения ссылки на аватарку
  const getAvatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  // Синхронизация с выбранным лотом
  useEffect(() => {
    if (selectedLot) {
      setLocalLot(selectedLot);
      if (selectedLot.bids) {
        setBids(selectedLot.bids);
      }
    }
  }, [selectedLot]);

  // Таймер обратного отсчёта
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Рекомендуемая ставка
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
        if (updatedLot.bids) setBids(updatedLot.bids);
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
            setBids(prev => prev.filter(b => b.id !== bidId));
          })
          .catch(() => setAlertData({ message: 'Ошибка при удалении ставки.' }));
      }
    });
  };

  return (
    <>
      <div className="screen-header" style={{ marginBottom: '16px' }}>
        <button className="back-btn" onClick={() => setCurrentScreen('home')}>{'<'}</button>
        <div className="lot-header-icons" style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '20px' }}>
          <span onClick={() => toggleFavorite(localLot)} style={{cursor: 'pointer'}}>{isFavorite ? '❤️' : '♡'}</span>
        </div>
      </div>

      {/* Слайдер фотографий */}
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

      {/* 🌟 ОБНОВЛЕННЫЙ БЛОК ПРОДАВЦА */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#f8f9fa', borderRadius: '14px', border: '1px solid #eaeaea', marginBottom: '20px', cursor: 'pointer' }} 
        onClick={() => handleOpenPublicProfile(localLot.user?.id || localLot.sellerId, 'activeLot')}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #1976d2', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {localLot.user?.avatarUrl ? (
            <img src={getAvatarSrc(localLot.user.avatarUrl)} alt="seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '👤'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {/* Стикер "Продавец" */}
            <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              🏷️ Продавец
            </span>
            {/* Стикер ID */}
            <span style={{ fontSize: '11px', color: '#666', background: '#eeeeee', padding: '2px 6px', borderRadius: '5px', fontFamily: 'monospace', fontWeight: '600' }}>
              ID: {localLot.user?.id || localLot.sellerId}
            </span>
          </div>
          <div style={{ fontWeight: '700', fontSize: '16px', color: '#111' }}>
            {localLot.user?.customName || localLot.user?.firstName || 'Аноним'}
          </div>
          <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🤝 Успешных сделок: {localLot.user?.dealsCount || 0}
          </div>
        </div>
      </div>

      {/* ⚡ БЛОК ПОБЕДИТЕЛЯ (если лот завершён) */}
      {localLot.status === 'COMPLETED' && localLot.winner && (
        <div className="lot-section" style={{ background: '#e8f5e9', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #c8e6c9' }}>
            {localLot.winner?.avatarUrl ? <img src={getAvatarSrc(localLot.winner.avatarUrl)} alt="winner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#2e7d32' }}>
            🏆 Победитель: {localLot.winner?.customName || localLot.winner?.firstName || 'Пользователь'}
          </div>
        </div>
      )}

      {/* ⚡ ИСТОРИЯ СТАВОК (ОБНОВЛЁННАЯ) */}
      <div className="lot-section">
        <h3 className="lot-section-title">История ставок ({bids?.length || 0})</h3>
        <div className="bid-history-list" ref={scrollRef}>
          {bids?.map((bid, index) => {
            const isMyBid = bid.userId === currentUser.id;
            return (
              <div 
                key={bid.id} 
                className="bid-item" 
                style={index === 0 
                  ? { background: '#f1f8e9', borderRadius: '8px', padding: '12px', marginBottom: '8px' } 
                  : { padding: '0' }
                }
              >
                {/* 🌟 ОБНОВЛЕННЫЙ ЭЛЕМЕНТ СТАВКИ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: index === 0 ? 'none' : '1px solid #f0f0f0' }}>
                  {/* Кликабельная аватарка */}
                  <div 
                    style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #e0e0e0', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} 
                    onClick={() => handleOpenPublicProfile(bid.userId)}
                  >
                    {bid.user?.avatarUrl ? (
                      <img src={getAvatarSrc(bid.user.avatarUrl)} alt="bidder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '👤'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                      {/* Ник + Стикер ID */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: isMyBid ? '#1976d2' : '#212121' }}>
                          {bid.user?.customName || bid.user?.firstName || 'Аноним'} {isMyBid && '(Вы)'}
                        </span>
                        <span style={{ background: '#f5f5f5', color: '#616161', padding: '2px 6px', borderRadius: '5px', fontSize: '10px', fontFamily: 'monospace', fontWeight: '600', border: '1px solid #e0e0e0' }}>
                          ID: {bid.user?.id || bid.userId}
                        </span>
                      </div>

                      <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                        <span className="bid-amount" style={{ fontWeight: 'bold', fontSize: '15px', color: index === 0 ? '#2e7d32' : '#111' }}>
                          {bid.amount.toLocaleString('ru-RU')} ₽
                        </span>
                        {isAdmin && (
                          <button onClick={() => handleDeleteBid(bid.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px'}}>🗑</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {(!bids || bids.length === 0) && (
            <p style={{ textAlign: 'center', color: '#888', padding: '16px' }}>Ставок пока нет. Будьте первым!</p>
          )}
        </div>
      </div>

      {localLot.sellerId === currentUser.id && localLot.status === 'ACTIVE' && (
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
          <button className="bid-btn" onClick={() => setUserActionModal('bid')}>Ставка</button>
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