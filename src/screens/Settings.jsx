import React, { useState } from 'react';

function Settings({ setCurrentScreen }) {
  const [notifyNewLots, setNotifyNewLots] = useState(true);
  const [notifyBids, setNotifyBids] = useState(true);
  const [notifyEnding, setNotifyEnding] = useState(true);

  return (
    <div className="app-container">
      <div className="screen-header"><button className="back-btn" onClick={() => setCurrentScreen('profile')}>{'<'}</button><h2 className="screen-title">Настройки</h2></div>
      <div className="settings-list">
        <div className="setting-card"><p className="setting-title">Уведомления об отправке на модерацию / публикации</p><label className="toggle-switch"><input type="checkbox" checked={notifyNewLots} onChange={(e) => setNotifyNewLots(e.target.checked)} /><span className="toggle-slider"></span></label></div>
        <div className="setting-card"><p className="setting-title">Уведомления о том, что ставку перебили</p><label className="toggle-switch"><input type="checkbox" checked={notifyBids} onChange={(e) => setNotifyBids(e.target.checked)} /><span className="toggle-slider"></span></label></div>
        <div className="setting-card"><p className="setting-title">Уведомления о победе / завершении торгов</p><label className="toggle-switch"><input type="checkbox" checked={notifyEnding} onChange={(e) => setNotifyEnding(e.target.checked)} /><span className="toggle-slider"></span></label></div>
      </div>
    </div>
  );
}

export default Settings;