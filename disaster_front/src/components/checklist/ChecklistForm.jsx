import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./Checklist.css";

const TEST_USER_ID = "test_user";

const CATEGORY_OPTIONS = [
  { label: "식수", value: "\uC2DD\uC218" },
  { label: "식량", value: "\uC2DD\uB7C9" },
  { label: "의약품", value: "\uC758\uC57D\uD488" },
  { label: "조명", value: "\uC870\uBA85" },
  { label: "위생", value: "\uC704\uC0DD" },
  { label: "기타", value: "\uAE30\uD0C0" },
];

const createInitialForm = () => ({
  id: TEST_USER_ID,
  name: "",
  category: "",
  quantity: 1,
  unit: "ea",
  priority: "",
  expiryDate: "",
  memo: "",
  isReady: "N",
});

const logApiError = (label, err) => {
  console.error(label, err);
  console.error(`${label} status:`, err.response?.status);
  console.error(`${label} response:`, err.response?.data);
  console.error(`${label} request URL:`, err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url);
};

function ChecklistForm() {
  const { no } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(no);
  const [form, setForm] = useState(createInitialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadItem = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get(`/api/checklists/${no}`);
        const item = response.data;

        setForm({
          id: TEST_USER_ID,
          name: item.name ?? "",
          category: item.category ?? "",
          quantity: item.quantity ?? 1,
          unit: item.unit ?? "ea",
          priority: item.priority ?? "",
          expiryDate: item.expiryDate ?? "",
          memo: item.memo ?? "",
          isReady: item.isReady ?? "N",
        });
      } catch (err) {
        logApiError("체크리스트 상세 조회 실패", err);
        setError("물품 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [isEdit, no]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "quantity" ? Number(value) : value,
    }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "물품명을 입력해 주세요.";
    }

    if (!form.id || !form.id.trim()) {
      nextErrors.id = "사용자 ID를 확인할 수 없습니다.";
    }

    if (!Number.isInteger(form.quantity) || form.quantity < 1) {
      nextErrors.quantity = "수량은 1 이상의 정수로 입력해 주세요.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      id: TEST_USER_ID,
      name: form.name.trim(),
      category: form.category || null,
      quantity: Number(form.quantity),
      unit: form.unit.trim() || null,
      priority: form.priority || null,
      expiryDate: form.expiryDate || null,
      memo: form.memo.trim() || null,
      isReady: form.isReady,
    };

    try {
      setSubmitting(true);
      setError("");

      if (isEdit) {
        await apiClient.put(`/api/checklists/${no}`, payload);
      } else {
        await apiClient.post("/api/checklists", payload);
      }

      navigate("/checklists");
    } catch (err) {
      logApiError("체크리스트 저장 실패", err);
      setError("저장에 실패했습니다. 입력한 내용을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="checklist-state">물품 정보를 불러오는 중입니다.</p>;
  }

  return (
    <div className="checklist-container">
      <h1>{isEdit ? "물품 수정" : "물품 등록"}</h1>
      {error && <p className="checklist-error">{error}</p>}

      <form className="checklist-form" onSubmit={handleSubmit}>
        <label>
          물품명 <span className="required">*</span>
          <input name="name" value={form.name} onChange={handleChange} maxLength={100} required />
          {fieldErrors.name && <small>{fieldErrors.name}</small>}
        </label>
        <input type="hidden" name="id" value={form.id} readOnly />
        <div className="checklist-form-row">
          <label>
            카테고리
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">선택</option>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.label} value={category.value}>{category.label}</option>
              ))}
            </select>
          </label>
          <label>
            중요도
            <select name="priority" value={form.priority} onChange={handleChange}>
              <option value="">선택</option>
              <option value="\uD544\uC218">필수</option>
              <option value="\uAD8C\uC7A5">권장</option>
              <option value="\uC120\uD0DD">선택</option>
            </select>
          </label>
        </div>
        <div className="checklist-form-row">
          <label>
            수량 <span className="required">*</span>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" step="1" required />
            {fieldErrors.quantity && <small>{fieldErrors.quantity}</small>}
          </label>
          <label>
            단위
            <input name="unit" value={form.unit} onChange={handleChange} placeholder="개, 병, 세트" maxLength={20} />
          </label>
        </div>
        <div className="checklist-form-row">
          <label>
            유효기간
            <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
          </label>
          <label>
            준비 상태
            <select name="isReady" value={form.isReady} onChange={handleChange}>
              <option value="N">준비 필요</option>
              <option value="Y">준비 완료</option>
            </select>
          </label>
        </div>
        <label>
          메모
          <textarea name="memo" value={form.memo} onChange={handleChange} rows={5} maxLength={1000} />
        </label>
        <div className="checklist-actions">
          <button type="submit" className="checklist-button" disabled={submitting}>
            {submitting ? "저장 중..." : "저장"}
          </button>
          <button type="button" onClick={() => navigate(-1)} disabled={submitting}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChecklistForm;
