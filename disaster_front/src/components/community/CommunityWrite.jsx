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

  // 🔑 로컬스토리지 로그인 정보 미리 선언
  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  useEffect(()=>{
    // 🛡️ 비로그인 사용자 방어 차단
    if (!loginInfoStr) {
      alert("로그인 사용자만 제보 등록을 이용할 수 있습니다.");
      navigate(-1); // 주소창 경로 오류 방지를 위해 이전 페이지로 튕김 처리
      return;
    }
    
    // 안전하게 DOM 요소 확인 후 포커스
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
    
    // 🔑 [핵심 해결 포인트]
    // 인풋창에 사용자가 무엇을 적었든 상관없이, 전송 직전에 로그인한 유저의 진짜 ID(sub)로 덮어써서 보냅니다!
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
      navigate(-1); // 저장 후 안전하게 이전 리스트/상세 화면으로 이동
    } catch (error) {
      console.error(error);
      alert("제보 글 등록 중 서버 통신 에러가 발생했습니다.");
    }
  }

  return(
    <>
      <div>/community/write</div>
      <hr />
      <p>제보 게시판 등록 페이지 입니다.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label htmlFor="title" className="form-label">제목:</label>
          <input type="text" className="form-control" id="title" placeholder="제보 제목 입력" name="title" required maxLength={100} onChange={(e) => setTitle(e.target.value)}/>
        </div>
        <div className="mb-3 mt-3">
          <label htmlFor="content">내용:</label>
          <textarea className="form-control" rows="5" id="content" name="content" required placeholder="상세 제보 내용 입력" onChange={(e) => setContent(e.target.value)}></textarea>
        </div>
        
        {/* 🛡️ 작성자 칸: 손대지 못하게 readOnly 처리하고, 기본값으로 현재 로그인한 사용자 이름을 띄워줍니다. */}
        <div className="mb-3 mt-3">
          <label htmlFor="writer" className="form-label">작성자:</label>
          <input type="text" className="form-control" id="writer" name="writer" readOnly value={loginInfo ? loginInfo.name : ''} style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}/>
        </div>
        
        <div className="mb-3">
          <label htmlFor="pw" className="form-label">비밀번호:</label>
          <input type="password" className="form-control" id="pw" placeholder="비밀번호를 입력하세요" name="pw" required maxLength={20} value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="pw2" className="form-label">비밀번호 확인:</label>
          <input type="password" className="form-control" id="pw2" placeholder="비밀번호 확인을 입력하세요" required maxLength={20} value={pw2} onChange={(e) => setPw2(e.target.value)} />
        </div>
        <div className="mb-3 mt-3">
          <label htmlFor="imageFile" className="form-label">제보 현장 이미지 첨부:</label>
          <input type="file" className="form-control" id="imageFile" name="imageFile" required accept="image/*" onChange={handleFileChange}/>
        </div>
        <div className="mb-3 mt-3">
          {preview && <img src={preview} alt="제보사진 미리보기" style={{ maxWidth: '300px', border: '1px solid #ddd' }} />}
        </div>
        <button type="submit" className="btn btn-primary mr-2">제보 등록</button>
        <button type="reset" className="btn btn-success mr-2" onClick={() => setPreview('')}>새로입력</button>
        <button type="button" className="btn btn-warning" onClick={() => navigate(-1)}>취소</button>
      </form>
    </>
  );
}

export default CommunityWrite;