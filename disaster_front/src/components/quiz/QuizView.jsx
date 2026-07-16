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

  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;
  
  const isAdmin = loginInfo && (loginInfo.id === "admin" || loginInfo.name === "관리자");

  useEffect(() => {
    axios.get(`http://localhost/quiz/view.do?no=${no}&inc=${inc}`)
      .then((response) => setVo(response.data))
      .catch((error) => {
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

      {vo.no && (
        // card 클래스에서 테두리를 부드럽게 조정하고 마진을 핏하게 다듬었습니다.
        <div className="card border-light shadow-sm p-4 mb-4">
          <h3 className="fw-bold text-dark mb-3">
            <span className="text-primary me-2">Q.</span>{vo.title}
          </h3>
          <p className="rounded p-4 text-dark" style={{ whiteSpace: "pre-wrap", background: "#f8f9fa", minHeight: "100px" }}>{vo.content}</p>
          <p className="text-muted small">
            <i className="bi bi-eye-fill me-1"></i>조회수: {vo.hit}
          </p>
          
          <form onSubmit={handleCheckAnswer} className="mt-4">
            <div className="input-group mb-3" style={{ maxWidth: "450px" }}>
              <input 
                type="text" 
                className="form-control rounded-start border-secondary-subtle" 
                placeholder="정답을 입력하세요" 
                value={userAns} 
                onChange={(e) => setUserAns(e.target.value)} 
                required 
              />
              <button className="btn btn-dark px-4"><i className="bi bi-send-fill me-1"></i>정답제출</button>
            </div>
          </form>

          {/* 알림 메시지 디자인 변경 */}
          {isCorrect && <div className="alert alert-success border-0 shadow-sm py-3 fw-bold mt-2 animate__animated animate__fadeIn">🎉 정답입니다! 축하합니다!</div>}

          {showExplain && (
            <div className="mt-3 p-4 rounded" style={{ border: "1px dashed #198754", background: "#f8fff5" }}>
              <h5 className="fw-bold text-success mb-2">
                <i className="bi bi-lightbulb-fill me-2"></i>핵심 정답 해설 :
              </h5>
              <p className="text-dark mb-0">{vo.explain}</p>
            </div>
          )}
        </div>
      )}

      {/* 하단 버튼 배치 및 아이콘 탑재 (원래 틀과 마크업 완벽 유지) */}
      <div className="d-flex align-items-center gap-2 mt-3">
        {isAdmin && (
          <>
            <button className="btn btn-outline-warning px-4 rounded-pill" onClick={() => navigate(`/quiz/update?no=${no}`)}>
              <i className="bi bi-pencil me-1"></i>수정
            </button>
            <button className="btn btn-outline-danger px-4 rounded-pill" onClick={handleDelete}>
              <i className="bi bi-trash me-1"></i>삭제
            </button>
          </>
        )}
        <Link to={"/quiz/list"} className="btn btn-secondary px-4 rounded-pill">
          <i className="bi bi-list-ul me-1"></i>리스트
        </Link>
      </div>
    </>
  );
}

export default QuizView;