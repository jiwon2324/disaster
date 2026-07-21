import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DisasterScrap() {
  const [scrapList, setScrapList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleRemoveScrap = async (e, disasterNo) => {
    e.stopPropagation();
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

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-light">
        {/* Header */}
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <div className="d-flex justify-content-between align-items-center position-relative px-3">
            <div className="w-100 text-center">
              <h2 className="fw-bold text-primary mb-0">
                <i className="bi bi-bookmark-star-fill me-2"></i>재난 정보 스크랩
              </h2>
            </div>
            <button 
              onClick={() => navigate('/disasterCategory/list')}
              className="btn btn-outline-secondary btn-sm position-absolute end-0 me-3 fw-bold"
            >
              📋 카테고리로 이동
            </button>
          </div>
          <hr className="text-secondary opacity-25 mt-3 mb-0" />
        </div>

        {/* Body */}
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5 text-muted">목록을 불러오는 중...</div>
          ) : !memberId ? (
            <div className="text-center py-5 bg-light rounded-3 color-secondary">
              <h5 className="fw-bold mb-3">로그인이 필요한 서비스입니다.</h5>
              <button 
                onClick={() => navigate('/member/login')} 
                className="btn btn-primary btn-sm px-4 fw-bold"
              >
                로그인하러 가기
              </button>
            </div>
          ) : scrapList.length === 0 ? (
            <div className="text-center py-5 text-muted bg-light rounded-3">
              스크랩한 재난 정보가 없습니다.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {scrapList.map((item) => (
                <div
                  key={item.scrapNo}
                  onClick={() => navigate(`/disasterInfo/detail/${item.no}`)}
                  className="p-3 border rounded-3 bg-white shadow-sm hover-shadow"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary fw-bold">
                      #{item.categoryName || '재난'}
                    </span>
                    <button
                      onClick={(e) => handleRemoveScrap(e, item.no)}
                      className="btn btn-link text-danger p-0 text-decoration-none fw-bold small"
                    >
                      ❌ 삭제
                    </button>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">
                    {item.title}
                  </h5>

                  <p className="text-secondary small mb-3 text-truncate" style={{ maxWidth: '100%' }}>
                    {item.content && item.content.length > 100 
                      ? item.content.substring(0, 100) + '...' 
                      : item.content}
                  </p>

                  <div className="d-flex justify-content-between small text-muted border-top pt-2">
                    <span>📍 <strong>발생 위치:</strong> {item.location || '정보 없음'}</span>
                    <span>⭐ <strong>스크랩일:</strong> {item.scrapDate ? new Date(item.scrapDate).toLocaleDateString() : '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer bg-white border-0 pb-4 text-center text-muted small">
          저장한 주요 재난 정보를 신속하게 확인하세요.
        </div>
      </div>
    </div>
  );
}