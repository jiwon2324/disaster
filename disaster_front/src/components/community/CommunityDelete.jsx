import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CommunityDelete({no, handleCancel}){
  const [vo, setVo] = useState({no:no, pw:""});
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost/community/delete.do", vo);
      alert(response.data);
      navigate("/community/list");
    } catch (error) {
      alert(error.response?.data || '글삭제 중 오류가 발생되었습니다.');
    }
  }

  return(
    <div className="alert alert-secondary m-3">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="pw" className="form-label">본인 확인용 비밀번호 :</label>
          <input type="password" className="form-control" id="pw" required onChange={(e) => setVo({no:vo.no, pw:e.target.value})} />
        </div>
        <button className="btn btn-danger">제보글 삭제</button>&nbsp;
        <button type="button" onClick={handleCancel} className="btn btn-success">취소</button>
      </form>
    </div>
  );
}

export default CommunityDelete;