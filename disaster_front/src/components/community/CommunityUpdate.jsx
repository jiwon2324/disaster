import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import axios from "axios";

function CommunityUpdate(){
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [vo, setVo] = useState({});
  const [imageFile, setImageFile] = useState(null); // 새로 첨부할 이미지 파일 State

  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;
  
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

  // 파일 선택 이벤트 처리
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updateVo = {
      ...vo,
      writer: vo.writer,
      pw: isAdmin ? "admin_master_pass" : vo.pw
    };

    try {
      // 1. 텍스트 정보 수정 요청 (/community/update.do)
      await axios.post("http://localhost/community/update.do", updateVo);

      // 2. 새 이미지 파일이 첨부되어 있다면 이미지 교체 API 호출 (/community/changeImage.do)
      if (imageFile) {
        const formData = new FormData();
        formData.append("no", no);
        formData.append("changeImage", imageFile); // 백엔드 파라미터명과 동일하게 지정

        await axios.post("http://localhost/community/changeImage.do", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
      }

      alert("제보글 및 이미지가 성공적으로 수정되었습니다.");
      navigate(`/community/view?no=${no}&inc=0`);
    } catch (error) {
      console.error("수정 실패:", error);
      alert(error.response?.data || '글수정 중 서버 오류가 발생되었습니다.');
    }
  }

  const changeData = (event) => {
    const {name, value} = event.target;
    setVo({ ...vo, [name]:value });
  }

  return(
    <>
      {/* 수정 폼 카드 스타일 적용 */}
      <div className="card border-light shadow-sm mb-4">
        <div className="card-header bg-white border-bottom border-light p-3">
            <h5 className="card-title mb-0 fw-bold text-dark">
                <i className="bi bi-pencil me-2 text-warning"></i>제보 내용 수정
            </h5>
            <p className="text-muted small mb-0 mt-1">No. {no}번 제보글을 수정합니다.</p>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
                {/* 번호 (ReadOnly) */}
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold text-secondary">제보 번호</label>
                  <input type="text" className="form-control rounded border-secondary-subtle bg-light text-muted" name="no" value={vo.no || ''} readOnly style={{cursor: 'not-allowed'}}/>
                </div>
                {/* 작성자 (ReadOnly) */}
                <div className="col-md-8 mb-3">
                  <label className="form-label fw-bold text-secondary">작성자</label>
                  <input type="text" className="form-control rounded border-secondary-subtle bg-light text-muted" name="writer" value={vo.writer || ''} readOnly style={{ cursor: 'not-allowed' }}/>
                </div>
            </div>
            
            {/* 제목 */}
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary">제보 제목</label>
              <input type="text" className="form-control form-control-lg rounded border-secondary-subtle" name="title" value={vo.title || ''} required onChange={changeData} placeholder="제목을 입력하세요."/>
            </div>
            
            {/* 내용 */}
            <div className="mb-3">
              <label className="form-label fw-bold text-secondary">상세 내용</label>
              <textarea className="form-control rounded border-secondary-subtle" rows="10" name="content" value={vo.content || ''} required onChange={changeData} placeholder="내용을 입력하세요."></textarea>
            </div>

            {/* 이미지 영역 */}
            <div className="mb-3 p-3 bg-light rounded text-center border border-light shadow-inner">
                {vo.fileName ? (
                  <>
                    <p className="text-muted small mb-2">현재 첨부된 이미지</p>
                    <img src={`http://localhost/image/${vo.fileName}`} alt="현재 제보사진" className="img-thumbnail rounded shadow-sm mb-3" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                  </>
                ) : (
                  <p className="text-muted small mb-2">현재 첨부된 이미지가 없습니다.</p>
                )}
                
                <div className="text-start mt-2 border-top pt-2">
                  <label className="form-label fw-bold text-secondary small">새 이미지로 변경 (선택)</label>
                  <input 
                    type="file" 
                    className="form-control form-control-sm rounded border-secondary-subtle" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <div className="form-text text-muted small">새 이미지를 첨부하면 기존 이미지가 교체됩니다.</div>
                </div>
            </div>

            {/* 비밀번호 입력창 (관리자가 아닐 때만) */}
            {!isAdmin && (
              <div className="mb-3 border-top border-light pt-3 mt-3">
                <label className="form-label fw-bold text-danger"><i className="bi bi-shield-lock-fill me-1"></i>본인 확인 비밀번호</label>
                <input type="password" className="form-control form-control-lg rounded border-danger-subtle" name="pw" value={vo.pw || ''} required onChange={changeData} placeholder="글 등록 시 설정한 비밀번호를 입력하세요." style={{borderColor: '#ffc107'}}/>
              </div>
            )}

            {/* 하단 버튼 영역 */}
            <div className="d-flex justify-content-end align-items-center gap-2 border-top pt-4 mt-4">
                <button type="submit" className="btn btn-warning px-5 rounded-pill text-white fw-bold">
                    <i className="bi bi-check-circle me-1"></i>수정 완료
                </button>
                <button type="button" className="btn btn-light px-4 rounded-pill text-secondary border border-secondary-subtle" onClick={()=>navigate(`/community/view?no=${no}&inc=0`)}>
                    <i className="bi bi-x-circle me-1"></i>취소
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CommunityUpdate;