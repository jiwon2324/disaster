import { useState } from "react";
import { useNavigate } from "react";
import axios from "axios";

function QuizDelete({ no, handleCancel }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      // 서버로 글 번호(no)와 함께 비밀번호(password)를 같이 보냅니다.
      const response = await axios.post(`http://localhost/quiz/delete.do`, {
        no: no,
        password: password
      });

      alert(response.data); 
      navigate("/quiz/list");
    } catch (error) {
      console.error("제보글 삭제 중 서버 오류 발생: ", error);
      alert("삭제 실패: 비밀번호가 일치하지 않거나 서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="card border-danger shadow-sm mt-4 mb-4">
      <div className="card-header bg-danger text-white border-bottom-0 p-3">
        <h6 className="card-title mb-0 fw-bold">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>제보글 삭제 확인
        </h6>
      </div>

      <div className="card-body p-4 bg-white rounded-bottom">
        <p className="mb-1">
          이 제보글(<span className="text-danger fw-bold">No. {no}</span>)을 정말로 삭제하시겠습니까?
        </p>
        <p className="text-muted small mb-4">
          삭제된 데이터는 복구할 수 없습니다. 본인 확인을 위해 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-bold small text-secondary">
              본인 확인용 비밀번호
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white text-danger border-danger-subtle">
                <i className="bi bi-key-fill"></i>
              </span>
              <input
                type="password"
                className="form-control border-danger-subtle"
                id="password"
                placeholder="비밀번호를 입력하세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-danger px-4 rounded-pill">
              <i className="bi bi-trash-fill me-1"></i>정말 삭제합니다
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
