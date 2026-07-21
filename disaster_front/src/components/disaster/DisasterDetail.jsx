import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DisasterDetail() {
  const { id } = useParams(); // 재난 정보 PK (disasterNo)
  const navigate = useNavigate();

  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);

  // 스크랩 상태
  const [isScraped, setIsScraped] = useState(false);
  const [scrapLoading, setScrapLoading] = useState(false);

  // TopNavi와 동일하게 localStorage의 "login" JSON 객체에서 id 추출
  const getLoginUserId = () => {
    const loginData = localStorage.getItem("login");
    if (!loginData) return null;
    try {
      const parsed = JSON.parse(loginData);
      return parsed.sub || parsed.id || parsed.memberId || null; // 객체 내 id 필드
    } catch {
      return null;
    }
  };

  const memberId = getLoginUserId();

  useEffect(() => {
    const fetchDataAndScrapStatus = async () => {
      try {
        setLoading(true);

        // 1. 재난 상세 정보 조회
        const detailRes = await axios.get(`http://localhost/disasterInfo/detail/${id}`, {
          withCredentials: true
        });
        setDisaster(detailRes.data);

        // 2. 로그인 유저가 존재하면 스크랩 여부 확인
        if (memberId) {
          const checkRes = await axios.get(`http://localhost/disasterScrap/check`, {
            params: { id: memberId, no: id },
            withCredentials: true
          });
          setIsScraped(checkRes.data);
        }

      } catch (err) {
        console.error("상세 정보 또는 스크랩 상태 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDataAndScrapStatus();
    }
  }, [id, memberId]);

  // 스크랩 토글 (추가/취소)
  const handleToggleScrap = async () => {
    if (!memberId) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/member/login");
      return;
    }

    try {
      setScrapLoading(true);
      const params = new URLSearchParams();
      params.append('id', memberId);
      params.append('no', id);

      if (isScraped) {
        // 스크랩 취소
        await axios.post(`http://localhost/disasterScrap/remove`, params, {
          withCredentials: true
        });
        setIsScraped(false);
        alert("스크랩이 취소되었습니다.");
      } else {
        // 스크랩 추가
        await axios.post(`http://localhost/disasterScrap/add`, params, {
          withCredentials: true
        });
        setIsScraped(true);
        alert("스크랩에 추가되었습니다.");
      }
    } catch (err) {
      console.error("스크랩 처리 중 오류 발생:", err);
      alert(err.response?.data?.message || "스크랩 처리에 실패했습니다.");
    } finally {
      setScrapLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>상세 정보를 불러오는 중...</div>;
  }

  if (!disaster) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>해당 재난 정보를 찾을 수 없습니다.</h3>
        <button onClick={() => navigate(-1)} style={{ marginTop: '16px', padding: '8px 16px' }}>
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      {/* 상세 카드 영역 */}
      <div
        style={{
          padding: '30px',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}
      >
        {/* 카테고리 및 발생 일시 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ color: '#6366f1', fontWeight: 'bold', fontSize: '1rem', background: '#eef2ff', padding: '4px 12px', borderRadius: '20px' }}>
            #{disaster.catName || '재난'}
          </span>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            발생일시: {disaster.disasterDate ? new Date(disaster.disasterDate).toLocaleString() : '-'}
          </span>
        </div>

        {/* 제목 */}
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.6rem', color: '#1e293b', lineHeight: '1.4' }}>
          {disaster.title}
        </h2>

        {/* 발생 위치 */}
        <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '24px', color: '#475569', fontSize: '0.95rem' }}>
          📍 <strong>발생 위치:</strong> {disaster.location || '위치 정보 없음'}
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '24px 0' }} />

        {/* 본문 내용 */}
        <div style={{ fontSize: '1.05rem', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '30px' }}>
          {disaster.content}
        </div>

        {/* 하단 버튼 그룹 (스크랩하기 / 카테고리로 돌아가기 / 목록으로 돌아가기) */}
        <div 
          style={{ 
            display: 'flex', 
            justify: 'center', 
            alignItems: 'center', 
            gap: '12px', 
            paddingTop: '20px', 
            borderTop: '1px solid #f1f5f9',
            flexWrap: 'wrap'
          }}
        >
          {/* 스크랩 버튼 */}
          <button
            onClick={handleToggleScrap}
            disabled={scrapLoading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: isScraped ? '1px solid #ef4444' : '1px solid #cbd5e1',
              backgroundColor: isScraped ? '#fef2f2' : '#ffffff',
              color: isScraped ? '#ef4444' : '#475569',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            {isScraped ? '❤️ 스크랩 취소' : '🤍 스크랩하기'}
          </button>

          {/* 카테고리로 돌아가기 */}
          <button
            onClick={() => navigate('/disasterCategory/list')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            📋 카테고리로 돌아가기
          </button>

          {/* 목록으로 돌아가기 */}
          <button
            onClick={() => {
              if (disaster.catid) {
                navigate(`/disasterInfo/list/${disaster.catid}`);
              } else {
                navigate(-1);
              }
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              color: '#475569',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            ← 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}