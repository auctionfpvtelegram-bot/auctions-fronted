import { useEffect, useState } from 'react';
import './App.css';

// ⚡ 1. ИМПОРТ НАСТРОЕК (Больше никаких export const API_URL здесь!)
import { API_URL } from './config'; 

// ⚡ 2. ИМПОРТИРУЕМ ВСЕ ЭКРАНЫ
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

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedLot, setSelectedLot] = useState(null);
  const [favoriteLots, setFavoriteLots] = useState([]);
  
  const [publicProfileData, setPublicProfileData] = useState(null);
  const [publicProfileReferrer, setPublicProfileReferrer] = useState('home');

  const [alertData, setAlertData] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  
  const [currentUser, setCurrentUser] = useState({
    id: null, 
    firstName: 'Гость',
    rating: 0.0,
    dealsCount: 0,
    isBanned: false,
    banReason: null,
    banScope: null,
    banUntil: null
  });

  const isAdmin = String(currentUser.id) === '7688251487';

  const handleError = (errorText, location = 'App.jsx') => {
    setAlertData({ message: `❌ Произошла ошибка:\n${errorText}` });
    
    fetch(`${API_URL}/api/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        errorText: String(errorText), 
        userId: currentUser.id || 'До авторизации',
        location 
      })
    }).catch(e => console.error('Не удалось отправить ошибку админу', e));
  };

  const toggleFavorite = (lot) => {
    setFavoriteLots(prev => {
      const exists = prev.some(fav => fav.id === lot.id);
      if (exists) {
        return prev.filter(fav => fav.id !== lot.id);
      } else {
        return [...prev, lot];
      }
    });
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) { tg.ready(); tg.expand(); }
    
    const tgUser = tg?.initDataUnsafe?.user || { 
      id: '7688251487', 
      username: 'neffec', 
      first_name: 'Admin' 
    };

    fetch(`${API_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tgUser)
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP статус ${res.status}`);
        return res.json();
      })
      .then(user => {
        setCurrentUser({
          id: String(user.id),
          firstName: user.firstName || 'Гость',
          rating: user.rating || 0.0,
          dealsCount: user.dealsCount || 0,
          isBanned: user.isBanned,
          banReason: user.banReason,
          banScope: user.banScope,
          banUntil: user.banUntil
        });
      })
      .catch(err => {
        console.error("Ошибка авторизации:", err);
        handleError(err.message, 'Авторизация при старте');
      });
  }, []);

  const handleOpenPublicProfile = (userId, referrer) => {
    if (!userId) return;
    setPublicProfileReferrer(referrer);
    
    fetch(`${API_URL}/api/users/${userId}/public?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error('Пользователь не найден или сервер не ответил');
        return res.json();
      })
      .then(data => {
        setPublicProfileData(data);
        setCurrentScreen('publicProfile');
      })
      .catch(err => handleError(err.message, 'Загрузка публичного профиля'));
  };

  return (
    <>
      <div className="app-container">
        
         {/* ⚡ 3. РЕНДЕРИМ ВСЕ ЭКРАНЫ В ЗАВИСИМОСТИ ОТ currentScreen */}
         
         {currentScreen === 'home' && (
           <Home 
             setCurrentScreen={setCurrentScreen} 
             setSelectedLot={setSelectedLot} 
             favoriteLots={favoriteLots} 
             toggleFavorite={toggleFavorite} 
             isAdmin={isAdmin} 
           />
         )}

         {currentScreen === 'profile' && (
           <Profile 
             setCurrentScreen={setCurrentScreen} 
             currentUser={currentUser} 
             isAdmin={isAdmin} 
             setSelectedLot={setSelectedLot} 
             favoriteLots={favoriteLots} 
             toggleFavorite={toggleFavorite} 
             handleOpenPublicProfile={handleOpenPublicProfile} 
           />
         )}

         {currentScreen === 'activeLot' && (
           <ActiveLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} />
         )}

         {currentScreen === 'addLot' && (
           <AddLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} />
         )}

         {currentScreen === 'adminDashboard' && (
           <Admin setCurrentScreen={setCurrentScreen} currentUser={currentUser} />
         )}

         {currentScreen === 'completedLot' && (
           <CompletedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} />
         )}

         {currentScreen === 'feedback' && (
           <Feedback setCurrentScreen={setCurrentScreen} currentUser={currentUser} />
         )}

         {currentScreen === 'publicProfile' && (
           <PublicProfile setCurrentScreen={setCurrentScreen} currentUser={currentUser} publicProfileData={publicProfileData} referrer={publicProfileReferrer} />
         )}

         {currentScreen === 'rejectedLot' && (
           <RejectedLot setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} />
         )}

         {currentScreen === 'settings' && (
           <Settings setCurrentScreen={setCurrentScreen} currentUser={currentUser} />
         )}

         {currentScreen === 'writeReview' && (
           <WriteReview setCurrentScreen={setCurrentScreen} currentUser={currentUser} lot={selectedLot} />
         )}

      </div>
    </>
  );
}

export default App;