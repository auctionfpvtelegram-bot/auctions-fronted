import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../config';

function ActiveLot({ setCurrentScreen, selectedLot, currentUser, handleOpenPublicProfile, setAlertData }) {
  // ⚡ Теперь мы сразу берем лот из пропсов, никакой бесконечной загрузки!
  const [lot, setLot] = useState(selectedLot);
  const [bids, setBids] = useState(selectedLot?.bids || []);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  
  const scrollRef = useRef(null);

  // Умная функция для получения ссылки на аватарку
  const getAvatarSrc = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${API_URL}/api/image/${url}`;
  };

  // Синхронизация с выбранным лотом, если он изменился в App.jsx
  useEffect(() => {
    if (selectedLot) {
      setLot(selectedLot);
      if (selectedLot.bids) setBids(selectedLot.bids);
    }
  }, [selectedLot]);

  // Фоновое обновление ставок (каждые 5 секунд), чтобы видеть ставки других
  useEffect(() => {
    if (!lot?.id) return;
    const fetchBids = async () => {
      try {
        const res = await fetch(`${API_URL}/api/lots/${lot.id}/bids`);
        if (res.ok) {
          const data = await res.json();
          setBids(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBids();
    const interval = setInterval(fetchBids, 5000);
    return () => clearInterval(interval);
  }, [lot?.id]);

  // Таймер обратного отсчета
  useEffect(() => {
    if (!lot || lot.status !== 'ACTIVE') {
      setTimeLeft('Торги завершены');
      return;
    }

    const updateTimer = () => {
      const diff = new Date(lot.endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Время истекло');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}ч ${minutes}м ${seconds}с`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [lot]);

  // Автоскролл к свежей ставке
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [bids]);

  // Отправка новой ставки
  const handlePlaceBid = (e) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    const minBid = lot ? (lot.currentPrice + lot.minStep) : 0;

    if (!amount || amount < minBid) {
      if (setAlertData) setAlertData({ message: `⚠️ Минимальная ставка: ${minBid} ₽`, onClose: () => {} });
      else alert(`Минимальная ставка: ${minBid} ₽`);
      return;
    }

    setIsSubmitting(true);
    fetch(`${API_URL}/api/lots/${lot.id}/bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, amount })
    })
    .then(async res => {
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Не удалось сделать ставку');
      setBidAmount('');
      // Локально обновляем цену и ставки
      setLot(prev => ({ ...prev, currentPrice: json.amount }));
      setBids(prev => [...prev, json]);
    })
    .catch(err => {
      if (setAlertData) setAlertData({ message: `⚠️ ${err.message}`, onClose: () => {} });
      else alert(`⚠️ ${err.message}`);
    })
    .finally(() => setIsSubmitting(false));
  };

  if (!lot) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>Загрузка данных лота...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#f4f6f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* ХЕДЕР */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: '#fff', borderBottom: '1px solid #eef2f5', sticky: 'top', zIndex: 100 }}>
        <button onClick={() => setCurrentScreen('home')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#1976d2', marginRight: '12px' }}>{'\u276E'}</button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{lot.title}</h2>
      </div>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* МЕДИА И ИНФОРМАЦИЯ О ЛОТЕ */}
        <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #eef2f5', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          {lot.imageUrl && (
            <img src={lot.imageUrl} alt="lot" style={{ width: '100%', maxHeight: '260px', objectFit: 'cover' }} />
          )}
          <div style={{ padding: '16px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#444', lineHeight: '1.5' }}>{lot.description}</p>
            
            {/* ТАЙМЕР И ЦЕНЫ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8f9fa', padding: '14px', borderRadius: '14px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '2px' }}>Текущая цена</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>{lot.currentPrice.toLocaleString()} ₽</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '2px' }}>Осталось времени</span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: lot.status === 'ACTIVE' ? '#e65100' : '#777' }}>{timeLeft}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 КАРТОЧКА ПРОДАВЦА */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: '#fff', borderRadius: '18px', border: '1px solid #eef2f5', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div 
            onClick={() => handleOpenPublicProfile(lot.userId)}
            style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #1976d2', flexShrink: 0, cursor: 'pointer', boxShadow: '0 2px 6px rgba(25,118,210,0.1)' }}
          >
            {lot.user?.avatarUrl ? (
              <img src={getAvatarSrc(lot.user.avatarUrl)} alt="seller" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : '👤'}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ background: '#e3f2fd', color: '#0d47a1', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                🏷️ Продавец
              </span>
              <span style={{ fontSize: '11px', color: '#455a64', background: '#cfd8dc', padding: '2px 7px', borderRadius: '6px', fontFamily: 'monospace', fontWeight: '700' }}>
                ID: {lot.user?.id}
              </span>
            </div>
            <div 
              onClick={() => handleOpenPublicProfile(lot.userId)}
              style={{ fontWeight: '700', fontSize: '16px', color: '#111', cursor: 'pointer' }}
            >
              {lot.user?.customName || lot.user?.firstName || 'Аноним'}
            </div>
            <div style={{ fontSize: '12px', color: '#f57c00', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⭐ {lot.user?.rating ? lot.user.rating.toFixed(1) : '5.0'} <span style={{ color: '#78909c', fontWeight: 'normal' }}>({lot.user?.reviewsCount || 0} отзывов)</span>
            </div>
          </div>
        </div>

        {/* БЛОК ПОБЕДИТЕЛЯ (ЕСЛИ ТОРГИ ЗАВЕРШЕНЫ) */}
        {lot.status === 'COMPLETED' && lot.winner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: '#e8f5e9', borderRadius: '16px', border: '1px solid #c8e6c9' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #2e7d32' }}>
              {lot.winner?.avatarUrl ? <img src={getAvatarSrc(lot.winner.avatarUrl)} alt="winner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🏆'}
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 'bold', textTransform: 'uppercase' }}>🎉 Победитель аукциона</div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#1b5e20' }}>{lot.winner?.customName || lot.winner?.firstName || 'Пользователь'}</div>
            </div>
          </div>
        )}

        {/* 🌟 ИСТОРИЯ СТАВОК */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '20px', padding: '16px', border: '1px solid #eef2f5', boxShadow: '0 4px 16px rgba(0,0,0,0.01)' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#333', display: 'flex', justifyContent: 'space-between' }}>
            <span>📊 История ставок</span>
            <span style={{ background: '#f0f2f5', color: '#666', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>Всего: {bids.length}</span>
          </h3>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', paddingRight: '4px' }} className="bids-container">
            {bids.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: '#999', fontSize: '14px' }}>Ставок пока нет. Будьте первым!</div>
            ) : (
              bids.map((bid) => {
                const isMyBid = String(bid.userId) === String(currentUser?.id);
                return (
                  <div key={bid.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '12px', background: isMyBid ? '#f1f8ff' : '#f8f9fa', marginBottom: '8px', border: isMyBid ? '1px solid #b3d7ff' : '1px solid #f0f0f0' }}>
                    <div 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #ddd', cursor: 'pointer' }} 
                      onClick={() => handleOpenPublicProfile(bid.userId)}
                    >
                      {bid.user?.avatarUrl ? <img src={getAvatarSrc(bid.user.avatarUrl)} alt="bidder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: isMyBid ? '#1976d2' : '#212121' }}>
                            {bid.user?.customName || bid.user?.firstName || 'Аноним'} {isMyBid && '🧭'}
                          </span>
                          <span style={{ background: '#eceff1', color: '#455a64', padding: '2px 6px', borderRadius: '5px', fontSize: '10px', fontFamily: 'monospace', fontWeight: '700', border: '1px solid #cfd8dc' }}>
                            ID: {bid.user?.id || bid.userId}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#999' }}>{new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span style={{ fontWeight: '800', fontSize: '16px', color: isMyBid ? '#1976d2' : '#2e7d32' }}>{bid.amount.toLocaleString()} ₽</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ПАНЕЛЬ ОФОРМЛЕНИЯ СТАВКИ */}
        {lot.status === 'ACTIVE' && String(lot.userId) !== String(currentUser?.id) && (
          <form onSubmit={handlePlaceBid} style={{ display: 'flex', gap: '10px', background: '#fff', padding: '12px', borderRadius: '16px', border: '1px solid #eef2f5', boxShadow: '0 -4px 12px rgba(0,0,0,0.02)' }}>
            <input 
              type="number" 
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Мин. ${(lot.currentPrice + lot.minStep).toLocaleString()} ₽`}
              disabled={isSubmitting}
              style={{ flex: 1, height: '46px', border: '1px solid #ddd', borderRadius: '12px', padding: '0 14px', outline: 'none', fontSize: '15px', boxSizing: 'border-box' }}
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ height: '46px', padding: '0 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(25,118,210,0.2)' }}
            >
              {isSubmitting ? '...' : 'Поставить'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default ActiveLot;