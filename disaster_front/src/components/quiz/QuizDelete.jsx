import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizDelete({ no, handleCancel }) {
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (confirmText !== "삭제") {
      alert("정확히 '삭제'라고 입력하셔야 삭제가 진행됩니다.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost/quiz/delete.do?no=${no}`);
      alert(response.data); 
      navigate("/quiz/list");
    } catch (error) {
      console.error("퀴즈 삭제 중 서버 오류 발생: ", error);
      alert("퀴즈 삭제 중 서버 오류가 발생했습니다.");
    }
  };

  return (
    // alert-secondary 대신 card 스타일을 적용하여 경고 효과를 세련되게 바꿨습니다.
    <div className="card border-danger shadow-sm mt-4 mb-4">
      <div className="card-header bg-danger text-white border-bottom-0 p-3">
          <h6 className="card-title mb-0 fw-bold">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>퀴즈 영구 삭제 확인
          </h6>
      </div>
      
      <div className="card-body p-4 bg-white rounded-bottom">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="confirmText" className="form-label text-danger fw-bold mb-2">
              ⚠️ 삭제를 원하시면 아래에 "삭제"라고 입력하세요 :
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-light border-danger-subtle text-danger"><i className="bi bi-shield-slash-fill"></i></span>
              <input
                type="text"
                className="form-control rounded-end border-danger-subtle"
                id="confirmText"
                placeholder="삭제"
                value={confirmText}
                required
                onChange={(e) => setConfirmText(e.target.value)}
                style={{ borderColor: "#dc3545" }}
              />
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button className="btn btn-danger px-4 rounded-pill">
              <i className="bi bi-trash-fill me-1"></i>삭제 확정
            </button>
            <button type="button" onClick={handleCancel} className="btn btn-light px-4 rounded-pill border border-secondary-subtle text-secondary">
              <i className="bi bi-x-circle me-1"></i>취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuizDelete;