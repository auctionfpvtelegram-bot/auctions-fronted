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

  // ⚡ Усиленная функция для аватарок (отсеивает null-строки)
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
    if (h > 0) return `${h}ч ${m}м`;
    return `${m}м ${s}с`;
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

  // Получаем данные продавца
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

      <div style={{ padding: '0 16px' }}>
        <div style={{ marginTop: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {localLot.category && <span style={{ background: '#f0f2f5', color: '#555', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{localLot.category}</span>}
          <span style={{ fontSize: '12px', color: '#999' }}>Лот #{localLot.id}</span>
          <span style={{ marginLeft: 'auto', background: '#ffebee', color: '#c62828', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
            ⏱ {formatTimeLeft(localLot.endTime)}
          </span>
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '8px 0', lineHeight: '1.3' }}>{localLot.title}</h1>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>📍 {localLot.location}</p>

        {localLot.buyNowPrice && (
          <div style={{ background: '#fff8e1', border: '1px solid #ffcc00', padding: '14px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#f57f17', fontWeight: 'bold' }}>⚡️ Мгновенный выкуп</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#f57f17' }}>
              {localLot.buyNowPrice.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        )}

        {/* 🌟 КАРТОЧКА ПРОДАВЦА */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#fff', borderRadius: '16px', border: '1px solid #eef2f5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', marginBottom: '16px' }}>
          <div 
            onClick={() => handleOpenPublicProfile(localLot.sellerId, 'activeLot')}
            style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', flexShrink: 0, cursor: 'pointer' }}
          >
            {seller.avatarUrl && getAvatarSrc(seller.avatarUrl) ? (
              <img src={getAvatarSrc(seller.avatarUrl)} alt="seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '👤'}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                🏷️ Продавец
              </span>
              <span style={{ fontSize: '11px', color: '#455a64', background: '#cfd8dc', padding: '2px 7px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: '700' }}>
                ID: {localLot.sellerId}
              </span>
            </div>
            <div 
              onClick={() => handleOpenPublicProfile(localLot.sellerId, 'activeLot')}
              style={{ fontWeight: '700', fontSize: '16px', color: '#111', cursor: 'pointer' }}
            >
              {seller.customName || seller.firstName || seller.username || 'Аноним'}
            </div>
            <div style={{ fontSize: '12px', color: '#f57c00', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⭐ {seller.rating ? seller.rating.toFixed(1) : '0.0'} <span style={{ color: '#78909c', fontWeight: 'normal' }}>({seller.reviewsCount || 0} отзывов)</span>
            </div>
          </div>
        </div>

        <div className="lot-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Описание</h3>
          <p style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#444', lineHeight: '1.5', fontSize: '14px', background: '#f8f9fa', padding: '16px', borderRadius: '12px' }}>
            {localLot.description}
          </p>
        </div>

        {/* 🌟 ИСТОРИЯ СТАВОК */}
        <div className="lot-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>История ставок</span>
            <span style={{ background: '#f0f2f5', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>{localLot.bids?.length || 0}</span>
          </h3>
          
          <div className="bid-history-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!localLot.bids || localLot.bids.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px', background: '#f9f9f9', borderRadius: '12px' }}>Ставок пока нет</div>
            ) : (
              localLot.bids.map((bid, index) => {
                const isWinner = index === 0;
                const bidUser = bid.user || {};
                
                return (
                  <div 
                    key={bid.id} 
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', background: isWinner ? '#f1f8e9' : '#fff', border: isWinner ? '1px solid #c8e6c9' : '1px solid #eee' }}
                  >
                    <div 
                      onClick={() => handleOpenPublicProfile(bid.userId, 'activeLot')}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }} 
                    >
                      {bidUser.avatarUrl && getAvatarSrc(bidUser.avatarUrl) ? <img src={getAvatarSrc(bidUser.avatarUrl)} alt="bidder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                    </div>

                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: isWinner ? '#2e7d32' : '#333' }}>
                            {bidUser.customName || bidUser.firstName || bidUser.username || 'Аноним'} {isWinner && '🏆'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '800', fontSize: '15px', color: isWinner ? '#2e7d32' : '#111' }}>
                          {bid.amount.toLocaleString('ru-RU')} ₽
                        </span>
                        {isAdmin && (
                          <button onClick={() => handleDeleteBid(bid.id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px'}}>🗑</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {localLot.sellerId === currentUser.id && (
          <button style={{ background: '#ffebee', color: '#c62828', width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #ffcdd2', fontWeight: 'bold', fontSize: '15px', marginBottom: '80px', cursor: 'pointer' }} onClick={handleEarlyComplete}>
            🛑 Завершить досрочно
          </button>
        )}
        
        <div style={{height: '100px'}}></div>
      </div>

      {/* 🌟 ОБНОВЛЕННАЯ АДАПТИВНАЯ ПАНЕЛЬ СТАВКИ */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #eee', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', zIndex: 100 }}>
        
        {/* Левый блок с ценой (жестко держит ширину контента) */}
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, marginRight: '16px' }}>
          <span style={{ fontSize: '12px', color: '#666', marginBottom: '2px', whiteSpace: 'nowrap' }}>Текущая ставка</span>
          <span style={{ fontSize: '18px', fontWeight: '900', color: '#111', whiteSpace: 'nowrap' }}>
            {localLot.currentPrice?.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        
        {/* Правый блок с полем и кнопкой (растягивается на всё свободное место) */}
        <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center' }}>
          <input 
            type="text" 
            value={bidAmount} 
            onChange={(e) => setBidAmount(e.target.value.replace(/\D/g, ''))} 
            style={{ flex: 1, minWidth: '60px', height: '44px', border: '1px solid #ddd', borderRadius: '12px', padding: '0 10px', fontSize: '15px', outline: 'none', background: '#f9f9f9', fontWeight: 'bold', textAlign: 'center' }}
            placeholder="+10%"
          />
          <button 
            onClick={() => setUserActionModal('bid')}
            style={{ flexShrink: 0, height: '44px', padding: '0 20px', background: '#ffcc00', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255, 204, 0, 0.3)' }}
          >
            Ставка
          </button>
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
            <button style={{ background: '#ffcc00', color: '#000', padding: '16px', borderRadius: '12px', width: '100%', marginTop: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }} onClick={handlePlaceBid}>Подтвердить</button>
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