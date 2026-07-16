import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

function QuizList() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  // 🔑 로그인 세션 판별부 (관리자 판단)
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;
  
  // MemberVO의 id가 'admin'이거나, 실명(name)이 '관리자'인 경우를 관리자로 판단합니다.[cite: 9]
  const isAdmin = loginInfo && (loginInfo.id === "admin" || loginInfo.name === "관리자");

  useEffect(() => {
    axios.get("http://localhost/quiz/list.do")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setList(response.data);
        } else {
          console.warn("데이터가 배열 형식이 아닙니다:", response.data);
        }
      })
      .catch((error) => {
        console.error("퀴즈 리스트 로딩 실패: ", error);
      });
  }, []);

  // 리스트 렌더링 및 예외 방어
  let trTag = list.length > 0 ? (
    list.map((vo) => (
      <tr key={vo.no} className="align-middle">
        <td className="text-muted">{vo.no}</td>
        <td className="text-start fw-semibold text-dark ps-4">{vo.title}</td>
        <td className="text-secondary">{vo.writeDate ? format(new Date(vo.writeDate), "yyyy-MM-dd") : "-"}</td>
        <td><span className="badge bg-light text-secondary border">{vo.hit}</span></td>
        <td>
          {/* 버튼 디자인 변경: btn-success -> btn-outline-success */}
          <button 
            className="btn btn-sm btn-outline-success px-3 rounded-pill" 
            onClick={() => navigate(`/quiz/view?no=${vo.no}&inc=1`)}
          >
            <i className="bi bi-play-fill me-1"></i>퀴즈 풀기
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center text-muted py-5">
        등록된 퀴즈가 없습니다. 우측 하단의 [퀴즈 등록] 버튼으로 문제를 출제해 주세요.
      </td>
    </tr>
  );

  return (
    <>
      <div className="text-muted small mb-2">/quiz/list</div>
      <hr className="my-3 opacity-25" />
      
      {/* 부트스트랩 클래스 스타일만 세련되게 변경 */}
      <table className="table table-hover align-middle text-center">
        <thead className="table-light">
          <tr>
            <th style={{ width: "10%" }}>번호</th>
            <th style={{ width: "50%" }} className="text-start ps-4">문제 제목</th>
            <th style={{ width: "15%" }}>등록일</th>
            <th style={{ width: "10%" }}>조회수</th>
            <th style={{ width: "15%" }}>구분</th> 
          </tr>
        </thead>
        <tbody>
          {trTag}
        </tbody>
      </table>

      {/* 🛡️ 관리자일 경우 등록 버튼이 하단에 표시됩니다 - 원본 틀 그대로 유지 */}
      {isAdmin && (
        <div className="mt-4">
          {/* 버튼 디자인 변경: btn-primary -> btn-outline-primary */}
          <Link to={"/quiz/write"} className="btn btn-outline-primary px-4 rounded-pill">
            <i className="bi bi-plus-circle-fill me-1"></i>퀴즈 등록 (새 문제 출제)
          </Link>
        </div>
      )}
    </>
  );
}

export default QuizList;