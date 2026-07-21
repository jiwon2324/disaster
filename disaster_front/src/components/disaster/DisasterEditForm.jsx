import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function DisasterEditForm() {
  const { id } = useParams(); // URL 파라미터에서 재난 정보 id 추출 (/disasterInfo/edit/:id)
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    location: '',
    disasterDate: '',
    catid: ''
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 기존 재난 정보 상세 조회
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost/disasterInfo/detail/${id}`, {
          withCredentials: true
        });

        const data = res.data;
        
        // datetime-local input 형식(YYYY-MM-DDTHH:mm)에 맞게 날짜 포맷팅
        let formattedDate = '';
        if (data.disasterDate) {
          const dateObj = new Date(data.disasterDate);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        setFormData({
          title: data.title || '',
          content: data.content || '',
          location: data.location || '',
          disasterDate: formattedDate,
          catid: data.catid || ''
        });
      } catch (err) {
        console.error("재난 상세 정보 조회 실패:", err);
        alert("기존 정보를 불러오는 데 실패했습니다.");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id, navigate]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 폼 제출 핸들러 (PUT 요청)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);

      // 백엔드로 재난 정보 수정 요청 (PUT)
      await axios.put(`http://localhost/disasterInfo/${id}`, formData, {
        withCredentials: true
      });

      alert("재난 정보가 성공적으로 수정되었습니다.");
      
      // 수정 완료 후 해당 카테고리 목록으로 이동
      navigate(`/disasterInfo/list/${formData.catid}`);
    } catch (err) {
      console.error("수정 실패:", err);
      alert(err.response?.data?.message || "수정 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-muted">기존 정보를 불러오는 중...</div>;
  }

  return (
    <div className="container mt-5" style={{ maxWidth: '700px' }}>
      <div className="card shadow-sm border-light">
        <div className="card-header bg-white pt-4 pb-3">
          <h3 className="fw-bold text-primary mb-0">
            <i className="bi bi-pencil-square me-2"></i>재난 정보 수정 (관리자)
          </h3>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* 카테고리 ID (Hidden) */}
            <input type="hidden" name="catid" value={formData.catid} />

            {/* 제목 */}
            <div className="mb-3">
              <label className="form-label fw-bold">재난 제목</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="제목을 입력하세요"
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
                placeholder="발생 위치를 입력하세요"
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
                placeholder="상세 내용을 입력하세요"
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
                {submitting ? '수정 중...' : '수정 완료'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}