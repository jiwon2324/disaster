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

  // 🟢 [관리자 즉시 삭제 분기 기능이 포함된 핸들러]
  const handleDeleteClick = async () => {
    // 현재 계정이 관리자인지 여부 판단 플래그
    const isAdmin = loginInfo && (
      loginInfo.sub === "admin" || 
      loginInfo.sub === "admin01" || 
      loginInfo.name === "관리자"
    );

    if (isAdmin) {
      if (window.confirm("관리자 권한으로 이 제보글을 즉시 삭제하시겠습니까?")) {
        try {
          // 관리자는 패스워드 검증을 우회하므로 가짜 pw를 채우고 writer에 권한 ID를 실어 보냅니다.
          const adminVo = {
            no: no,
            pw: "admin_master_pass", 
            writer: loginInfo.sub
          };
          const response = await axios.post("http://localhost/community/delete.do", adminVo);
          alert(response.data);
          navigate("/community/list");
        } catch (error) {
          alert(error.response?.data || '관리자 삭제 중 오류가 발생되었습니다.');
        }
      }
    } else {
      // 일반 회원은 기존처럼 모달창(비밀번호 입력)을 토글시킵니다.
      setShowDelete(!showDelete);
    }
  };

  // 🛡️ [권한 검증 플래그 최종본]
  const isAuthor = loginInfo && (
    loginInfo.sub === vo.writer || 
    loginInfo.sub === "admin" || 
    loginInfo.sub === "admin01" || 
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
      
      {/* 🟢 [수정] 일반 회원 검증 로직을 매핑할 수 있도록 writer 속성을 추가로 넘겨줍니다. */}
      { showDelete && <CommunityDelete no={vo.no} writer={vo.writer} handleCancel={handleDeleteClick} />}
    </>
  );
}

export default CommunityView;