import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./EduGuide.css";

const CATEGORY_OPTIONS = [
  { label: "전체", value: "" },
  { label: "지진", value: "지진" },
  { label: "화재", value: "화재" },
  { label: "태풍", value: "태풍" },
  { label: "침수", value: "침수" },
  { label: "폭염", value: "폭염" },
  { label: "한파", value: "한파" },
  { label: "기타", value: "기타" },
];

const getPageContent = (data) => (Array.isArray(data) ? data : data?.content ?? []);

const getStatusText = (status) => (status === "DRAFT" ? "임시저장" : "공개");

const logApiError = (label, err) => {
  console.error(label, err);
  console.error(`${label} status:`, err.response?.status);
  console.error(`${label} response:`, err.response?.data);
  console.error(`${label} request URL:`, err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url);
};

function EduGuideList() {
  const [guides, setGuides] = useState([]);
  const [meta, setMeta] = useState({ total: 0, published: 0, draft: 0, views: 0 });
  const [filters, setFilters] = useState({ word: "", category: "" });
  const [pageInfo, setPageInfo] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const applyListResponse = (data) => {
    setGuides(getPageContent(data));
    setPageInfo({
      page: (data?.number ?? 0) + 1,
      totalPages: data?.totalPages || 1,
    });
  };

  const loadGuides = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/api/edu", {
        params: {
          word: filters.word || undefined,
          category: filters.category || undefined,
          page,
          size: 9,
        },
      });

      applyListResponse(response.data);
    } catch (err) {
      logApiError("교육 가이드 목록 조회 실패", err);
      setError("교육 가이드 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [listResponse, metaResponse] = await Promise.all([
          apiClient.get("/api/edu", { params: { page: 1, size: 9 } }),
          apiClient.get("/api/edu/meta"),
        ]);

        applyListResponse(listResponse.data);
        setMeta(metaResponse.data);
      } catch (err) {
        logApiError("교육 가이드 초기 데이터 조회 실패", err);
        setError("교육 가이드 목록을 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadGuides(1);
  };

  return (
    <div className="guide-container">
      <div className="guide-header">
        <div>
          <h1>재난 안전 교육 가이드</h1>
        </div>
        <Link to="/edu/write" className="guide-button">교육 가이드 등록</Link>
      </div>

      <div className="guide-meta" aria-label="교육 가이드 통계">
        <span>전체 {meta.total ?? 0}</span>
        <span>공개 {meta.published ?? 0}</span>
        <span>임시저장 {meta.draft ?? 0}</span>
        <span>조회수 {meta.views ?? 0}</span>
      </div>

      <form className="guide-search" onSubmit={handleSearch}>
        <input
          type="search"
          value={filters.word}
          onChange={(event) => setFilters((current) => ({ ...current, word: event.target.value }))}
          placeholder="제목, 요약, 태그 검색"
        />
        <select
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
        >
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.label} value={category.value}>{category.label}</option>
          ))}
        </select>
        <button type="submit" className="guide-button">검색</button>
      </form>

      {loading && <p className="guide-state">교육 가이드를 불러오는 중입니다.</p>}
      {error && <p className="guide-error">{error}</p>}
      {!loading && !error && guides.length === 0 && (
        <p className="guide-empty">등록된 교육 가이드가 없습니다.</p>
      )}

      <div className="guide-list">
        {guides.map((guide) => (
          <Link to={`/edu/${guide.no}`} className="guide-card" key={guide.no}>
            <div className="guide-card-top">
              <span className="guide-category">{guide.category || "기타"}</span>
              <span className={`guide-status ${guide.status === "DRAFT" ? "draft" : ""}`}>
                {getStatusText(guide.status)}
              </span>
            </div>
            <h2>{guide.title}</h2>
            <p>{guide.summary}</p>
            <div className="guide-info">
              <span>작성자 {guide.writer}</span>
              <span>조회수 {guide.hit ?? 0}</span>
              <span>{guide.regDate ? new Date(guide.regDate).toLocaleDateString() : "-"}</span>
            </div>
          </Link>
        ))}
      </div>

      {!loading && pageInfo.totalPages > 1 && (
        <div className="guide-pagination">
          <button type="button" disabled={pageInfo.page <= 1} onClick={() => loadGuides(pageInfo.page - 1)}>
            이전
          </button>
          <span>{pageInfo.page} / {pageInfo.totalPages}</span>
          <button type="button" disabled={pageInfo.page >= pageInfo.totalPages} onClick={() => loadGuides(pageInfo.page + 1)}>
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default EduGuideList;
