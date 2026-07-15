import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ans, setAns] = useState('');
  const [explain, setExplain] = useState('');

  const navigate = useNavigate();

  // 🛡️ 로컬스토리지에서 로그인 ID를 꺼내와 즉시 고정 변수로 만듭니다. (useEffect 제거 가능!)
  const loginInfoStr = localStorage.getItem("login");
  let loginId = "관리자"; // 기본값
  
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
    
    // 💥 고정된 loginId를 writer 키값으로 서버에 전송합니다.
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
      <div>/quiz/write</div>
      <hr />
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label>문제 제목:</label>
          <input type="text" className="form-control" required onChange={(e) => setTitle(e.target.value)}/>
        </div>
        <div className="mb-3 mt-3">
          <label>문제 지문(내용):</label>
          <textarea className="form-control" rows="4" required onChange={(e) => setContent(e.target.value)}></textarea>
        </div>
        <div className="mb-3 mt-3">
          <label>핵심 정답:</label>
          <input type="text" className="form-control" required placeholder="단답형 정답 입력" onChange={(e) => setAns(e.target.value)}/>
        </div>
        <div className="mb-3 mt-3">
          <label>상세 정답 해설:</label>
          <textarea className="form-control" rows="3" required placeholder="상세 해설 내용 입력" onChange={(e) => setExplain(e.target.value)}></textarea>
        </div>

        <button type="submit" className="btn btn-primary mr-2">퀴즈 출제</button>
        <button type="button" className="btn btn-warning" onClick={() => navigate("/quiz/list")}>취소</button>
      </form>
    </>
  );
}

export default QuizWrite;