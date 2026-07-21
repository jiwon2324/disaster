import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function DisasterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL 쿼리 스트링에서 catid 추출 (?catid=1 형태)
  const defaultCatid = searchParams.get('catid') || '';

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    disasterDate: '', // LocalDateTime 호환 포맷 (YYYY-MM-DDTHH:mm)
    catid: defaultCatid
  });

  const [submitting, setSubmitting] = useState(false);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.catid) {
      alert("카테고리 ID가 올바르지 않습니다.");
      return;
    }

    try {
      setSubmitting(true);
      
      // 백엔드로 재난 정보 등록 요청 (POST)
      await axios.post('http://localhost/disasterInfo', formData, {
        withCredentials: true
      });

      alert("재난 정보가 성공적으로 등록되었습니다.");
      // 등록 완료 후 해당 카테고리 목록으로 이동
      navigate(`/disasterInfo/list/${formData.catid}`);
    } catch (err) {
      console.error("등록 실패:", err);
      alert(err.response?.data?.message || "등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow-sm border-light">
        <div className="card-header bg-white pt-4 pb-3">
          <h3 className="fw-bold text-primary mb-0">
            <i className="bi bi-plus-circle-fill me-2"></i>재난 정보 등록 (관리자)
          </h3>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* 카테고리 ID (숨김 또는 고정) */}
            <input type="hidden" name="catid" value={formData.catid} />

            {/* 제목 */}
            <div className="mb-3">
              <label className="form-label fw-bold">재난 제목</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="예: [태풍 주의보] 전국 주요 지역 강풍 및 집중호우"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* 발생 위치 */}
            <div className="mb-3">
              <label className="form-label fw-bold">발생 위치</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="예: 서울특별시 마포구, 경기도 수원시 전체"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* 발생 일시 */}
            <div className="mb-3">
              <label className="form-label fw-bold">발생 일시</label>
              <input
                type="datetime-local"
                name="disasterDate"
                className="form-control"
                value={formData.disasterDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* 재난 내용 */}
            <div className="mb-4">
              <label className="form-label fw-bold">재난 내용 및 대처 요령</label>
              <textarea
                name="content"
                className="form-control"
                rows="6"
                placeholder="상세한 재난 상황과 행동 요령을 입력해주세요."
                value={formData.content}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* 하단 버튼 */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                취소
              </button>
              <button
                type="submit"
                className="btn btn-primary fw-bold"
                disabled={submitting}
              >
                {submitting ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}