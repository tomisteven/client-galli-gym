import React, { useEffect } from 'react';

const KioskModeToggle = () => {
  const toggleKioskMode = () => {
    document.body.classList.toggle('kiosk-mode');
    localStorage.setItem('kioskMode', document.body.classList.contains('kiosk-mode'));
  };

  useEffect(() => {
    if (localStorage.getItem('kioskMode') === 'true') {
      document.body.classList.add('kiosk-mode');
    }
  }, []);

  return (
    <div className="kiosk-toggle">
      <label>
        <input
          type="checkbox"
          onChange={toggleKioskMode}
          defaultChecked={localStorage.getItem('kioskMode') === 'true'}
        />
        Modo Kiosko
      </label>
    </div>
  );
};

export default KioskModeToggle;