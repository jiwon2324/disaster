import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ans, setAns] = useState('');
  const [explain, setExplain] = useState('');

  const navigate = useNavigate();

  const loginInfoStr = localStorage.getItem("login");
  let loginId = "관리자"; 
  
  if (loginInfoStr) {
    try {
      const loginInfo = JSON.parse(loginInfoStr);
      if (loginInfo?.id) {
        loginId = loginInfo.id;
      }
    } catch (e) {
      console.error("로그인 정보 파싱 실패: ", e);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = { title, content, ans, writer: loginId, explain };

    try {
      const response = await axios.post("http://localhost/quiz/write.do", data);
      alert(response.data);
      navigate("/quiz/list");
    } catch (error) {
      console.error("퀴즈 등록 실패: ", error);
      alert("출제 도중 서버와의 연동 에러가 발생했습니다.");
    }
  }

  return (
    <>

      
      {/* 폼 테두리 및 그림자 클래스만 개선 */}
      <div className="card border-0 bg-light-subtle p-3 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">문제 제목:</label>
            <input type="text" className="form-control rounded border-secondary-subtle" required onChange={(e) => setTitle(e.target.value)} placeholder="직관적이고 명확한 문제명을 입력하세요."/>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">문제 지문(내용):</label>
            <textarea className="form-control rounded border-secondary-subtle" rows="5" required onChange={(e) => setContent(e.target.value)} placeholder="문제를 풀기 위한 상세한 지문 정보를 입력해 주세요."></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">핵심 정답:</label>
            <input type="text" className="form-control rounded border-secondary-subtle" required placeholder="단답형 정답 입력 (공백 유의)" onChange={(e) => setAns(e.target.value)}/>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">상세 정답 해설:</label>
            <textarea className="form-control rounded border-secondary-subtle" rows="4" required placeholder="문제 해결을 위한 상세 해설 내용을 입력하세요." onChange={(e) => setExplain(e.target.value)}></textarea>
          </div>

          <div className="d-flex gap-2 mt-4">
            {/* 버튼 디자인 변경: btn-primary -> btn-outline-primary */}
            <button type="submit" className="btn btn-outline-primary px-5 rounded-pill">
              <i className="bi bi-check-circle me-1"></i>퀴즈 출제
            </button>
            <button type="button" className="btn btn-light px-4 rounded-pill border border-secondary-subtle text-secondary" onClick={() => navigate("/quiz/list")}>
              <i className="bi bi-x-circle me-1"></i>취소
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default QuizWrite;