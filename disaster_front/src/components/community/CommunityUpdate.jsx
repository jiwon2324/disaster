import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function CommunityUpdate(){
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const navigate = useNavigate();
  const [vo, setVo] = useState({});

  useEffect(()=>{
    axios.get(`http://localhost/community/view.do?no=${no}&inc=0`)
    .then((response) =>{
      setVo(response.data);
    }).catch((error)=> {
      console.error('데이터 로드 에러:', error);
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })
  },[no]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost/community/update.do", vo);
      alert(response.data);
      navigate(`/community/view?no=${no}&inc=0`);
    } catch (error) {
      alert(error.response?.data || '글수정 중 서버 오류가 발생되었습니다.');
    }
  }

  const changeData = (event) => {
    const {name, value} = event.target;
    setVo({ ...vo, [name]:value });
  }

  return(
    <>
      <div>/community/update</div>
      <hr />
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3"><label>번호:</label><input type="text" className="form-control" name="no" value={vo.no || ''} readOnly /></div>
        <div className="mb-3 mt-3"><label>제목:</label><input type="text" className="form-control" name="title" value={vo.title || ''} required onChange={changeData}/></div>
        <div className="mb-3 mt-3"><label>내용:</label><textarea className="form-control" rows="5" name="content" value={vo.content || ''} required onChange={changeData}></textarea></div>
        <div className="mb-3 mt-3"><label>작성자:</label><input type="text" className="form-control" name="writer" value={vo.writer || ''} required onChange={changeData}/></div>
        <div className="mb-3"><label>본인 확인 비밀번호:</label><input type="password" className="form-control" name="pw" value={vo.pw || ''} required onChange={changeData} /></div>
        <button type="submit" className="btn btn-primary mr-2">수정</button>
        <button type="button" className="btn btn-warning" onClick={()=>navigate(`/community/view?no=${no}&inc=0`)}>취소</button>
      </form>
    </>
  );
}

export default CommunityUpdate;