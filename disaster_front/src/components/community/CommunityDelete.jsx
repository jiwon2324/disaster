import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CommunityDelete({no, handleCancel}){
    // 🔑 로컬스토리지 로그인 정보 수집
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  const [vo, setVo] = useState({no:no, pw:""});
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // 🟢 일반 회원의 로그인 ID(sub) 또는 이름을 매핑하여 vo 주머니 재구성
    const deleteVo = {
      no: vo.no,
      pw: vo.pw,
      writer: loginInfo ? loginInfo.sub : "" 
    };

    try {
      const response = await axios.post("http://localhost/community/delete.do", deleteVo);
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