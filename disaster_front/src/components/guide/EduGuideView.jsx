import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./EduGuide.css";

const splitTags = (tags) => {
  if (!tags) {
    return [];
  }

  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
};

const getStatusText = (status) => (status === "DRAFT" ? "임시저장" : "공개");

const logApiError = (label, err) => {
  console.error(label, err);
  console.error(`${label} status:`, err.response?.status);
  console.error(`${label} response:`, err.response?.data);
  console.error(`${label} request URL:`, err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url);
};

function EduGuideView() {
  const { no } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuide = async () => {
      try {
        setError("");
        const response = await apiClient.get(`/api/edu/${no}`);
        setGuide(response.data);
      } catch (err) {
        logApiError("교육 가이드 상세 조회 실패", err);
        setError("교육 가이드를 불러오지 못했습니다.");
      }
    };

    loadGuide();
  }, [no]);

  const handleDelete = async () => {
    if (!window.confirm("이 교육 가이드를 삭제하시겠습니까?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/edu/${no}`);
      navigate("/edu");
    } catch (err) {
      logApiError("교육 가이드 삭제 실패", err);
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  if (error) {
    return <p className="guide-error">{error}</p>;
  }

  if (!guide) {
    return <p className="guide-state">교육 가이드를 불러오는 중입니다.</p>;
  }

  const tags = splitTags(guide.tags);

  return (
    <div className="guide-container">
      <article className="guide-detail">
        <div className="guide-card-top">
          <span className="guide-category">{guide.category || "기타"}</span>
          <span className={`guide-status ${guide.status === "DRAFT" ? "draft" : ""}`}>
            {getStatusText(guide.status)}
          </span>
        </div>
        <h1>{guide.title}</h1>
        <div className="guide-info">
          <span>작성자 {guide.writer}</span>
          <span>조회수 {guide.hit ?? 0}</span>
          <span>등록일 {guide.regDate ? new Date(guide.regDate).toLocaleDateString() : "-"}</span>
          <span>수정일 {guide.updateDate ? new Date(guide.updateDate).toLocaleDateString() : "-"}</span>
        </div>

        <section className="guide-summary">
          <h3>요약</h3>
          <p>{guide.summary}</p>
        </section>
        <section>
          <h3>본문</h3>
          <div className="guide-content">{guide.content}</div>
        </section>
        <section>
          <h3>태그</h3>
          {tags.length > 0 ? (
            <div className="guide-tags">
              {tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : (
            <p>-</p>
          )}
        </section>

        <div className="guide-actions">
          <Link to="/edu" className="guide-button secondary">목록으로</Link>
          <Link to={`/edu/${guide.no}/edit`} className="guide-button">수정</Link>
          <button type="button" className="guide-button danger" onClick={handleDelete}>삭제</button>
        </div>
      </article>
    </div>
  );
}

export default EduGuideView;
