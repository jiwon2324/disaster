import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CommunityWrite(){
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writer] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');

  const navigate = useNavigate();

  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  useEffect(()=>{
    if (!loginInfoStr) {
      alert("로그인 사용자만 제보 등록을 이용할 수 있습니다.");
      navigate(-1); 
      return;
    }
    
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.focus();
  }, [navigate, loginInfoStr]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setPreview('');
      return;
    }
    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(pw !== pw2){
      alert('비밀번호와 비밀번호 확인은 같아야 합니다.');
      setPw('');
      setPw2('');
      const pwInput = document.getElementById('pw');
      if (pwInput) pwInput.focus();
      return false;
    }

    if (!imageFile) {
      alert('제보 이미지 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    
    const vo = { 
      title, 
      content, 
      writer: loginInfo ? loginInfo.sub : writer, 
      pw 
    };

    formData.append('vo', new Blob([JSON.stringify(vo)], { type: 'application/json' }));
    formData.append('imageFile', imageFile);

    try {
      const response = await axios.post("http://localhost/community/write.do",
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      alert(response.data);
      navigate(-1); 
    } catch (error) {
      console.error(error);
      alert("제보 글 등록 중 서버 통신 에러가 발생했습니다.");
    }
  }

  return(
    <>

      {/* 폼 전체를 감싸는 카드 스타일 적용 */}
      <div className="card border-light shadow-sm mb-4">
        <div className="card-header bg-white border-bottom border-light p-3">
            <h5 className="card-title mb-0 fw-bold text-dark">
                <i className="bi bi-pencil-square me-2 text-primary"></i>제보 내용 입력
            </h5>
            <p className="text-muted small mb-0 mt-1">정확하고 상세한 제보는 문제 해결에 큰 도움이 됩니다.</p>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* 제목 */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label fw-bold text-secondary">제보 제목</label>
              <input type="text" className="form-control form-control-lg rounded border-secondary-subtle" id="title" placeholder="무엇을 제보하시겠습니까? (예: OO동 도로 파손)" name="title" required maxLength={100} onChange={(e) => setTitle(e.target.value)}/>
            </div>
            
            {/* 내용 */}
            <div className="mb-3">
              <label htmlFor="content" className="form-label fw-bold text-secondary">상세 내용</label>
              <textarea className="form-control rounded border-secondary-subtle" rows="8" id="content" name="content" required placeholder="일시, 장소, 상황 등 구체적인 내용을 적어주세요." onChange={(e) => setContent(e.target.value)}></textarea>
            </div>
            
            <div className="row">
                {/* 작성자 (ReadOnly) */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="writer" className="form-label fw-bold text-secondary">작성자 권한</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-secondary-subtle text-muted"><i className="bi bi-person-fill"></i></span>
                    <input type="text" className="form-control rounded-end border-secondary-subtle" id="writer" name="writer" readOnly value={loginInfo ? loginInfo.name : ''} style={{ backgroundColor: '#f8f9fa', cursor: 'not-allowed', color: '#6c757d' }}/>
                  </div>
                </div>
            </div>

            <div className="row border-top border-light pt-3 mt-2">
                {/* 비밀번호 */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="pw" className="form-label fw-bold text-secondary">비밀번호 설정</label>
                  <input type="password" className="form-control rounded border-secondary-subtle" id="pw" placeholder="수정/삭제 시 필요합니다." name="pw" required maxLength={20} value={pw} onChange={(e) => setPw(e.target.value)} />
                </div>
                {/* 비밀번호 확인 */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="pw2" className="form-label fw-bold text-secondary">비밀번호 확인</label>
                  <input type="password" className="form-control rounded border-secondary-subtle" id="pw2" placeholder="비밀번호를 한번 더 입력하세요." required maxLength={20} value={pw2} onChange={(e) => setPw2(e.target.value)} />
                </div>
            </div>

            {/* 파일 첨부 영역 디자인 개선 */}
            <div className="mb-3 border-top border-light pt-3 mt-2">
              <label htmlFor="imageFile" className="form-label fw-bold text-secondary">
                <i className="bi bi-camera-fill me-1"></i>제보 현장 이미지 첨부 (필수)
              </label>
              <input type="file" className="form-control rounded border-secondary-subtle" id="imageFile" name="imageFile" required accept="image/*" onChange={handleFileChange}/>
              <div className="form-text text-muted small">현장 상황을 잘 보여주는 사진을 첨부해주세요.</div>
            </div>
            
            {/* 미리보기 영역 개선 */}
            {preview && (
                <div className="mb-4 p-3 bg-light rounded text-center border border-light shadow-inner">
                    <p className="text-muted small mb-2">이미지 미리보기</p>
                    <img src={preview} alt="제보사진 미리보기" className="img-thumbnail rounded shadow-sm" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} />
                </div>
            )}
            
            {/* 하단 버튼 영역 정렬 및 디자인 변경 */}
            <div className="d-flex justify-content-end align-items-center gap-2 border-top pt-4 mt-4">
                <button type="submit" className="btn btn-primary px-5 rounded-pill">
                    <i className="bi bi-check-circle me-1"></i>제보 등록
                </button>
                <button type="reset" className="btn btn-outline-secondary px-4 rounded-pill" onClick={() => setPreview('')}>
                    <i className="bi bi-arrow-counterclockwise me-1"></i>새로입력
                </button>
                <button type="button" className="btn btn-light px-4 rounded-pill text-danger border border-danger-subtle" onClick={() => navigate(-1)}>
                    <i className="bi bi-x-circle me-1"></i>취소
                </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CommunityWrite;