import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

function CommunityUpdate(){
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const navigate = useNavigate();
  const location = useLocation(); // 🔑 View에서 넘겨준 권한(state) 수집용
  
  const [vo, setVo] = useState({});

  // 🔑 LocalStorage에서 로그인 정보 확인 및 관리자 여부 플래그 세팅
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;
  
  // View에서 라우터 state로 넘겨받았거나, 현재 로그인 토큰 기준으로 관리자인지 최종 판단
  const isAdmin = location.state?.isAdmin || (
    loginInfo && (loginInfo.sub === "admin" || loginInfo.sub === "admin01" || loginInfo.name === "관리자")
  );

  useEffect(()=>{
    axios.get(`http://localhost/community/view.do?no=${no}&inc=0`)
    .then((response) => {
      setVo(response.data);
    }).catch((error)=> {
      console.error('데이터 로드 에러:', error);
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })
  }, [no]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔑 백엔드로 보낼 데이터를 재조합합니다.
    const updateVo = {
      ...vo,
      // 🟢 [수정 완료] 관리자 수정을 하더라도 DB의 작성자가 admin01로 덮어씌워지지 않도록 기존 작성자(vo.writer)를 그대로 유지합니다.
      writer: vo.writer,
      // 🔑 관리자라면 패스워드 검증 우회를 위해 마스터 키 문자열을 백엔드로 실어 보냅니다.
      pw: isAdmin ? "admin_master_pass" : vo.pw
    };

    try {
      const response = await axios.post("http://localhost/community/update.do", updateVo);
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
        <div className="mb-3 mt-3">
          <label>번호:</label>
          <input type="text" className="form-control" name="no" value={vo.no || ''} readOnly />
        </div>
        <div className="mb-3 mt-3">
          <label>제목:</label>
          <input type="text" className="form-control" name="title" value={vo.title || ''} required onChange={changeData}/>
        </div>
        <div className="mb-3 mt-3">
          <label>내용:</label>
          <textarea className="form-control" rows="5" name="content" value={vo.content || ''} required onChange={changeData}></textarea>
        </div>
        <div className="mb-3 mt-3">
          <label>작성자:</label>
          {/* 🛡️ 작성자 정보는 원본 그대로 고정하여 보여줍니다. */}
          <input type="text" className="form-control" name="writer" value={vo.writer || ''} readOnly style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}/>
        </div>

        {/* 🔑 [핵심 분기] 관리자가 아닐 때(일반 회원일 때)만 비밀번호 입력창을 화면에 렌더링합니다! */}
        {!isAdmin && (
          <div className="mb-3">
            <label>본인 확인 비밀번호:</label>
            <input type="password" className="form-control" name="pw" value={vo.pw || ''} required onChange={changeData} />
          </div>
        )}

        <button type="submit" className="btn btn-primary mr-2">수정</button>
        <button type="button" className="btn btn-warning" onClick={()=>navigate(`/community/view?no=${no}&inc=0`)}>취소</button>
      </form>
    </>
  );
}

export default CommunityUpdate;