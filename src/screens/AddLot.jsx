import React, { useState } from 'react';
import { API_URL } from '../config';

function AddLot({ setCurrentScreen, currentUser }) {
  const [lotTitle, setLotTitle] = useState('');
  const [lotCategory, setLotCategory] = useState('');
  const [lotDescription, setLotDescription] = useState('');
  const [lotLocation, setLotLocation] = useState('');
  const [lotPrice, setLotPrice] = useState('');
  const [lotDuration, setLotDuration] = useState('24');
  
  const [isLoading, setIsLoading] = useState(false);
  const [alertData, setAlertData] = useState(null);

  const categories = ['Все', 'Беспилотник', 'Аккумуляторы', 'Пульты', 'Очки/Шлемы', 'Запчасти', 'Прочее'];

  const isFormValid = 
    lotTitle.trim() !== '' && 
    lotCategory !== '' && 
    lotDescription.trim() !== '' && 
    lotLocation.trim() !== '' && 
    lotPrice.trim() !== '';

  const handleCreateLot = () => {
    setIsLoading(true);
    const salePrice = parseInt(lotPrice, 10);
    const startingPrice = Math.ceil(salePrice * 0.1);

    fetch(`${API_URL}/api/lots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: lotTitle,
        category: lotCategory,
        description: lotDescription,
        location: lotLocation,
        buyNowPrice: salePrice,
        startPrice: startingPrice,
        sellerId: currentUser.id,
        durationHours: lotDuration
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsLoading(false);
        if (data.error) {
          setAlertData({ message: data.error });
        } else {
          setAlertData({ 
            message: `🎉 Анкета успешно создана!\n\nЛот переведен в режим ожидания фотографий.\n\nПроверьте личные сообщения с ботом — он уже ждет ваши фотографии лота!`,
            onClose: () => setCurrentScreen('profile')
          });
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.error(err);
        setAlertData({ message: 'Ошибка при отправке данных на сервер.' });
      });
  };

  return (
    <div style={{ padding: '0 16px', paddingBottom: '40px', marginTop: '12px' }}>
      
      <div className="input-group">
        <label className="input-label">Название товара</label>
        <input 
          type="text" className="form-input" placeholder="Например: DJI Avata Fly More Combo" 
          value={lotTitle} onChange={e => setLotTitle(e.target.value)} 
        />
      </div>

      <div className="input-group">
        <label className="input-label">Категория</label>
        <select className="form-input" value={lotCategory} onChange={e => setLotCategory(e.target.value)}>
          <option value="" disabled>Выберите категорию</option>
          {categories.filter(c => c !== 'Все').map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label className="input-label">Описание состояния и комплектации</label>
        <textarea 
          className="form-input" rows={4} placeholder="Опишите состояние, дефекты, комплектацию вашего оборудования..." 
          value={lotDescription} onChange={e => setLotDescription(e.target.value)}
          style={{ height: 'auto', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Город нахождения лота</label>
        <input 
          type="text" className="form-input" placeholder="Например: Москва" 
          value={lotLocation} onChange={e => setLotLocation(e.target.value)} 
        />
      </div>

      <div className="input-group">
        <label className="input-label">Длительность аукциона</label>
        <select className="form-input" value={lotDuration} onChange={e => setLotDuration(e.target.value)}>
          <option value="12">12 часов</option>
          <option value="24">24 часа (1 сутки)</option>
          <option value="48">48 часов (2 суток)</option>
          <option value="72">72 часа (3 суток)</option>
        </select>
      </div>

      <div className="input-group" style={{ marginBottom: '24px' }}>
        <label className="input-label">Цена моментального выкупа (Блиц-цена)</label>
        <div style={{ position: 'relative' }}>
          <input 
            type="number" className="form-input" placeholder="Введите цену в рублях" 
            value={lotPrice} onChange={e => setLotPrice(e.target.value)} 
            style={{ paddingRight: '36px' }}
          />
          <span className="price-currency" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 'bold' }}>₽</span>
        </div>
        <span className="upload-hint" style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
          Стартовая цена торгов: {lotPrice ? Math.ceil(parseInt(lotPrice, 10) * 0.1).toLocaleString('ru-RU') : 0} ₽ (Устанавливается автоматически как 10% от блиц-цены).
        </span>
      </div>
      
      <button 
        className="submit-btn" 
        disabled={!isFormValid || isLoading} 
        onClick={handleCreateLot}
        style={{ opacity: (!isFormValid || isLoading) ? 0.6 : 1, width: '100%', height: '48px', background: '#ffcc00', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: isFormValid ? 'pointer' : 'not-allowed', boxShadow: '0 4px 12px rgba(255,204,0,0.2)' }}
      >
        {isLoading ? '⏳ Создание анкеты...' : 'Перейти к отправке фото'}
      </button>

      {alertData && (
        <div className="modal-overlay" onClick={() => { if(alertData.onClose) alertData.onClose(); setAlertData(null); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '16px', width: '85%', maxWidth: '320px' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '15px', marginBottom: '20px', lineHeight: 1.4, whiteSpace: 'pre-wrap', color: '#1e293b' }}>{alertData.message}</p>
            <button 
              style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', fontWeight: 'bold', cursor: 'pointer', border: 'none' }} 
              onClick={() => { if(alertData.onClose) alertData.onClose(); setAlertData(null); }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddLot;