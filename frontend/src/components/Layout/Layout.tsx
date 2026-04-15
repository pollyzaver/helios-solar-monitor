import * as React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navItems = [
    { path: '/', label: 'Дашборд', icon: '📊' },
    { path: '/charts', label: 'Графики', icon: '📈' },
    { path: '/alerts', label: 'Оповещения', icon: '🚨' },
    { path: '/settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-helios-card/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">☀️</span>
              <span className="text-xl font-bold bg-gradient-to-r from-helios-sun to-yellow-400 bg-clip-text text-transparent">
                Helios
              </span>
            </div>
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-helios-sun/20 text-helios-sun border-b-2 border-helios-sun'
                        : 'text-helios-text-secondary hover:text-helios-text hover:bg-white/5'
                    }`
                  }
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full bg-helios-sun/20 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-helios-card/40 border-t border-white/5 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-helios-text-secondary text-sm">
          Helios — мониторинг солнечных панелей в реальном времени
        </div>
      </footer>
    </div>
  );
};

export default Layout;