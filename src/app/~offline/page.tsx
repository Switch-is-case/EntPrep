import React from "react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 4.978 4.978 0 011.414-3.536m-1.414 3.536L4 21M8.464 8.464a5 5 0 017.072 0"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-text mb-4 font-display">Вы не в сети</h1>
      <p className="text-text-secondary max-w-md mb-8">
        Похоже, у вас пропало соединение с интернетом. 
        Некоторые функции приложения могут быть недоступны до восстановления связи.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 active:scale-95"
      >
        Попробовать снова
      </button>
    </div>
  );
}
