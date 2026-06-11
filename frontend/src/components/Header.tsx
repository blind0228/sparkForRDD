import React from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  userName?: string;
  userDept?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  userName = '김관리 선임',
  userDept = '시설유지보수팀',
}) => {
  return (
    <header className="h-16 fixed top-0 right-0 z-40 bg-surface border-b border-outline-variant flex justify-between items-center w-[calc(100%-260px)] px-lg">
      <div className="flex items-center gap-md">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full w-80 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:outline-none"
            placeholder="시설물 또는 지역 검색..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-md text-on-surface-variant">
          <button className="hover:bg-surface-variant p-2 rounded-full transition-all cursor-pointer flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:bg-surface-variant p-2 rounded-full transition-all cursor-pointer flex items-center justify-center">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        
        <div className="flex items-center gap-sm pl-4 border-l border-outline-variant">
          <div className="text-right">
            <p className="font-bold text-xs text-on-surface">{userName}</p>
            <p className="text-[11px] text-on-surface-variant">{userDept}</p>
          </div>
          <img
            alt="관리자 프로필"
            className="w-8 h-8 rounded-full bg-secondary-container object-cover border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHSTjkKyD7Ka9UcJ4JtV6MUvOZufSmJrLkJQaCQIepz8olf03J3aPBXmCWopAf6y_oCN_7IrOSR2DmOuq6RVA0Bl-3ekAEdALKRpJwynRkB-0nyFGrDoh-TtU-WPqYEt3ymAUTSjw6V2ni6-V24TsdMGSToOppYcKDUxpgO3LhugM6TPXtARNeuDia1BuwOmOCcdfDxwBU4aZ8b-JY5BmKXrZLAIISrLMlIToKYsL3gcIdSNUHegLRQdXuA9kTj97etPWMcsgPNLA"
          />
        </div>
      </div>
    </header>
  );
};
