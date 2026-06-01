import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: { name: string; role: string; dept: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (res.ok) {
        // 성공 시 세션 정보 설정
        // 실제 운영 환경에서는 별도의 /api/user/me 등을 통해 정보를 가져오는 것이 좋으나,
        // 여기서는 요구사항에 맞춰 어드민 계정 정보를 수동으로 매핑합니다.
        const isAdmin = username === 'admin@example.com';
        onLogin({ 
          name: isAdmin ? '관리자' : '일반사용자', 
          role: isAdmin ? 'ADMIN' : 'USER', 
          dept: isAdmin ? '시스템관리팀' : '도로유지팀' 
        });
        navigate('/');
      } else {
        setError('아이디 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (err) {
      console.error('로그인 중 오류 발생:', err);
      setError('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-lg">
      <div className="w-full max-w-[420px] bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-md flex flex-col">
        <div className="text-center mb-lg">
          <span className="material-symbols-outlined text-[48px] text-primary mb-xs">
            local_shipping
          </span>
          <h2 className="font-display text-2xl font-extrabold text-on-surface">도로 손상 통합 관리 시스템</h2>
          <p className="font-body text-xs text-on-surface-variant opacity-70 mt-base">
            Road Damage Detection & Management System
          </p>
        </div>

        {error && (
          <div className="mb-md p-sm bg-error/10 border border-error/20 text-error rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-xs">
              아이디
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요 (admin@example.com)"
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all focus:outline-none text-on-surface"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-xs">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요 (1234)"
              className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all focus:outline-none text-on-surface"
            />
          </div>

          <div className="pt-xs">
            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-95 flex items-center justify-center gap-xs"
            >
              로그인
            </button>
          </div>
        </form>

        <div className="mt-lg border-t border-outline-variant pt-md text-center">
          <p className="text-[11px] text-on-surface-variant">
            계정이 없으신가요? 관리자에게 요청하여 신규 등록을 진행하십시오.
          </p>
        </div>
      </div>
    </div>
  );
};
