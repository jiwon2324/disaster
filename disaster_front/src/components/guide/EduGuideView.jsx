import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./EduGuide.css";

function EduGuideView() {
  const { no } = useParams();
  const navigate = useNavigate();

  const [guide, setGuide] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuide = async () => {
      try {
        const response = await apiClient.get(`/api/edu/${no}`);
        setGuide(response.data);
      } catch (err) {
        setError("교육 가이드를 불러오지 못했습니다.");
      }
    };

    loadGuide();
  }, [no]);

  const handleDelete = async () => {
    const confirmed = window.confirm("정말 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(`/api/edu/${no}`);
      alert("삭제되었습니다.");
      navigate("/edu");
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  if (error) {
    return <p className="guide-error">{error}</p>;
  }

  if (!guide) {
    return <p>불러오는 중입니다.</p>;
  }

  return (
    <div className="guide-container">
      <div className="guide-detail">
        <div className="guide-card-top">
          <span className="guide-category">
            {guide.category || "기타"}
          </span>

          <span>{guide.status}</span>
        </div>

        <h1>{guide.title}</h1>

        <div className="guide-info">
          <span>작성자: {guide.writer}</span>
          <span>조회수: {guide.hit ?? 0}</span>
          <span>
            등록일:{" "}
            {guide.regDate
              ? new Date(guide.regDate).toLocaleDateString()
              : "-"}
          </span>
        </div>

        <section>
          <h3>요약</h3>
          <p>{guide.summary}</p>
        </section>

        <section>
          <h3>본문</h3>
          <div className="guide-content">{guide.content}</div>
        </section>

        <section>
          <h3>태그</h3>
          <p>{guide.tags || "-"}</p>
        </section>

        <div className="guide-actions">
          <Link to="/edu" className="guide-button secondary">
            목록
          </Link>

          <Link
            to={`/edu/${guide.no}/edit`}
            className="guide-button"
          >
            수정
          </Link>

          <button
            type="button"
            className="guide-button danger"
            onClick={handleDelete}
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default EduGuideView;