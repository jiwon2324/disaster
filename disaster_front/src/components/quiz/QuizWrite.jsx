import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function QuizWrite() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [ans, setAns] = useState('');
  const [writer, setWriter] = useState('');
  const [explain, setExplain] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 💥 백엔드 비즈니스 로직(QuizServiceImpl)에 맞춘 핵심 속성만 데이터 송신
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
        <div className="mb-3 mt-3">
          <label>출제자 닉네임:</label>
          <input type="text" className="form-control" required onChange={(e) => setWriter(e.target.value)}/>
        </div>
        <button type="submit" className="btn btn-primary mr-2">퀴즈 출제</button>
        <button type="button" className="btn btn-warning" onClick={() => navigate("/quiz/list")}>취소</button>
      </form>
    </>
  );
}

export default QuizWrite;