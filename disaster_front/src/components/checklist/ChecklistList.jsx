import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./Checklist.css";

const TEST_USER_ID = "test_user";

const CATEGORY_OPTIONS = [
  { label: "전체", value: "" },
  { label: "식수", value: "\uC2DD\uC218" },
  { label: "식량", value: "\uC2DD\uB7C9" },
  { label: "의약품", value: "\uC758\uC57D\uD488" },
  { label: "조명", value: "\uC870\uBA85" },
  { label: "위생", value: "\uC704\uC0DD" },
  { label: "기타", value: "\uAE30\uD0C0" },
];

const getPageContent = (data) => (Array.isArray(data) ? data : data?.content ?? []);

const logApiError = (label, err) => {
  console.error(label, err);
  console.error(`${label} status:`, err.response?.status);
  console.error(`${label} response:`, err.response?.data);
  console.error(`${label} request URL:`, err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url);
};

const isExpired = (dateValue) => {
  if (!dateValue) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(dateValue) < today;
};

const isExpiringSoon = (dateValue) => {
  if (!dateValue || isExpired(dateValue)) {
    return false;
  }

  const today = new Date();
  const expiry = new Date(dateValue);
  const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);

  return diffDays <= 30;
};

const getExpiryText = (dateValue, expired, expiringSoon) => {
  if (!dateValue) {
    return "유효기간 없음";
  }

  if (expired) {
    return `${dateValue} · 유효기간 만료`;
  }

  if (expiringSoon) {
    return `${dateValue} · 유효기간 임박`;
  }

  return dateValue;
};

function ChecklistList() {
  const memberId = TEST_USER_ID;
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, ready: 0, notReady: 0 });
  const [filters, setFilters] = useState({ word: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/api/checklists", {
        params: {
          id: memberId,
          word: filters.word || undefined,
          category: filters.category || undefined,
          page: 1,
          size: 100,
        },
      });

      setItems(getPageContent(response.data));
    } catch (err) {
      logApiError("체크리스트 목록 조회 실패", err);
      setError("체크리스트를 불러오지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const response = await apiClient.get("/api/checklists/meta", {
        params: { id: memberId },
      });

      setMeta(response.data);
    } catch (err) {
      logApiError("체크리스트 통계 조회 실패", err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [listResponse, metaResponse] = await Promise.all([
          apiClient.get("/api/checklists", {
            params: {
              id: memberId,
              page: 1,
              size: 100,
            },
          }),
          apiClient.get("/api/checklists/meta", {
            params: { id: memberId },
          }),
        ]);

        setItems(getPageContent(listResponse.data));
        setMeta(metaResponse.data);
      } catch (err) {
        logApiError("체크리스트 초기 조회 실패", err);
        setError("체크리스트를 불러오지 못했습니다. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [memberId]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadItems();
  };

  const refreshData = async () => {
    await loadItems();
    await loadMeta();
  };

  const handleReadyChange = async (item) => {
    const nextStatus = item.isReady === "Y" ? "N" : "Y";

    try {
      await apiClient.patch(`/api/checklists/${item.no}/ready`, { isReady: nextStatus });
      await refreshData();
    } catch (err) {
      logApiError("체크리스트 준비 상태 변경 실패", err);
      alert("준비 상태를 변경하지 못했습니다.");
    }
  };

  const handleDelete = async (no) => {
    if (!window.confirm("이 물품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/checklists/${no}`);
      await refreshData();
    } catch (err) {
      logApiError("체크리스트 삭제 실패", err);
      alert("삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  const readyRate = meta.total ? Math.round(((meta.ready ?? 0) / meta.total) * 100) : 0;

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <div>
          <h1>비상 물품 체크리스트</h1>
        </div>
        <Link to="/checklists/write" className="checklist-button">물품 등록</Link>
      </div>

      <div className="checklist-meta">
        <div><strong>{meta.total ?? 0}</strong><span>전체</span></div>
        <div><strong>{meta.ready ?? 0}</strong><span>준비 완료</span></div>
        <div><strong>{meta.notReady ?? 0}</strong><span>준비 필요</span></div>
      </div>

      <div className="checklist-progress" aria-label="준비 완료율">
        <div>
          <strong>준비 완료율 {readyRate}%</strong>
          <span>전체 {meta.total ?? 0}개 중 {meta.ready ?? 0}개 준비 완료</span>
        </div>
        <div className="checklist-progress-track">
          <span style={{ width: `${readyRate}%` }} />
        </div>
      </div>

      <form className="checklist-search" onSubmit={handleSearch}>
        <input
          type="search"
          value={filters.word}
          onChange={(event) => setFilters((current) => ({ ...current, word: event.target.value }))}
          placeholder="물품명, 카테고리, 메모 검색"
        />
        <select
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
        >
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category.label} value={category.value}>{category.label}</option>
          ))}
        </select>
        <button type="submit" className="checklist-button">검색</button>
      </form>

      {loading && <p className="checklist-state">체크리스트를 불러오는 중입니다.</p>}
      {error && <p className="checklist-error">{error}</p>}

      <div className="checklist-list">
        {!loading && !error && items.length === 0 && (
          <p className="checklist-empty">등록된 비상 물품이 없습니다.</p>
        )}

        {items.map((item) => {
          const expired = isExpired(item.expiryDate);
          const expiringSoon = isExpiringSoon(item.expiryDate);

          return (
            <div className={`checklist-item ${item.isReady === "Y" ? "completed" : ""}`} key={item.no}>
              <button
                type="button"
                className={`ready-check ${item.isReady === "Y" ? "completed" : ""}`}
                onClick={() => handleReadyChange(item)}
                aria-label="준비 상태 변경"
              >
                {item.isReady === "Y" ? "완료" : ""}
              </button>

              <div className="checklist-item-content">
                <div className="checklist-item-title">
                  <h3>{item.name}</h3>
                  <span className={`expiry-badge ${expired ? "danger" : expiringSoon ? "warning" : ""}`}>
                    {getExpiryText(item.expiryDate, expired, expiringSoon)}
                  </span>
                </div>
                <p>
                  {item.category || "기타"} · 수량 {item.quantity ?? 1}{item.unit || "개"} ·
                  중요도 {item.priority || "미지정"}
                </p>
                {item.memo && <p className="checklist-memo">{item.memo}</p>}
              </div>

              <div className="checklist-actions">
                <Link to={`/checklists/${item.no}/edit`} className="checklist-link">수정</Link>
                <button type="button" onClick={() => handleDelete(item.no)}>삭제</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChecklistList;
