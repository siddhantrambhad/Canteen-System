import React, { useState, useEffect } from 'react';

export default function ChatbotWindow() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpen);
    return () => window.removeEventListener('open-chatbot', handleOpen);
  }, []);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={toggleOpen}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2c5282',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Open Chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Backdrop overlay for mobile (optional) */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 9998,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Window / Drawer */}
      <div
        style={{
          position: 'fixed',
          bottom: '100px',
          right: isOpen ? '24px' : '-450px',
          width: '400px',
          height: '600px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 9999,
          transition: 'right 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        <iframe
          src="/chatbot/index.html"
          title="Canteen Chatbot"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </div>
    </>
  );
}
