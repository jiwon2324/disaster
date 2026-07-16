import { useState, useEffect } from "react";
import axios from "axios";
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
        <tr className="dataRow align-middle" key={vo.no}
         onClick={() => navigate(`/community/view?no=${vo.no}&inc=1`)} style={{ cursor: "pointer" }}>
          <td className="no text-center text-muted">{vo.no}</td>
          <td>
            <div className="d-flex align-items-center">
              {vo.fileName && <img src={`http://localhost/image/${vo.fileName}`} alt="thumb" className="img-thumbnail rounded me-2" style={{width:"45px", height:"45px", objectFit:"cover"}} />}
              <span className="fw-semibold text-dark">{vo.title}</span>
            </div>
          </td>
          <td className="text-center">{vo.writer}</td>
          <td className="text-center text-secondary">{format(new Date(vo.writeDate), "yyyy-MM-dd")}</td>
          <td className="text-center"><span className="badge bg-light text-secondary border">{vo.hit}</span></td>
        </tr>
      )
    }
  )

  return(
    <>

      
      {/* 부트스트랩 클래스 스타일만 변경 */}
      <table className="table table-hover align-middle">
        <thead className="table-light text-center">
          <tr>
            <th style={{ width: "8%" }}>번호</th>
            <th>제목</th>
            <th style={{ width: "15%" }}>작성자</th>
            <th style={{ width: "15%" }}>작성일</th>
            <th style={{ width: "10%" }}>조회수</th>
          </tr>
        </thead>
        <tbody>
          {myJSON.list.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-5 text-muted">등록된 제보가 없습니다.</td>
            </tr>
          ) : trTag}
        </tbody>
      </table>

      {/* 🛡️ 로그인 정보가 존재하는 유저에게만 [제보하기] 버튼을 노출시킵니다 - 원본 순서 및 틀 백퍼센트 유지 */}
      {loginInfo && (
        <div className="mb-3">
          <Link to={"/community/write"} className="btn btn-outline-primary px-4">
            <i className="bi bi-pencil-square me-1"></i>제보하기
          </Link>
        </div>
      )}
      
      {/* 제보판 내부 페이지를 넘겨주는 페이지네이션 컴포넌트 위치 그대로 유지 */}
      <PageNation pageObject={myJSON.pageObject} />
    </>
  );
}

export default CommunityList;