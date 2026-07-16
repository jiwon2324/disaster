import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CommunityDelete({no, handleCancel}){
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  const [vo, setVo] = useState({no:no, pw:""});
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
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
    // alert-secondary 대신 card 스타일 적용, 부드러운 애니메이션을 위한 클래스 추가
    <div className="card border-danger shadow mt-4 mb-4 animate__animated animate__fadeInUp">
      <div className="card-header bg-danger text-white border-bottom-0 p-3">
          <h6 className="card-title mb-0 fw-bold">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>제보글 삭제 확인
          </h6>
      </div>
      
      <div className="card-body p-4 bg-white rounded-bottom">
          <p className="text-dark mb-4 border-bottom border-light pb-3">
              이 제보글(<strong className="text-danger">No. {no}</strong>)을 정말로 삭제하시겠습니까?<br />
              삭제된 데이터는 복구할 수 없습니다. 본인 확인을 위해 비밀번호를 입력해주세요.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="pw" className="form-label fw-bold text-secondary">본인 확인용 비밀번호</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-danger-subtle text-danger"><i className="bi bi-key-fill"></i></span>
                <input type="password" className="form-control rounded-end border-danger-subtle" id="pw" required placeholder="비밀번호를 입력하세요." onChange={(e) => setVo({no:vo.no, pw:e.target.value})} style={{borderColor: '#dc3545'}} />
              </div>
            </div>
            
            {/* 버튼 영역 정렬 개선 */}
            <div className="d-flex justify-content-end align-items-center gap-2 pt-2">
                <button type="submit" className="btn btn-danger px-4 rounded-pill">
                    <i className="bi bi-trash3-fill me-1"></i>정말 삭제합니다
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-light px-4 rounded-pill text-secondary border border-secondary-subtle">
                    <i className="bi bi-x-circle me-1"></i>취소
                </button>
            </div>
          </form>
      </div>
    </div>
  );
}

export default CommunityDelete;