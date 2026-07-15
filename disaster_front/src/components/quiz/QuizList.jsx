import { useState, useEffect } from "react";
import axios from "axios";
import "../board/Board.css"; 
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

function QuizList() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

// 🔑 강사님의 MemberVO 스펙에 맞춰 싱크를 조정한 로그인 세션 판별부
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;
  
  // MemberVO의 id가 'admin'이거나, 실명(name)이 '관리자'인 경우를 관리자로 판단합니다.
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
        <td>{vo.no}</td>
        <td>{vo.title}</td>
        <td>{vo.writer}</td>
        <td>{vo.writeDate ? format(new Date(vo.writeDate), "yyyy-MM-dd") : "-"}</td>
        <td>{vo.hit}</td>
        <td>
          <button 
            className="btn btn-sm btn-success" 
            onClick={() => navigate(`/quiz/view?no=${vo.no}&inc=1`)}
          >
            퀴즈 풀기
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="text-center text-muted py-5">
        등록된 퀴즈가 없습니다. 우측 하단의 [퀴즈 등록] 버튼으로 문제를 출제해 주세요!
      </td>
    </tr>
  );

  return (
    <>
      <div className="mb-2">/quiz/list</div>
      <hr />
      <table className="table table-hover text-center">
        <thead>
          <tr>
            <th style={{ width: "10%" }}>번호</th>
            <th style={{ width: "45%" }}>문제 제목</th>
            <th style={{ width: "15%" }}>출제자</th>
            <th style={{ width: "15%" }}>등록일</th>
            <th style={{ width: "10%" }}>조회수</th>
          </tr>
        </thead>
        <tbody>
          {trTag}
        </tbody>
      </table>

      {/* 🛡️ 관리자일 경우 등록 버튼이 하단에 온전히 표시됩니다 */}
      {isAdmin && (
        <div className="mt-3">
          <Link to={"/quiz/write"} className="btn btn-primary">
            퀴즈 등록 (새 문제 출제)
          </Link>
        </div>
      )}
    </>
  );
}

export default QuizList;