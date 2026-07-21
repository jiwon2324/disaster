import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DisasterList() {
  const { catid } = useParams();
  const navigate = useNavigate();

  const [disasterList, setDisasterList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 10개씩 페이징 처리를 위한 상태
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ★ 관리자 여부 동적 체크 함수
  const checkIsAdmin = () => {
    const loginData = localStorage.getItem("login");
    if (!loginData) return false;
    try {
      const parsed = JSON.parse(loginData);
      const role = parsed.role || parsed.roles || parsed.grade || "";
      const name = parsed.name || parsed.username || "";

      return (
        role === "ROLE_ADMIN" || 
        role === "ADMIN" || 
        role === "관리자" || 
        name === "관리자" || 
        parsed.isAdmin === true
      );
    } catch {
      return false;
    }
  };

  const isAdmin = checkIsAdmin();

  const fetchDisasterList = useCallback(async (currentPage) => {
    try {
      const res = await axios.get(`http://localhost/disasterInfo/category/${catid}/paged`, {
        params: { page: currentPage, size: 10 },
        withCredentials: true
      });
      setDisasterList(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("재난 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  }, [catid]);

  useEffect(() => {
    if (catid) {
      fetchDisasterList(page);
    }
  }, [catid, page, fetchDisasterList]);

  const handlePageChange = (newPage) => {
    setLoading(true);
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleCreate = () => {
    if (!isAdmin) {
      alert("관리자만 재난 정보를 등록할 수 있습니다.");
      return;
    }
    navigate(`/disasterInfo/create?catid=${catid}`);
  };

  const handleEdit = (id, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("관리자만 수정할 수 있습니다.");
      return;
    }
    navigate(`/disasterInfo/edit/${id}`);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("관리자만 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm("정말 이 재난 정보를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost/disasterInfo/${id}`, {
        withCredentials: true
      });
      alert("삭제되었습니다.");
      fetchDisasterList(page);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert(err.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-light">
        {/* Header 영역 */}
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <div className="d-flex justify-content-between align-items-center position-relative px-3">
            <div className="w-100 text-center">
              <h2 className="fw-bold text-primary mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>재난 정보 목록
              </h2>
            </div>

            <div className="position-absolute end-0 me-3 d-flex gap-2">
              {isAdmin && (
                <button 
                  onClick={handleCreate}
                  className="btn btn-primary btn-sm fw-bold"
                >
                  + 재난 정보 추가
                </button>
              )}
              <button 
                onClick={() => navigate('/disasterCategory/list')}
                className="btn btn-outline-secondary btn-sm fw-bold"
              >
                ← 카테고리로 돌아가기
              </button>
            </div>
          </div>
          <hr className="text-secondary opacity-25 mt-3 mb-0" />
        </div>

        {/* Body 영역 */}
        <div className="card-body p-4">
          {loading && disasterList.length === 0 ? (
            <div className="text-center py-5 text-muted">목록을 불러오는 중...</div>
          ) : disasterList.length === 0 ? (
            <div className="text-center py-5 text-muted bg-light rounded-3">
              등록된 재난 정보가 없습니다.
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {disasterList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/disasterInfo/detail/${item.id}`)}
                  className="p-3 border rounded-3 bg-white shadow-sm hover-shadow"
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary fw-bold">
                      #{item.catName || '재난'}
                    </span>
                    
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">
                        {item.disasterDate ? new Date(item.disasterDate).toLocaleString() : '-'}
                      </span>

                      {isAdmin && (
                        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => handleEdit(item.id, e)}
                            className="btn btn-sm btn-outline-info py-0 px-2 small"
                          >
                            수정
                          </button>
                          <button 
                            onClick={(e) => handleDelete(item.id, e)}
                            className="btn btn-sm btn-outline-danger py-0 px-2 small"
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">
                    {item.title}
                  </h5>

                  <p className="text-secondary small mb-3 text-truncate" style={{ maxWidth: '100%' }}>
                    {item.content && item.content.length > 100 
                      ? item.content.substring(0, 100) + '...' 
                      : item.content}
                  </p>

                  <div className="small text-muted border-top pt-2">
                    📍 <strong>발생 위치:</strong> {item.location || '정보 없음'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bootstrap 기반 10개 단위 페이징 네비게이션 */}
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
                  <button 
                    className="page-item-link page-link" 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 0}
                  >
                    이전
                  </button>
                </li>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(i)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${page >= totalPages - 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-item-link page-link" 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    다음
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>

        {/* Footer 영역 */}
        <div className="card-footer bg-white border-0 pb-4 text-center text-muted small">
          실시간 발령된 재난 정보를 정확하게 전달합니다.
        </div>
      </div>
    </div>
  );
}