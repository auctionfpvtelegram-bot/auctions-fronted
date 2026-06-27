import React, { useState, useEffect } from 'react';
import { API_URL } from '../config'; 

function Home({ 
  setCurrentScreen = () => {}, 
  setSelectedLot = () => {}, 
  favoriteLots = [], 
  toggleFavorite = () => {}, 
  isAdmin = false 
}) {
  const [apiLots, setApiLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Все');
  const [sortParam, setSortParam] = useState('new'); 
  const [now, setNow] = useState(Date.now());

  const categories = ['Все', 'Беспилотник', 'Аккумуляторы', 'Пульты', 'Очки/Шлемы', 'Запчасти', 'Прочее'];

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/api/lots?sort=${sortParam}&t=${Date.now()}`)
      .then(res => res.json())
      .then(data => setApiLots(Array.isArray(data) ? data : []))
      .catch(() => setApiLots([]))
      .finally(() => setIsLoading(false));
  }, [sortParam]); 

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

  const filteredLots = activeCategory === 'Все' ? apiLots : apiLots.filter(lot => lot.category === activeCategory);

  return (
    <>
      <input type="text" placeholder="Поиск дронов..." className="search-bar" style={{ marginTop: '16px' }} />

      <div className="categories" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px', overflowX: 'hidden' }}>
        {categories.map((category) => (
          <button key={category} style={{flexShrink: 0}} className={`category-btn ${activeCategory === category ? 'active' : ''}`} onClick={() => setActiveCategory(category)}>
            {category}
          </button>
        ))}
      </div>

      {/* ⚡ ПАНЕЛЬ ИНФОРМАЦИИ И СОРТИРОВКИ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 16px 12px 16px', fontSize: '12px', alignItems: 'center' }}>
        
        {/* Левая часть: кол-во лотов */}
        <span style={{ color: '#888' }}>{filteredLots.length} активных лотов</span>
        
        {/* Правая часть: сортировка + админка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          <select 
            value={sortParam}
            onChange={(e) => setSortParam(e.target.value)}
            style={{
              padding: '4px 8px',
              borderRadius: '8px',
              border: '1px solid #fbc02d',
              color: '#d89b00',
              fontWeight: 'bold',
              background: 'transparent',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            <option value="new">Сортировать</option>
            <option value="ending_soon">Скоро завершатся</option>
            <option value="price_asc">Сначала дешевые</option>
            <option value="price_desc">Сначала дорогие</option>
            <option value="active">Обсуждаемые</option>
          </select>

          {isAdmin && (
            <span style={{ color: '#fbc02d', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }} onClick={() => setCurrentScreen('adminDashboard')}>
              👑 Админка
            </span>
          )}
        </div>
      </div>

      <div className="lots-grid">
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', width: '100%', color: '#888' }}>Загрузка...</div>
        ) : filteredLots.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', width: '100%', color: '#888' }}>В этой категории нет активных лотов</div>
        ) : (
          filteredLots.map((lot) => (
            <div key={lot.id} className="lot-card" onClick={() => { setSelectedLot(lot); setCurrentScreen('activeLot'); }} style={{ cursor: 'pointer' }}>
              <div className="lot-image" style={{ position: 'relative', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', borderRadius: '8px', overflow: 'hidden' }}>
                {lot.photos && lot.photos.length > 0 ? (
                  <img src={lot.photos[0]} alt="Lot" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                ) : '🚁'}
                <button style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); toggleFavorite(lot); }}>
                  {favoriteLots.some(fav => fav.id === lot.id) ? '❤️' : '♡'}
                </button>
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                  ⏱ {formatTimeLeft(lot.endTime)}
                </div>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="card-lot-id" style={{ fontSize: '12px', color: '#888' }}>Лот #{lot.id}</span>
                {lot.category && <span className="tag-category" style={{ background: '#e3f2fd', color: '#1976d2', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>{lot.category}</span>}
              </div>
              <h3 className="lot-title" style={{ marginTop: '2px', fontSize: '16px', margin: '4px 0' }}>{lot.title}</h3>
              <div className="lot-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                <div>
                  <span className="lot-label" style={{ fontSize: '11px', color: '#888', display: 'block' }}>Текущая ставка</span>
                  <div className="lot-price" style={{ fontWeight: 'bold', fontSize: '14px' }}>{lot.currentPrice?.toLocaleString('ru-RU')} ₽</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab-button" onClick={() => setCurrentScreen('addLot')}>+</button>
    </>
  );
}

export default Home;