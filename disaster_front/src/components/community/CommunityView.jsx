import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import CommunityDelete from "./CommunityDelete";

function CommunityView(){
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const inc = searchParams.get('inc');

  const [vo, setVo] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const navigate = useNavigate();

  // 🔑 LocalStorage에서 로그인 유저 정보 수집
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  useEffect(()=>{
    axios.get(`http://localhost/community/view.do?no=${no}&inc=${inc}`)
    .then((response) => {
      setVo(response.data);
    }).catch((error)=> {
      console.error('상세보기 조회 에러: ', error);
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })
  }, [no, inc]);

  const handleDeleteClick = () => {
    setShowDelete(!showDelete);
  }

  // 🛡️ [권한 검증 플래그] 
  // 로그인 상태이면서 (글 작성자 ID와 내 로그인 ID가 일치하거나 OR 관리자 계정일 때)
// 🛡️ [권한 검증 플래그 최종본]
// Local Storage 구조에 맞춰 loginInfo.id 대신 loginInfo.sub를 사용합니다.
const isAuthor = loginInfo && (
  loginInfo.sub === vo.writer || 
  loginInfo.sub === "admin" || 
  loginInfo.name === "관리자"
);

  return(
    <>
      <div>/community/view</div>
      <hr />
      <table className="table">
        {!vo.no && (
          <tbody><tr><td>데이터가 존재하지 않습니다.</td></tr></tbody>
        )}
        {vo.no && (
            <tbody>
              <tr><th>번호</th><td>{vo.no}</td></tr>
              <tr><th>제목</th><td>{vo.title}</td></tr>
              <tr><th>이미지</th><td>{vo.fileName && <img src={`http://localhost/image/${vo.fileName}`} alt="제보사진" style={{maxWidth:"400px"}} />}</td></tr>
              <tr><th>내용</th><td><pre>{vo.content}</pre></td></tr>
              <tr><th>작성자</th><td>{vo.writer}</td></tr>
              {/* 날짜 데이터가 로드된 후에만 포맷팅되도록 예외 처리 보완 */}
              <tr><th>작성일</th><td>{vo.writeDate ? format(new Date(vo.writeDate), "yyyy-MM-dd") : ""}</td></tr>
              <tr><th>조회수</th><td>{vo.hit}</td></tr>
            </tbody>
          )
        }
      </table>

      {/* 🛡️ 본인 글이거나 관리자 권한을 가졌을 때만 수정/삭제 버튼 노출 */}
      {isAuthor && (
        <>
          <button className="btn btn-primary" onClick={() => navigate(`/community/update?no=${no}`)}>수정</button>&nbsp;
          <button className="btn btn-danger" onClick={handleDeleteClick}>삭제</button>&nbsp;
        </>
      )}

      <Link to={"/community/list"} className="btn btn-success">리스트</Link>&nbsp;
      { showDelete && <CommunityDelete no = {vo.no} handleCancel={handleDeleteClick} />}
    </>
  );
}

export default CommunityView;