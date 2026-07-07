import React, { useState, useRef } from 'react';

export function UniversalUploadModal({ isOpen, onClose, type, onUploadSuccess, setAlertData }) {
  if (!isOpen) return null;

  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Настройки размеров и пропорций под каждый тип данных
  const configs = {
    avatar: { title: 'Обновление аватарки', maxDim: 400, isRound: true, desc: 'Фото сожмется в легкий JPEG для быстрого отображения в профиле.' },
    lot: { title: 'Добавление фото к лоту', maxDim: 1080, isRound: false, desc: 'Оптимальное качество для детального просмотра покупателями.' },
    chat: { title: 'Отправка изображения в чат', maxDim: 800, isRound: false, desc: 'Быстрая отправка облегченной картинки вашему собеседнику.' }
  };

  const currentConfig = configs[type] || configs.chat;

  // Универсальный компрессор картинок
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDimension = currentConfig.maxDim;

        // Рассчитываем пропорции сжатия сторон
        if (width > height && width > maxDimension) {
          height *= maxDimension / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width *= maxDimension / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в JPEG с оптимизацией веса (80% качества)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(compressedBase64);
        setIsProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!preview) return;
    onUploadSuccess(preview);
    setPreview(null);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '380px', textAlign: 'center', boxSizing: 'border-box', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
        
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>{currentConfig.title}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{currentConfig.desc}</p>

        {/* Интерактивное окно предпросмотра */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {isProcessing ? (
            <div style={{ width: '120px', height: '120px', borderRadius: currentConfig.isRound ? '50%' : '12px', border: '3px solid #f3f3f3', borderTop: '3px solid #1976d2', animation: 'spin 1s linear infinite', boxSizing: 'border-box' }} />
          ) : preview ? (
            <img src={preview} alt="preview" style={{ width: '120px', height: '120px', borderRadius: currentConfig.isRound ? '50%' : '12px', objectFit: 'cover', border: '2px solid #1976d2' }} />
          ) : (
            <div onClick={() => fileInputRef.current.click()} style={{ width: '120px', height: '120px', borderRadius: currentConfig.isRound ? '50%' : '12px', background: '#f5f5f5', border: '2px dashed #ccc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#666' }}>
              <span style={{ fontSize: '24px' }}>📸</span>
              <span style={{ fontSize: '11px', marginTop: '4px' }}>Выбрать фото</span>
            </div>
          )}
        </div>

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        {/* Кнопки управления */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleConfirm} disabled={!preview || isProcessing} style={{ flex: 1, height: '42px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', opacity: preview ? 1 : 0.5 }}>
            Подтвердить
          </button>
          <button onClick={() => { setPreview(null); onClose(); }} style={{ width: '100px', height: '42px', background: '#eee', color: '#333', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
            Отмена
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}