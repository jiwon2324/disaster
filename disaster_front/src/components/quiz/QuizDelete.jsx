import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizDelete({ no, handleCancel }) {
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 단순한 오타 방지용 검증 (예: '삭제'라고 정확히 쳐야 삭제가 작동하도록 구현)
    if (confirmText !== "삭제") {
      alert("정확히 '삭제'라고 입력하셔야 삭제가 진행됩니다.");
      return;
    }

    try {
      // 🚨 백엔드 RequestMapping @PostMapping("/delete.do") 스펙 적용[cite: 49]
      const response = await axios.post(`http://localhost/quiz/delete.do?no=${no}`);
      alert(response.data); // "퀴즈 및 연관 해설 정보가 완전히 삭제되었습니다."[cite: 49]
      navigate("/quiz/list");
    } catch (error) {
      console.error("퀴즈 삭제 중 서버 오류 발생: ", error);
      alert("퀴즈 삭제 중 서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="alert alert-secondary m-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="confirmText" className="form-label text-danger fw-bold">
            ⚠️ 삭제를 원하시면 아래에 "삭제"라고 입력하세요 :
          </label>
          <input
            type="text"
            className="form-control"
            id="confirmText"
            placeholder="삭제"
            value={confirmText}
            required
            onChange={(e) => setConfirmText(e.target.value)}
          />
        </div>
        <button className="btn btn-danger mr-2">삭제 확정</button>&nbsp;
        <button type="button" onClick={handleCancel} className="btn btn-success">
          취소
        </button>
      </form>
    </div>
  );
}

export default QuizDelete;