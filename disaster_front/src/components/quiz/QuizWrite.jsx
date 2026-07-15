import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ans, setAns] = useState('');
  const [explain, setExplain] = useState('');
  
  // 🔑 들여쓰기를 맞추고 직접 깨끗하게 작성해 줍니다.
  const [writer, setWriter] = useState('관리자');

  const navigate = useNavigate();

  useEffect(() => {
    const loginInfoStr = localStorage.getItem("login");
    if (loginInfoStr) {
      try {
        const loginInfo = JSON.parse(loginInfoStr);
        if (loginInfo?.id) {
          setWriter(loginInfo.id); // 👈 이제 이 부분의 빨간 밑줄이 사라집니다!
        }
      } catch (e) {
        console.error("로그인 정보 파싱 실패: ", e);
      }
    }
  }, []);

  // ... 이하 handleSubmit 및 return 부분은 기존과 동일

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 💥 백엔드 비즈니스 로직에 맞춰 수집된 writer와 함께 전송합니다.
    const data = { title, content, ans, writer, explain };

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

        {/* ✂️ '출제자 닉네임' 입력창 영역은 깔끔하게 제거되었습니다. */}

        <button type="submit" className="btn btn-primary mr-2">퀴즈 출제</button>
        <button type="button" className="btn btn-warning" onClick={() => navigate("/quiz/list")}>취소</button>
      </form>
    </>
  );
}

export default QuizWrite;