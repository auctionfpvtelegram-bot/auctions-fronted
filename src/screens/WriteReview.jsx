import React, { useState } from 'react';
import { API_URL } from '../config';

function WriteReview({ setCurrentScreen, selectedLot, currentUser, setAlertData }) {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const isSeller = selectedLot?.sellerId === currentUser.id;
  const targetText = isSeller ? 'покупателю' : 'продавцу';
  const targetId = isSeller ? selectedLot?.bids?.[0]?.userId : selectedLot?.sellerId;

  const handleSubmitReview = () => {
    if (reviewRating === 0 || reviewText.trim() === '') return;

    fetch(`${API_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: reviewRating,
        text: reviewText,
        lotId: selectedLot.id,
        authorId: currentUser.id
      })
    })
    .then(async res => {
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Ошибка публикации отзыва');
      }
      return res.json();
    })
    .then(() => {
      setAlertData({ 
        message: '🎉 Отзыв успешно отправлен на модерацию!',
        onClose: () => setCurrentScreen('profile')
      });
    })
    .catch(err => {
      setAlertData({ message: `❌ ${err.message}` });
    });
  };

  return (
    <div className="app-container">
      <div className="screen-header">
        <button className="back-btn" onClick={() => setCurrentScreen('completedLot')}>{'<'}</button>
        <h2 className="screen-title">Оставить отзыв {targetText}</h2>
      </div>
      
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <h3 style={{ margin: '0 0 4px 0' }}>Пользователю ID: {targetId}</h3>
        <p style={{ margin: 0, fontSize: '13px' }}>За лот "{selectedLot?.title}"</p>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '24px 0' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} onClick={() => setReviewRating(star)} style={{ fontSize: '40px', cursor: 'pointer', color: star <= reviewRating ? '#ffcc00' : '#ddd', lineHeight: '1' }}>★</span>
          ))}
        </div>
        
        <div className="form-group" style={{ textAlign: 'left' }}>
          <label className="form-label">Ваш комментарий</label>
          <textarea className="textarea-field" placeholder="Опишите ваши впечатления от сделки..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} style={{ minHeight: '120px' }}></textarea>
        </div>
        
        <button className="submit-btn" disabled={reviewRating === 0 || reviewText.trim() === ''} onClick={handleSubmitReview}>Опубликовать отзыв</button>
      </div>
    </div>
  );
}

export default WriteReview;