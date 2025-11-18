
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
        محاسبه‌گر حجم معاملات فارکس
      </h1>
      <p className="mt-2 text-lg text-gray-400">
        سیگنال خود را وارد کنید تا حجم معامله مناسب برای شما محاسبه شود.
      </p>
    </header>
  );
};
