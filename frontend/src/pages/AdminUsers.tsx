import React, { useState } from 'react';

interface SystemUser {
  id: number;
  name: string;
  role: string;
  dept: string;
  joinedAt: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([
    { id: 1, name: '김관리 선임', role: 'ADMIN', dept: '시설유지보수팀', joinedAt: '2025-01-10' },
    { id: 2, name: '이보수 사원', role: 'USER', dept: '도로보수실무팀', joinedAt: '2025-05-15' },
    { id: 3, name: '정승호 선임', role: 'USER', dept: '시설관제운영팀', joinedAt: '2025-02-20' },
  ]);

  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [dept, setDept] = useState('도로보수실무팀');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newUser: SystemUser = {
      id: Date.now(),
      name,
      role,
      dept,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setUsers([newUser, ...users]);
    setName('');
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('해당 사용자의 계정 권한을 해제하시겠습니까?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-lg space-y-lg">
      {/* Title */}
      <div>
        <h2 className="font-display text-2xl font-bold text-on-surface">사용자 권한 관리</h2>
        <p className="text-on-surface-variant text-sm">도로 관리 시스템에 액세스 가능한 임직원 명부 및 직급 제어판입니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* User Addition */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm space-y-md">
          <h3 className="font-headline text-md font-bold text-on-surface">신규 직원 액세스 권한 등록</h3>
          <form onSubmit={handleAddUser} className="space-y-md">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">성명</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">부서 소속</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
              >
                <option value="시설유지보수팀">시설유지보수팀</option>
                <option value="도로보수실무팀">도로보수실무팀</option>
                <option value="시설관제운영팀">시설관제운영팀</option>
                <option value="행정지원처">행정지원처</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">시스템 역할 권한</label>
              <div className="flex gap-md pt-xs">
                <label className="flex items-center gap-xs text-xs text-on-surface font-semibold">
                  <input
                    type="radio"
                    name="role"
                    value="USER"
                    checked={role === 'USER'}
                    onChange={() => setRole('USER')}
                    className="text-primary focus:ring-primary/10"
                  />
                  일반 사용자 (USER)
                </label>
                <label className="flex items-center gap-xs text-xs text-on-surface font-semibold">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                    className="text-primary focus:ring-primary/10"
                  />
                  관리자 (ADMIN)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-xs"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              사원 계정 생성
            </button>
          </form>
        </div>

        {/* User List */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-lg border-b border-outline-variant bg-surface-container-low/20">
            <h3 className="font-headline text-md font-bold text-on-surface">액세스 허가자 명단</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold border-b border-outline-variant">
                <tr>
                  <th className="px-lg py-sm">사원명</th>
                  <th className="px-lg py-sm">부서</th>
                  <th className="px-lg py-sm">권한 레벨</th>
                  <th className="px-lg py-sm">가입 일자</th>
                  <th className="px-lg py-sm">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-primary-container/5 transition-colors">
                    <td className="px-lg py-md font-semibold text-xs text-on-surface">{u.name}</td>
                    <td className="px-lg py-md text-xs text-on-surface-variant">{u.dept}</td>
                    <td className="px-lg py-md">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          u.role === 'ADMIN' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-lg py-md text-xs text-on-surface-variant">{u.joinedAt}</td>
                    <td className="px-lg py-md">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-error hover:underline text-xs font-bold"
                      >
                        해제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
