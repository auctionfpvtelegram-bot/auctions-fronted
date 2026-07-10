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
        startPrice: startingPrice, 
        buyNowPrice: salePrice, 
        location: lotLocation, 
        sellerId: currentUser.id,
        durationHours: parseInt(lotDuration, 10)
      })
    })
    .then(async res => {
      setIsLoading(false);
      if (!res.ok) throw new Error('Ошибка сервера');
      return res.json();
    })
    .then((newLot) => {
      setAlertData({ 
        message: `✅ Текстовая анкета лота #${newLot.id} успешно сформирована!\n\n📸 Теперь нажмите кнопку ниже: вас перекинет в бот, куда нужно отправить фотографии товара (до 10 штук).`,
        onClose: () => {
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.close(); // Мгновенно выкидывает юзера обратно в чат с ботом!
          } else {
            setCurrentScreen('profile');
          }
        }
      });
    })
    .catch(err => {
      setIsLoading(false);
      setAlertData({ message: `❌ Ошибка при отправке анкеты.` });
    });
  };

  return (
    <>
      <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#2e7d32', lineHeight: '1.4' }}>
        ℹ️ <b>Шаг 1 из 2:</b> Заполните описание. Фотографии вы прикрепите следом в чате с ботом!
      </div>

      <div className="form-group">
        <label className="form-label">Название <span>*</span></label>
        <input type="text" className="input-field" value={lotTitle} onChange={e => setLotTitle(e.target.value)} placeholder="Например: DJI Mavic 3 Pro" />
      </div>

      <div className="form-group">
        <label className="form-label">Категория <span>*</span></label>
        <select className="select-field" value={lotCategory} onChange={e => setLotCategory(e.target.value)}>
          <option value="" disabled>Выберите категорию</option>
          {categories.filter(c => c !== 'Все').map(cat => (<option key={cat} value={cat}>{cat}</option>))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Описание <span>*</span></label>
        <textarea className="textarea-field" value={lotDescription} maxLength={500} onChange={e => setLotDescription(e.target.value)} placeholder="Состояние, комплектация, дефекты..."></textarea>
      </div>

      <div className="form-group">
        <label className="form-label">Местоположение <span>*</span></label>
        <input type="text" className="input-field" value={lotLocation} onChange={e => setLotLocation(e.target.value)} placeholder="Город отправки" />
      </div>

      <div className="form-group">
        <label className="form-label">Время торгов <span>*</span></label>
        <select className="select-field" value={lotDuration} onChange={e => setLotDuration(e.target.value)}>
          <option value="6">6 часов</option>
          <option value="12">12 часов</option>
          <option value="24">24 часа</option>
          <option value="48">48 часов</option>
          <option value="72">72 часа</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Цена выкупа (купить сразу) <span>*</span></label>
        <div className="price-input-wrapper">
          <input type="text" className="input-field" value={lotPrice} onChange={e => setLotPrice(e.target.value.replace(/\D/g, ''))} placeholder="0" />
          <span className="price-currency">₽</span>
        </div>
        <span className="upload-hint" style={{ display: 'block', marginTop: '6px' }}>
          Стартовая цена торгов: {lotPrice ? Math.ceil(parseInt(lotPrice, 10) * 0.1).toLocaleString('ru-RU') : 0} ₽ (10%)
        </span>
      </div>

      <button 
        className="submit-btn" 
        disabled={!isFormValid || isLoading} 
        onClick={handleCreateLot}
        style={{ opacity: (!isFormValid || isLoading) ? 0.6 : 1 }}
      >
        {isLoading ? '⏳ Создание анкеты...' : 'Перейти к отправке фото'}
      </button>

      {alertData && (
        <div className="modal-overlay" onClick={() => { if(alertData.onClose) alertData.onClose(); setAlertData(null); }} style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{alertData.message}</p>
            <button 
              style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', width: '100%', fontWeight: 'bold', cursor: 'pointer', border: 'none' }} 
              onClick={() => { if(alertData.onClose) alertData.onClose(); setAlertData(null); }}
            >
              Отправить фото в бот
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AddLot;