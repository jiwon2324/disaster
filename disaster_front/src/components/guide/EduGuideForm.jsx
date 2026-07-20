import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./EduGuide.css";

const CATEGORY_OPTIONS = [
  { label: "지진", value: "지진" },
  { label: "화재", value: "화재" },
  { label: "태풍", value: "태풍" },
  { label: "침수", value: "침수" },
  { label: "폭염", value: "폭염" },
  { label: "한파", value: "한파" },
  { label: "기타", value: "기타" },
];

const initialForm = {
  title: "",
  category: "기타",
  writer: "admin",
  summary: "",
  content: "",
  tags: "",
  status: "PUBLIC",
};

const logApiError = (label, err) => {
  console.error(label, err);
  console.error(`${label} status:`, err.response?.status);
  console.error(`${label} response:`, err.response?.data);
  console.error(`${label} request URL:`, err.config?.baseURL ? `${err.config.baseURL}${err.config.url}` : err.config?.url);
};

function EduGuideForm() {
  const { no } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(no);
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadGuide = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiClient.get(`/api/edu/${no}`);
        const guide = response.data;
        setForm({
          title: guide.title ?? "",
          category: guide.category ?? "기타",
          writer: guide.writer ?? "admin",
          summary: guide.summary ?? "",
          content: guide.content ?? "",
          tags: guide.tags ?? "",
          status: guide.status ?? "PUBLIC",
        });
      } catch (err) {
        logApiError("교육 가이드 상세 조회 실패", err);
        setError("교육 가이드를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadGuide();
  }, [isEdit, no]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "제목을 입력해 주세요.";
    }

    if (!form.writer.trim()) {
      nextErrors.writer = "작성자를 입력해 주세요.";
    }

    if (!form.summary.trim()) {
      nextErrors.summary = "요약을 입력해 주세요.";
    }

    if (!form.content.trim()) {
      nextErrors.content = "본문을 입력해 주세요.";
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
      title: form.title.trim(),
      category: form.category || null,
      writer: form.writer.trim(),
      summary: form.summary.trim(),
      content: form.content.trim(),
      tags: form.tags.trim() || null,
      status: form.status || "PUBLIC",
    };

    try {
      setSubmitting(true);
      setError("");

      if (isEdit) {
        await apiClient.put(`/api/edu/${no}`, payload);
      } else {
        await apiClient.post("/api/edu", payload);
      }

      navigate("/edu");
    } catch (err) {
      logApiError("교육 가이드 저장 실패", err);
      setError("저장에 실패했습니다. 입력한 내용을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="guide-state">교육 가이드를 불러오는 중입니다.</p>;
  }

  return (
    <div className="guide-container">
      <h1>{isEdit ? "교육 가이드 수정" : "교육 가이드 등록"}</h1>
      {error && <p className="guide-error">{error}</p>}

      <form className="guide-form" onSubmit={handleSubmit}>
        <label>
          제목 <span className="required">*</span>
          <input name="title" value={form.title} onChange={handleChange} maxLength={300} required />
          {fieldErrors.title && <small>{fieldErrors.title}</small>}
        </label>
        <div className="guide-form-row">
          <label>
            카테고리
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.label} value={category.value}>{category.label}</option>
              ))}
            </select>
          </label>
          <label>
            상태
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="PUBLIC">공개</option>
              <option value="DRAFT">임시저장</option>
            </select>
          </label>
        </div>
        <label>
          작성자 <span className="required">*</span>
          <input name="writer" value={form.writer} onChange={handleChange} maxLength={100} required />
          {fieldErrors.writer && <small>{fieldErrors.writer}</small>}
        </label>
        <label>
          요약 <span className="required">*</span>
          <textarea name="summary" value={form.summary} onChange={handleChange} rows={4} maxLength={1000} required />
          {fieldErrors.summary && <small>{fieldErrors.summary}</small>}
        </label>
        <label>
          본문 <span className="required">*</span>
          <textarea name="content" value={form.content} onChange={handleChange} rows={12} required />
          {fieldErrors.content && <small>{fieldErrors.content}</small>}
        </label>
        <label>
          태그
          <input name="tags" value={form.tags} onChange={handleChange} maxLength={500} placeholder="쉼표로 구분해 입력하세요." />
        </label>
        <div className="guide-actions">
          <button type="submit" className="guide-button" disabled={submitting}>
            {submitting ? "저장 중..." : "저장"}
          </button>
          <button type="button" className="guide-button secondary" onClick={() => navigate(-1)} disabled={submitting}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default EduGuideForm;
