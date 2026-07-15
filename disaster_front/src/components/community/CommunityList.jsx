import { useState, useEffect } from "react";
import axios from "axios";
import "../board/Board.css"; 
import PageNation from "../common/PageNation";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";

function CommunityList(){
  const [searchParams] = useSearchParams();
  const page = searchParams.get('page');
  const perPageNum = searchParams.get('perPageNum');
  const key = searchParams.get('key');
  const word = searchParams.get('word');

  const navigate = useNavigate();

  // 🔑 로그인 정보 유무 체크 (비로그인 시 null)
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  const notPageQuery = `perPageNum=${perPageNum==null?"":perPageNum}&key=${key==null?"":key}&word=${word==null?"":word}`;
  const query = `page=${page==null?"":page}&${notPageQuery}`;

  const [myJSON, setMyJSON] = useState({list:[], pageObject:{}});

  useEffect(
    function(){
      axios.get("http://localhost/community/list.do?" + query)
      .then((response) => {
        setMyJSON(response.data);
      })
      .catch((error) => {
        console.error("에러 발생 :", error);
      })
    }, [query]
  );

  let trTag = myJSON.list.map(
    (vo) => {
      return (
        <tr className="dataRow" key={vo.no}
         onClick={() => navigate(`/community/view?no=${vo.no}&inc=1`)}>
          <td className="no">{vo.no}</td>
          <td>
            {vo.fileName && <img src={`http://localhost/image/${vo.fileName}`} alt="thumb" style={{width:"50px", marginRight:"10px"}} />}
            {vo.title}
          </td>
          <td>{vo.writer}</td>
          <td>{format(new Date(vo.writeDate), "yyyy-MM-dd")}</td>
          <td>{vo.hit}</td>
        </tr>
      )
    }
  )

  return(
    <>
      <div>/community/list</div>
      <hr /> <br />
      <table className="table table-hover">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {trTag}
        </tbody>
      </table>

      {/* 🛡️ 로그인 정보가 존재하는 유저에게만 [제보하기] 버튼을 노출시킵니다 */}
      {loginInfo && (
        <Link to={"/community/write"} className="btn btn-primary">제보하기</Link>
      )}
      
      <PageNation pageObject={myJSON.pageObject} />
    </>
  );
}

export default CommunityList;