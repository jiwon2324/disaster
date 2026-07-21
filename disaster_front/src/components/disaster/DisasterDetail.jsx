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

  // localStorage의 "login" JSON 객체에서 id 추출
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

      const targetUrl = isScraped 
        ? `http://localhost/disasterScrap/remove` 
        : `http://localhost/disasterScrap/add`;

      const res = await axios.post(targetUrl, params, {
        withCredentials: true
      });

      if (res.data.success) {
        setIsScraped(!isScraped);
        alert(res.data.message);
      } else {
        alert(res.data.message || "처리에 실패했습니다.");
      }
    } catch (err) {
      console.error("스크랩 처리 중 오류 발생:", err);
      alert(err.response?.data?.message || "스크랩 처리에 실패했습니다.");
    } finally {
      setScrapLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-light">
        {/* Header 영역 */}
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-info-circle-fill me-2"></i>재난 상세 정보
          </h2>
          <hr className="text-secondary opacity-25 mt-3 mb-0" />
        </div>

        {/* Body 영역 */}
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5 text-muted">상세 정보를 불러오는 중...</div>
          ) : !disaster ? (
            <div className="text-center py-5">
              <h5 className="text-muted mb-3">해당 재난 정보를 찾을 수 없습니다.</h5>
              <button 
                onClick={() => navigate(-1)} 
                className="btn btn-outline-secondary btn-sm fw-bold"
              >
                뒤로 가기
              </button>
            </div>
          ) : (
            <div>
              {/* 카테고리 및 발생 일시 */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="badge bg-primary-subtle text-primary fs-6 px-3 py-2 fw-bold">
                  #{disaster.catName || '재난'}
                </span>
                <span className="text-muted small">
                  <strong>발생일시:</strong> {disaster.disasterDate ? new Date(disaster.disasterDate).toLocaleString() : '-'}
                </span>
              </div>

              {/* 제목 */}
              <h3 className="fw-bold text-dark mb-3" style={{ lineHeight: '1.4' }}>
                {disaster.title}
              </h3>

              {/* 발생 위치 */}
              <div className="p-3 bg-light rounded-3 mb-4 text-secondary">
                📍 <strong>발생 위치:</strong> {disaster.location || '위치 정보 없음'}
              </div>

              <hr className="text-secondary opacity-25 my-4" />

              {/* 본문 내용 */}
              <div 
                className="text-dark mb-4 fs-6" 
                style={{ lineHeight: '1.8', whiteSpace: 'pre-line', minHeight: '150px' }}
              >
                {disaster.content}
              </div>

              {/* 하단 버튼 그룹 */}
              <div className="d-flex justify-content-center align-items-center gap-2 pt-3 border-top flex-wrap">
                {/* 스크랩 버튼 */}
                <button
                  onClick={handleToggleScrap}
                  disabled={scrapLoading}
                  className={`btn ${isScraped ? 'btn-danger' : 'btn-outline-secondary'} fw-bold px-3 py-2`}
                >
                  {isScraped ? '❤️ 스크랩 취소' : '🤍 스크랩하기'}
                </button>

                {/* 카테고리로 돌아가기 */}
                <button
                  onClick={() => navigate('/disasterCategory/list')}
                  className="btn btn-outline-secondary fw-bold px-3 py-2"
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
                  className="btn btn-outline-secondary fw-bold px-3 py-2"
                >
                  ← 목록으로 돌아가기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer 영역 */}
        <div className="card-footer bg-white border-0 pb-4 text-center text-muted small">
          안전지침을 준수하여 재난 피해를 최소화하세요.
        </div>
      </div>
    </div>
  );
}