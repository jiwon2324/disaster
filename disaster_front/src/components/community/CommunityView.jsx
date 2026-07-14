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

  useEffect(()=>{
    axios.get(`http://localhost/community/view.do?no=${no}&inc=${inc}`)
    .then((response) =>{
      setVo(response.data);
    }).catch((error)=> {
      console.log(`error : ${error}`);
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })
  }, [no]);

  const handleDeleteClick = () => {
    setShowDelete(!showDelete);
  }

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
              <tr><th>작성일</th><td>{format(new Date(vo.writeDate), "yyyy-MM-dd")}</td></tr>
              <tr><th>조회수</th><td>{vo.hit}</td></tr>
            </tbody>
          )
        }
      </table>
      <button className="btn btn-primary" onClick={() => navigate(`/community/update?no=${no}`)}>수정</button>&nbsp;
      <button className="btn btn-danger" onClick={handleDeleteClick}>삭제</button>&nbsp;
      <Link to={"/community/list"} className="btn btn-success">리스트</Link>&nbsp;
      { showDelete && <CommunityDelete no = {vo.no} handleCancel={handleDeleteClick} />}
    </>
  );
}

export default CommunityView;