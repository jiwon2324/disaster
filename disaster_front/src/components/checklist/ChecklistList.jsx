import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./Checklist.css";

function ChecklistList() {
  const memberId = "test_user";

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    ready: 0,
    notReady: 0,
  });
  const [error, setError] = useState("");

  const loadItems = async () => {
    try {
      setError("");

      const response = await apiClient.get("/api/checklists", {
        params: {
          id: memberId,
          page: 1,
          size: 100,
        },
      });

      setItems(response.data.content ?? []);
    } catch (err) {
      setError("체크리스트를 불러오지 못했습니다.");
    }
  };

  const loadMeta = async () => {
    try {
      const response = await apiClient.get("/api/checklists/meta", {
        params: {
          id: memberId,
        },
      });

      setMeta(response.data);
    } catch (err) {
      console.error("체크리스트 통계 조회 실패", err);
    }
  };

  useEffect(() => {
    loadItems();
    loadMeta();
  }, []);

  const handleReadyChange = async (item) => {
    const nextStatus = item.isReady === "Y" ? "N" : "Y";

    try {
      await apiClient.patch(
        `/api/checklists/${item.no}/ready`,
        {
          isReady: nextStatus,
        }
      );

      await loadItems();
      await loadMeta();
    } catch (err) {
      alert("준비 상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (no) => {
    if (!window.confirm("해당 물품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await apiClient.delete(`/api/checklists/${no}`);
      await loadItems();
      await loadMeta();
    } catch (err) {
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <div>
          <h1>비상 물품 체크리스트</h1>
          <p>필요한 비상 물품의 구비 현황을 관리하세요.</p>
        </div>

        <Link to="/checklists/write" className="checklist-button">
          물품 등록
        </Link>
      </div>

      <div className="checklist-meta">
        <div>
          <strong>{meta.total ?? 0}</strong>
          <span>전체</span>
        </div>

        <div>
          <strong>{meta.ready ?? 0}</strong>
          <span>준비 완료</span>
        </div>

        <div>
          <strong>{meta.notReady ?? 0}</strong>
          <span>준비 필요</span>
        </div>
      </div>

      {error && <p className="checklist-error">{error}</p>}

      <div className="checklist-list">
        {items.map((item) => (
          <div className="checklist-item" key={item.no}>
            <button
              type="button"
              className={`ready-check ${
                item.isReady === "Y" ? "completed" : ""
              }`}
              onClick={() => handleReadyChange(item)}
            >
              {item.isReady === "Y" ? "✓" : ""}
            </button>

            <div className="checklist-item-content">
              <h3>{item.name}</h3>

              <p>
                {item.category || "기타"} ·{" "}
                {item.quantity ?? 1}
                {item.unit || "개"}
              </p>

              {item.memo && <p>{item.memo}</p>}
            </div>

            <div className="checklist-actions">
              <Link
                to={`/checklists/${item.no}/edit`}
                className="checklist-link"
              >
                수정
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(item.no)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="checklist-empty">
            등록된 체크리스트 물품이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

export default ChecklistList;