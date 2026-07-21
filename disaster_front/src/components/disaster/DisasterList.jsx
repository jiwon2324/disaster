import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DisasterList() {
  const { catid } = useParams(); // URL 파라미터에서 catid 읽기
  const navigate = useNavigate();

  const [disasterList, setDisasterList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 15개씩 페이징 처리를 위한 상태
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 관리자 여부 상태
  const [isAdmin] = useState(true); 

  const fetchDisasterList = useCallback(async (currentPage) => {
    console.log("fetch 실행");
    
    try {
      // 페이징 API 호출 (size=15 고정)
      const res = await axios.get(`http://localhost/disasterInfo/category/${catid}/paged`, {
        params: { page: currentPage, size: 15 },
        withCredentials: true
      });
      // Page 객체 응답 구조 반영 (.content 와 .totalPages)
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

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setLoading(true);
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  // 관리자 삭제 핸들러
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // 카드 클릭(상세 이동) 방지
    if (!window.confirm("정말 이 재난 정보를 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost/disasterInfo/${id}`, {
        withCredentials: true
      });
      alert("삭제되었습니다.");
      fetchDisasterList(page); // 현재 페이지 목록 새로고침
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  // 관리자 수정 페이지 이동 핸들러
  const handleEdit = (id, e) => {
    e.stopPropagation(); // 카드 클릭 방지
    navigate(`/disasterInfo/edit/${id}`);
  };

  if (loading && disasterList.length === 0) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>목록을 불러오는 중...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>🚨 재난 정보 목록</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* 관리자 모드일 때 추가(등록) 버튼 노출 */}
          {isAdmin && (
            <button 
              onClick={() => navigate(`/disasterInfo/create?catid=${catid}`)}
              style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              + 재난 정보 추가
            </button>
          )}
          <button 
            onClick={() => navigate('/disasterCategory/list')}
            style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            ← 카테고리로 돌아가기
          </button>
        </div>
      </div>

      {disasterList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
          등록된 재난 정보가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {disasterList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/disasterInfo/detail/${item.id}`)} // 클릭 시 상세 페이지로 이동
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
                  #{item.catName || '재난'}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    {item.disasterDate ? new Date(item.disasterDate).toLocaleString() : '-'}
                  </span>

                  {/* 관리자 모드일 때만 각 아이템별 수정/삭제 버튼 노출 */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={(e) => handleEdit(item.id, e)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        수정
                      </button>
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        style={{ padding: '4px 8px', fontSize: '0.8rem', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#1e293b' }}>
                {item.title}
              </h3>

              <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {item.content && item.content.length > 100 
                  ? item.content.substring(0, 100) + '...' 
                  : item.content}
              </p>

              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                📍 <strong>발생 위치:</strong> {item.location || '정보 없음'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 15개 단위 페이징 네비게이션 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '30px' }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 0}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: page === 0 ? '#f1f5f9' : '#fff', borderRadius: '6px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
          >
            이전
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              style={{
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                background: page === i ? '#3b82f6' : '#fff',
                color: page === i ? '#fff' : '#1e293b',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: page === i ? 'bold' : 'normal'
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages - 1}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', background: page >= totalPages - 1 ? '#f1f5f9' : '#fff', borderRadius: '6px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}