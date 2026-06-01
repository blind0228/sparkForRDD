import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const UserRegister: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('도로보수실무팀');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-lg">
      <div className="w-full max-w-[420px] bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-md flex flex-col">
        <div className="text-center mb-lg">
          <span className="material-symbols-outlined text-[48px] text-primary mb-xs">
            person_add
          </span>
          <h2 className="font-display text-2xl font-extrabold text-on-surface">시스템 이용 등록 신청</h2>
          <p className="font-body text-xs text-on-surface-variant opacity-70 mt-base">
            도로 시설물 관리를 위해 신규 사원 계정 승인을 신청하십시오.
          </p>
        </div>

        {success ? (
          <div className="p-lg bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-200 border border-green-200 rounded-xl text-center space-y-sm">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
            <p className="text-xs font-bold">등록 신청 완료!</p>
            <p className="text-[10px] text-on-surface-variant">
              관리자 검토 후 계정이 활성화됩니다. 로그인 화면으로 이동합니다...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-md">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">성명</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="성명을 입력하세요"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">이메일 주소</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="회사 이메일을 입력하세요"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">부서 소속</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface cursor-pointer"
              >
                <option value="시설유지보수팀">시설유지보수팀 (HQ)</option>
                <option value="도로보수실무팀">도로보수실무팀 (현장)</option>
                <option value="시설관제운영팀">시설관제운영팀 (상황실)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-xs">비밀번호 설정</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="접속 비밀번호 입력"
                className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
              />
            </div>

            <div className="pt-xs flex flex-col gap-sm">
              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-xs"
              >
                등록 신청 제출
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant py-sm rounded-lg font-bold hover:bg-surface-container-low transition-colors text-xs active:scale-95"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
