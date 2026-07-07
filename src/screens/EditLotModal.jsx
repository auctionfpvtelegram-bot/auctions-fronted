import React, { useState } from 'react';

export function EditLotModal({ lot, isOpen, onClose, API_URL, currentUser, onUpdateSuccess }) {
  if (!isOpen || !lot) return null;

  // Предзаполняем состояния текущими данными лота
  const [title, setTitle] = useState(lot.title || '');
  const [category, setCategory] = useState(lot.category || 'Беспилотник');
  const [location, setLocation] = useState(lot.location || '');
  const [description, setDescription] = useState(lot.description || '');
  const [buyNowPrice, setBuyNowPrice] = useState(lot.buyNowPrice || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categoriesList = ['Беспилотник', 'Аккумуляторы', 'Пульты', 'Очки/Шлемы', 'Запчасти', 'Прочее'];

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim() || !buyNowPrice) {
      setError('⚠️ Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    setError('');

    fetch(`${API_URL}/api/lots/${lot.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        title,
        category,
        description,
        location,
        buyNowPrice: parseFloat(buyNowPrice)
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Ошибка при обновлении лота');
      return res.json();
    })
    .then(updatedLot => {
      setIsSubmitting(false);
      onUpdateSuccess(updatedLot); // Передаем обновленный лот родителю для обновления стейта
      onClose();
    })
    .catch(err => {
      setIsSubmitting(false);
      setError('❌ Не удалось сохранить изменения. Попробуйте позже.');
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>✏️ Редактирование лота</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>×</button>
        </div>

        {error && <div style={{ color: '#c62828', fontSize: '13px', marginBottom: '12px', fontWeight: '500' }}>{error}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Название лота</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Категория</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 8px', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
              {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Город / Местоположение</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Цена продажи (выкупа), ₽</label>
            <input type="number" value={buyNowPrice} onChange={(e) => setBuyNowPrice(e.target.value)} placeholder="Стартовая цена (10%) рассчитается сама" style={{ width: '100%', height: '40px', border: '1px solid #ddd', borderRadius: '10px', padding: '0 12px', boxSizing: 'border-box', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>Описание лота</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '10px', padding: '10px 12px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" disabled={isSubmitting} style={{ flex: 1, height: '44px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isSubmitting ? 'Сохранение...' : 'Отправить на проверку'}
            </button>
            <button type="button" onClick={onClose} style={{ width: '100px', height: '44px', background: '#eee', color: '#333', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Отмена
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}