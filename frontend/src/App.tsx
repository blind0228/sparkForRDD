import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { UserRegister } from './pages/UserRegister';
import { Dashboard } from './pages/Dashboard';
import { MapMode } from './pages/MapMode';
import { DataList } from './pages/DataList';
import { AdminData } from './pages/AdminData';
import { AdminUsers } from './pages/AdminUsers';

interface UserSession {
  name: string;
  role: string;
  dept: string;
}

function App() {
  // 인증 관리
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('rdd_session');
    return saved ? JSON.parse(saved) : null;
  });

  // 모달 제어
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDamageType, setNewDamageType] = useState('D20');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newImageX, setNewImageX] = useState('');
  const [newImageY, setNewImageY] = useState('');

  const handleLogin = (session: UserSession) => {
    setUser(session);
    localStorage.setItem('rdd_session', JSON.stringify(session));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
    setUser(null);
    localStorage.removeItem('rdd_session');
  };

  // 데이터 추가 핸들러
  const handleAddDamage = async (newD: any) => {
    try {
      const res = await fetch('/api/damages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newD),
      });

      if (res.ok) {
        // 데이터 추가 성공
      }
    } catch (error) {
      console.error('데이터 저장 실패:', error);
    }
  };

  // 데이터 삭제 핸들러
  const handleDeleteDamage = async (id: number) => {
    try {
      const res = await fetch(`/api/damages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // 데이터 삭제 성공
      }
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
    }
  };

  // 모달을 통한 피해 보고서 제출
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newLat);
    const lng = parseFloat(newLng);
    const imgX = parseFloat(newImageX);
    const imgY = parseFloat(newImageY);

    if (isNaN(lat) || isNaN(lng) || isNaN(imgX) || isNaN(imgY)) {
      alert('올바른 좌표를 입력하세요.');
      return;
    }

    handleAddDamage({
      damageType: newDamageType,
      latitude: lat,
      longitude: lng,
      imageX: imgX,
      imageY: imgY,
    });

    setIsModalOpen(false);
    setNewLat('');
    setNewLng('');
    setNewImageX('');
    setNewImageY('');
  };

  // 보호된 라우터 (Protected Route)
  const ProtectedLayout = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }

    return (
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <Sidebar
          onNewReportClick={() => setIsModalOpen(true)}
          onLogout={handleLogout}
          userRole={user.role}
        />
        
        {/* Main Content Side */}
        <div className="flex-grow ml-sidebar_width flex flex-col min-h-screen pt-16">
          <Header
            userName={user.name}
            userDept={user.dept}
          />
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        {/* 비인증 라우팅 */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<UserRegister />} />

        {/* 보호된 라우팅 */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedLayout>
              <MapMode />
            </ProtectedLayout>
          }
        />
        <Route
          path="/damages"
          element={
            <ProtectedLayout>
              <DataList />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin/data"
          element={
            <ProtectedLayout requireAdmin={true}>
              <AdminData
                onAddDamage={handleAddDamage}
                onDeleteDamage={handleDeleteDamage}
              />
            </ProtectedLayout>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedLayout requireAdmin={true}>
              <AdminUsers />
            </ProtectedLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 새 보고서 작성 공통 모달 (Level 3 Elevation) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="w-full max-w-[440px] bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-xl flex flex-col space-y-md">
            <div className="flex justify-between items-center border-b border-outline-variant pb-md">
              <h3 className="font-display text-md font-bold text-on-surface">새 도로 피해 보고서 작성</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-md">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-xs">피해 손상 유형</label>
                <select
                  value={newDamageType}
                  onChange={(e) => setNewDamageType(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface cursor-pointer"
                >
                  <option value="D00">D00 (종방향 균열)</option>
                  <option value="D10">D10 (횡방향 균열)</option>
                  <option value="D20">D20 (포트홀)</option>
                  <option value="D40">D40 (심각한 파손)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-xs">위도 (Latitude)</label>
                <input
                  type="text"
                  required
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="예: 37.525"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-xs">경도 (Longitude)</label>
                <input
                  type="text"
                  required
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="예: 126.924"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-xs">이미지 내 파손 좌표 X</label>
                <input
                  type="text"
                  required
                  value={newImageX}
                  onChange={(e) => setNewImageX(e.target.value)}
                  placeholder="예: 320"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-xs">이미지 내 파손 좌표 Y</label>
                <input
                  type="text"
                  required
                  value={newImageY}
                  onChange={(e) => setNewImageY(e.target.value)}
                  placeholder="예: 240"
                  className="w-full px-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-on-surface"
                />
              </div>

              <div className="pt-sm flex gap-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-surface-container-lowest text-on-surface-variant border border-outline-variant py-sm rounded-lg font-bold hover:bg-surface-container-low transition-colors text-xs active:scale-95"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-primary text-on-primary py-sm rounded-lg font-bold text-xs hover:opacity-90 transition-opacity active:scale-95"
                >
                  보고서 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
