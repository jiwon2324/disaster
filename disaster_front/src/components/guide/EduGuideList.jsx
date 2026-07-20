import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient";

function EduGuideList() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await apiClient.get("/api/edu", {
          params: {
            page: 1,
            size: 10,
          },
        });

        console.log("교육 가이드 응답:", response.data);

        setGuides(response.data.content ?? []);
      } catch (error) {
        console.error("교육 가이드 조회 오류:", error);

        if (error.response) {
          console.error("상태 코드:", error.response.status);
          console.error("응답 내용:", error.response.data);
        }

        setError("교육 가이드 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
  }, []);

  if (loading) {
    return <div>교육 가이드 목록을 불러오는 중입니다.</div>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>재난 안전 교육 가이드</h1>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {!error && guides.length === 0 && (
        <p>등록된 교육 가이드가 없습니다.</p>
      )}

      {guides.map((guide) => (
        <div
          key={guide.no}
          style={{
            marginBottom: "16px",
            padding: "16px",
            border: "1px solid #dddddd",
            borderRadius: "8px",
          }}
        >
          <h2>{guide.title}</h2>
          <p>{guide.summary}</p>
          <p>카테고리: {guide.category}</p>
          <p>작성자: {guide.writer}</p>
          <p>조회수: {guide.hit}</p>
        </div>
      ))}
    </div>
  );
}

export default EduGuideList;