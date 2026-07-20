import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../api/apiClient";
import "./Checklist.css";

const getLoginId = () => {
  try {
    const loginData = localStorage.getItem("login");

    if (!loginData) {
      return "test_user";
    }

    const login = JSON.parse(loginData);

    return login.id ?? login.username ?? "test_user";
  } catch (error) {
    console.error("로그인 정보 읽기 실패:", error);
    return "test_user";
  }
};

const initialForm = {
  id: getLoginId(),
  name: "",
  category: "",
  quantity: 1,
  unit: "개",
  priority: "",
  expiryDate: "",
  memo: "",
  isReady: "N",
};

function ChecklistForm() {
  const { no } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(no);

  const [form, setForm] = useState(initialForm);
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

        const response = await apiClient.get(
          `/api/checklists/${no}`
        );

        const item = response.data;

        setForm({
          id: item.id ?? getLoginId(),
          name: item.name ?? "",
          category: item.category ?? "",
          quantity: item.quantity ?? 1,
          unit: item.unit ?? "개",
          priority: item.priority ?? "",
          expiryDate: item.expiryDate ?? "",
          memo: item.memo ?? "",
          isReady: item.isReady ?? "N",
        });
      } catch (err) {
        console.error("체크리스트 상세 조회 오류:", err);
        console.error("상태 코드:", err.response?.status);
        console.error("응답 내용:", err.response?.data);

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
      [name]:
        name === "quantity"
          ? Number(value)
          : value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("물품명은 필수입니다.");
      return false;
    }

    if (!form.id || !form.id.trim()) {
      setError("사용자 아이디가 없습니다.");
      return false;
    }

    if (
      !Number.isInteger(form.quantity) ||
      form.quantity < 1
    ) {
      setError("수량은 1 이상의 정수여야 합니다.");
      return false;
    }

    if (
      form.isReady !== "Y" &&
      form.isReady !== "N"
    ) {
      setError("준비 상태 값이 올바르지 않습니다.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const requestData = {
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category || null,
      quantity: Number(form.quantity),
      unit: form.unit?.trim() || null,
      priority: form.priority || null,
      expiryDate: form.expiryDate || null,
      memo: form.memo?.trim() || null,
      isReady: form.isReady,
    };

    console.log("체크리스트 전송 데이터:", requestData);

    try {
      setSubmitting(true);
      setError("");

      if (isEdit) {
        const response = await apiClient.put(
          `/api/checklists/${no}`,
          requestData
        );

        console.log("수정 응답:", response.data);
        alert("수정되었습니다.");
      } else {
        const response = await apiClient.post(
          "/api/checklists",
          requestData
        );

        console.log("등록 응답:", response.data);
        alert("등록되었습니다.");
      }

      navigate("/checklists");
    } catch (err) {
      console.error("체크리스트 저장 오류:", err);
      console.error("상태 코드:", err.response?.status);
      console.error("응답 내용:", err.response?.data);

      if (err.response?.status === 401) {
        setError(
          "로그인이 필요하거나 인증 토큰이 없습니다."
        );
      } else if (err.response?.status === 403) {
        setError(
          "체크리스트 등록 권한이 없습니다."
        );
      } else if (err.response?.status === 400) {
        setError(
          err.response?.data?.message ??
            "입력값을 확인해 주세요."
        );
      } else if (err.response?.status === 500) {
        setError(
          "서버 또는 데이터베이스 오류가 발생했습니다."
        );
      } else {
        setError(
          isEdit
            ? "물품 수정에 실패했습니다."
            : "물품 등록에 실패했습니다."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checklist-container">
        <p>물품 정보를 불러오는 중입니다.</p>
      </div>
    );
  }

  return (
    <div className="checklist-container">
      <h1>
        {isEdit
          ? "비상 물품 수정"
          : "비상 물품 등록"}
      </h1>

      {error && (
        <p className="checklist-error">
          {error}
        </p>
      )}

      <form
        className="checklist-form"
        onSubmit={handleSubmit}
      >
        <label>
          물품명
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </label>

        <label>
          카테고리
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">선택</option>
            <option value="식수">식수</option>
            <option value="식량">식량</option>
            <option value="의약품">
              의약품
            </option>
            <option value="조명">조명</option>
            <option value="위생">위생</option>
            <option value="기타">기타</option>
          </select>
        </label>

        <label>
          수량
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            min="1"
            step="1"
            required
          />
        </label>

        <label>
          단위
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            placeholder="개, 병, 팩"
            maxLength={20}
          />
        </label>

        <label>
          중요도
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="">선택</option>
            <option value="필수">필수</option>
            <option value="권장">권장</option>
            <option value="선택">선택</option>
          </select>
        </label>

        <label>
          유효기간
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
          />
        </label>

        <label>
          메모
          <textarea
            name="memo"
            value={form.memo}
            onChange={handleChange}
            rows={5}
            maxLength={1000}
          />
        </label>

        <label>
          준비 상태
          <select
            name="isReady"
            value={form.isReady}
            onChange={handleChange}
          >
            <option value="N">
              준비 필요
            </option>
            <option value="Y">
              준비 완료
            </option>
          </select>
        </label>

        <div className="checklist-actions">
          <button
            type="submit"
            className="checklist-button"
            disabled={submitting}
          >
            {submitting
              ? "처리 중..."
              : isEdit
                ? "수정"
                : "등록"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChecklistForm;