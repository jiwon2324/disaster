import { useState, useEffect } from "react";
import axios from "axios";
import "../board/Board.css";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";

function QuizList(){
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost/quiz/list.do")
    .then((response) => {
      setList(response.data);
    })
    .catch((error) => console.error(error));
  }, []);

  let trTag = list.map((vo) => (
    <tr className="dataRow" key={vo.no} onClick={() => navigate(`/quiz/view?no=${vo.no}&inc=1`)}>
      <td>{vo.no}</td>
      <td>{vo.title}</td>
      <td>{vo.writer}</td>
      <td>{format(new Date(vo.writeDate), "yyyy-MM-dd")}</td>
      <td>{vo.hit}</td>
    </tr>
  ));

  return(
    <>
      <div>/quiz/list</div>
      <hr />
      <table className="table table-hover">
        <thead>
          <tr><th>번호</th><th>문제 제목</th><th>출제자</th><th>등록일</th><th>도전 횟수</th></tr>
        </thead>
        <tbody>{trTag}</tbody>
      </table>
      <Link to={"/quiz/write"} className="btn btn-primary">퀴즈 출제하기</Link>
    </>
  );
}

export default QuizList;