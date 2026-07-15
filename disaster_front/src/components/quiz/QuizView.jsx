import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function QuizView() {
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const inc = searchParams.get('inc');

  const [vo, setVo] = useState({});
  const [userAns, setUserAns] = useState('');
  const [isCorrect, setIsCorrect] = useState(null); 
  const [showExplain, setShowExplain] = useState(false);

  const navigate = useNavigate();

 // 🔑 QuizView.jsx 상단의 로그인 판별부도 동일하게 변경해 주세요.
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;
  
  const isAdmin = loginInfo && (loginInfo.id === "admin" || loginInfo.name === "관리자");

  useEffect(() => {
    axios.get(`http://localhost/quiz/view.do?no=${no}&inc=${inc}`)
      .then((response) => setVo(response.data))
      .catch((error) => {
        // ✨ error 미사용 경고를 제거하기 위해 콘솔 출력으로 바인딩 처리
        console.error("상세보기 데이터 로딩 에러: ", error);
        alert('데이터 수집 에러');
      });
  }, [no, inc]);

  const handleCheckAnswer = (e) => {
    e.preventDefault();
    if (userAns.trim() === vo.ans.trim()) {
      setIsCorrect(true);
      setShowExplain(true);
    } else {
      setIsCorrect(false);
      alert("오답입니다! 다시 풀어보세요.");
    }
  }

  const handleDelete = async () => {
    if (!isAdmin) {
      alert("삭제 권한이 없습니다.");
      return;
    }

    if (window.confirm("정말 이 퀴즈를 삭제하시겠습니까? (해설도 자동 폐기됩니다)")) {
      try {
        // 🚨 백엔드 RequestMapping @PostMapping("/delete.do") 스펙 적용
        const response = await axios.post(`http://localhost/quiz/delete.do?no=${no}`);
        alert(response.data);
        navigate("/quiz/list");
      } catch (error) {
        console.error('퀴즈 삭제 중 에러 발생: ', error);
        alert("삭제 처리 중 에러 발생");
      }
    }
  }

  return (
    <>
      <div>/quiz/view</div>
      <hr />
      {vo.no && (
        <div className="card m-3 p-4">
          <h3>Q. {vo.title}</h3>
          <p style={{ whiteSpace: "pre-wrap", background: "#f8f9fa", padding: "15px" }}>{vo.content}</p>
          <p className="text-muted">출제자: {vo.writer} | 조회수: {vo.hit}</p>
          
          <form onSubmit={handleCheckAnswer} className="mt-3">
            <div className="input-group mb-3" style={{ maxWidth: "400px" }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="정답을 입력하세요" 
                value={userAns} 
                onChange={(e) => setUserAns(e.target.value)} 
                required 
              />
              <button className="btn btn-dark">정답제출</button>
            </div>
          </form>

          {isCorrect && <div className="alert alert-success">🎉 정답입니다!</div>}

          {showExplain && (
            <div className="mt-3 p-3" style={{ border: "1px dashed green", background: "#f1fbe9" }}>
              <h5>💡 핵심 정답 해설 :</h5>
              <p>{vo.explain}</p>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <>
          <button className="btn btn-primary" onClick={() => navigate(`/quiz/update?no=${no}`)}>수정</button>&nbsp;
          <button className="btn btn-danger" onClick={handleDelete}>삭제</button>&nbsp;
        </>
      )}
      <Link to={"/quiz/list"} className="btn btn-success">리스트</Link>
    </>
  );
}

export default QuizView;