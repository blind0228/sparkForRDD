import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface SidebarProps {
  onNewReportClick: () => void;
  onLogout: () => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewReportClick, onLogout, userRole = 'USER' }) => {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: '대시보드', icon: 'dashboard' },
    { to: '/map', label: '지도', icon: 'map' },
    { to: '/damages', label: '피해 데이터', icon: 'list_alt' },
  ];

  // 관리자용 메뉴 추가
  const adminItems = [
    { to: '/admin/data', label: '데이터 관리', icon: 'settings' },
    { to: '/admin/users', label: '사용자 관리', icon: 'group' },
  ];

  const renderLink = (item: { to: string; label: string; icon: string }) => (
    <NavLink
      key={item.to}
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-sm px-md py-sm rounded-lg transition-all active:scale-95 ${
          isActive
            ? 'text-primary font-bold border-r-4 border-primary bg-secondary-container/30'
            : 'text-on-surface-variant hover:bg-surface-container-low'
        }`
      }
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      <span className="font-body-md">{item.label}</span>
    </NavLink>
  );

  return (
    <aside className="w-sidebar_width h-screen fixed left-0 top-0 bg-surface-container-lowest border-r border-outline-variant shadow-sm z-50 flex flex-col py-lg px-md">
      <div className="mb-xl px-xs">
        <h1 className="font-display text-lg font-extrabold text-primary tracking-tight">도로 관리 시스템</h1>
        <p className="font-body text-xs text-on-surface-variant opacity-70">도로 시설물 유지보수</p>
      </div>

      <nav className="flex-grow space-y-base">
        {navItems.map(renderLink)}
        
        {userRole === 'ADMIN' && (
          <>
            <div className="pt-sm pb-xs px-md">
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">시스템 관리</span>
            </div>
            {adminItems.map(renderLink)}
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-lg space-y-md px-xs">
        <button
          onClick={onNewReportClick}
          className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold flex items-center justify-center gap-xs hover:opacity-90 transition-opacity active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          새 보고서 작성
        </button>
        <a
          href="#logout"
          onClick={handleLogout}
          className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-lg"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-md">로그아웃</span>
        </a>
      </div>
    </aside>
  );
};
