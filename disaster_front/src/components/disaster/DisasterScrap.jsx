import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DisasterScrap() {
  const [scrapList, setScrapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로그인 회원 ID 추출 (JWT Payload의 sub 필드 사용)
  const getLoginUserId = () => {
    const loginData = localStorage.getItem("login");
    if (!loginData) return null;
    try {
      const parsed = JSON.parse(loginData);
      return parsed.sub || parsed.id || parsed.memberId || null;
    } catch {
      return null;
    }
  };

  const memberId = getLoginUserId();

  useEffect(() => {
    const fetchMyScraps = async () => {
      if (!memberId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 내 스크랩 목록 API 호출
        const res = await axios.get(`http://localhost/disasterScrap/list/${memberId}`, {
          withCredentials: true
        });
        setScrapList(res.data);
      } catch (err) {
        console.error("내 스크랩 목록 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyScraps();
  }, [memberId]);

  // 스크랩 취소
  const handleRemoveScrap = async (e, disasterNo) => {
    e.stopPropagation(); // 카드 클릭 이벤트(상세 페이지 이동) 전파 방지
    if (!window.confirm("스크랩을 취소하시겠습니까?")) return;

    try {
      const params = new URLSearchParams();
      params.append('id', memberId);
      params.append('no', disasterNo);

      await axios.post(`http://localhost/disasterScrap/remove`, params, {
        withCredentials: true
      });
      
      setScrapList(prev => prev.filter(item => item.no !== disasterNo));
      alert("스크랩이 취소되었습니다.");
    } catch (err) {
      console.error("스크랩 삭제 실패:", err);
      alert("스크랩 취소 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>목록을 불러오는 중...</div>;
  }

  if (!memberId) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
          <h3>로그인이 필요한 서비스입니다.</h3>
          <button 
            onClick={() => navigate('/member/login')} 
            style={{ marginTop: '16px', padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      {/* 상단 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.75rem', color: '#1e293b' }}>📌 재난 정보 스크랩</h2>
        <button 
          onClick={() => navigate('/disasterCategory/list')}
          style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}
        >
          📋 카테고리로 이동
        </button>
      </div>

      {/* 리스트 영역 */}
      {scrapList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
          스크랩한 재난 정보가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {scrapList.map((item) => (
            <div
              key={item.scrapNo}
              onClick={() => navigate(`/disasterInfo/detail/${item.no}`)} // 재난 정보 PK(no)로 상세 이동
              style={{
                padding: '20px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'transform 0.1s, box-shadow 0.1s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  #{item.categoryName || '재난'}
                </span>
                <button
                  onClick={(e) => handleRemoveScrap(e, item.no)}
                  style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                >
                  ❌ 삭제
                </button>
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1e293b' }}>
                {item.title}
              </h3>

              <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {item.content && item.content.length > 100 
                  ? item.content.substring(0, 100) + '...' 
                  : item.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid #f8fafc', paddingTop: '10px' }}>
                <span>📍 <strong>발생 위치:</strong> {item.location || '정보 없음'}</span>
                <span>⭐ <strong>스크랩일:</strong> {item.scrapDate ? new Date(item.scrapDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}