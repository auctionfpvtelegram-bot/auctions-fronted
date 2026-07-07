import { useEffect, useState } from 'react';
import './App.css';
import { API_URL } from './config';
import Home from './screens/Home';
import Profile from './screens/Profile';
import ActiveLot from './screens/ActiveLot';
import AddLot from './screens/AddLot';
import Admin from './screens/Admin';
import CompletedLot from './screens/CompletedLot';
import Feedback from './screens/Feedback';
import PublicProfile from './screens/PublicProfile';
import RejectedLot from './screens/RejectedLot';
import Settings from './screens/Settings';
import WriteReview from './screens/WriteReview';
import TicketHistory from './screens/TicketHistory';
import NotificationsPanel from './screens/NotificationsPanel';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedLot, setSelectedLot] = useState(null);
  const [favoriteLots, setFavoriteLots] = useState([]);
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [publicProfileReferrer, setPublicProfileReferrer] = useState('home');
  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [globalBanner, setGlobalBanner] = useState({ isBannerOn: false, bannerText: '', bannerLink: '' });

  const [currentUser, setCurrentUser] = useState({
    id: null, firstName: 'Гость', rating: 0.0, dealsCount: 0,
    isBanned: false, banUntil: null, banReason: null, banScope: null,
    customName: null, avatarUrl: null, profileStatus: 'APPROVED', profileRejectReason: null
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // ⚡ ФУНКЦИЯ ДЛЯ МГНОВЕННОГО ОБНОВЛЕНИЯ ДАННЫХ ПРОФИЛЯ ПОСЛЕ ИЗМЕНЕНИЙ
  const refreshCurrentUser = () => {
    if (!currentUser.id) return;
    fetch(`${API_URL}/api/users/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setCurrentUser(prev => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const initDataUnsafe = tg.initDataUnsafe || {};
      const tgUser = initDataUnsafe.user || {};

      if (tgUser.id) {
        const userIdStr = String(tgUser.id);
        fetch(`${API_URL}/api/auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userIdStr,
            username: tgUser.username || '',
            firstName: tgUser.first_name || ''
          })
        })
        .then(res => res.json())
        .then(data => {
          setCurrentUser(data.user);
          setIsAdmin(data.isAdmin);
          if (data.favoriteLots) setFavoriteLots(data.favoriteLots);
          if (data.notifications) setNotifications(data.notifications);
        })
        .catch(() => {
          setCurrentUser({
            id: userIdStr,
            firstName: tgUser.first_name || 'Пользователь',
            rating: 4.8, dealsCount: 12, isBanned: false,
            customName: null, avatarUrl: null, profileStatus: 'APPROVED', profileRejectReason: null
          });
        });
      } else {
        setCurrentUser({
          id: '12345678', firstName: 'Тест Локально', rating: 4.9, dealsCount: 5,
          isBanned: false, customName: null, avatarUrl: null, profileStatus: 'APPROVED', profileRejectReason: null
        });
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/system-settings`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setGlobalBanner(data);
      })
      .catch(() => {});
  }, [currentScreen]);

  const toggleFavorite = (lot) => {
    if (!currentUser.id) return;
    const isFav = favoriteLots.some(fav => fav.id === lot.id);
    const method = isFav ? 'DELETE' : 'POST';

    fetch(`${API_URL}/api/favorites`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, lotId: lot.id })
    })
    .then(res => res.json())
    .then(data => {
      setFavoriteLots(data.favoriteLots || []);
    })
    .catch(() => {});
  };

  const handleOpenPublicProfile = (targetId, referrerScreen) => {
    if (!targetId) return;
    fetch(`${API_URL}/api/users/${targetId}/public-profile`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setPublicProfileData(data);
          setPublicProfileReferrer(referrerScreen);
          setCurrentScreen('publicProfile');
        }
      })
      .catch(() => {});
  };

  return (
    <div className="app">
      {globalBanner.isBannerOn && globalBanner.bannerText && (
        <div className="global-announcement" onClick={() => globalBanner.bannerLink && window.open(globalBanner.bannerLink, '_blank')}>
          📢 {globalBanner.bannerText}
        </div>
      )}

      <div className="notification-icon-container" onClick={() => setIsNotifOpen(true)}>
        🔔 {notifications.filter(n => !n.isRead).length > 0 && <span className="notif-badge" />}
      </div>

      {isNotifOpen && (
        <NotificationsPanel 
          notifications={notifications} 
          setNotifications={setNotifications} 
          onClose={() => setIsNotifOpen(false)} 
          API_URL={API_URL} 
          userId={currentUser.id} 
        />
      )}

      {alertData && (
        <div className="modal-overlay">
          <div className="custom-alert-box">
            <p className="alert-message-content">{alertData.message}</p>
            <button className="alert-confirm-btn" onClick={() => { alertData.onClose(); setAlertData(null); }}>OK</button>
          </div>
        </div>
      )}

      {confirmData && (
        <div className="modal-overlay">
          <div className="custom-alert-box">
            <p className="alert-message-content">{confirmData.message}</p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', width: '100%' }}>
              <button className="confirm-yes-btn" onClick={() => { confirmData.onConfirm(); setConfirmData(null); }}>Да</button>
              <button className="confirm-no-btn" onClick={() => { confirmData.onCancel(); setConfirmData(null); }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ ВЕРНУЛИ КЛАССИЧЕСКИЙ РЕНДЕР (Чтобы не ломался CSS/Flexbox) */}
      {currentScreen === 'home' && <Home setCurrentScreen={setCurrentScreen} setSelectedLot={setSelectedLot} favoriteLots={favoriteLots} toggleFavorite={toggleFavorite} currentUser={currentUser} />}
      {currentScreen === 'profile' && <Profile setCurrentScreen={setCurrentScreen} currentUser={currentUser} isAdmin={isAdmin} setSelectedLot={setSelectedLot} favoriteLots={favoriteLots} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'settings' && <Settings setCurrentScreen={setCurrentScreen} currentUser={currentUser} setAlertData={setAlertData} refreshCurrentUser={refreshCurrentUser} />}
      
      {currentScreen === 'activeLot' && <ActiveLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} selectedLot={selectedLot} isFavorite={favoriteLots.some(fav => fav.id === selectedLot?.id)} toggleFavorite={toggleFavorite} setAlertData={setAlertData} setConfirmData={setConfirmData} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'addLot' && <AddLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'adminDashboard' && <Admin setCurrentScreen={setCurrentScreen} currentUser={currentUser} setAlertData={setAlertData} setConfirmData={setConfirmData} />}
      {currentScreen === 'completedLot' && <CompletedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} selectedLot={selectedLot} isFavorite={favoriteLots.some(fav => fav.id === selectedLot?.id)} toggleFavorite={toggleFavorite} handleOpenPublicProfile={handleOpenPublicProfile} />}
      {currentScreen === 'feedback' && <Feedback setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
      {currentScreen === 'publicProfile' && <PublicProfile setCurrentScreen={setCurrentScreen} currentUser={currentUser} publicProfileData={publicProfileData} referrer={publicProfileReferrer} />}
      {currentScreen === 'rejectedLot' && <RejectedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} setAlertData={setAlertData} />}
      {currentScreen === 'writeReview' && <WriteReview setCurrentScreen={setCurrentScreen} currentUser={currentUser} selectedLot={selectedLot} setAlertData={setAlertData} />}
      {currentScreen === 'ticketHistory' && <TicketHistory setCurrentScreen={setCurrentScreen} currentUser={currentUser} />}
    </div>
  );
}

export default App;