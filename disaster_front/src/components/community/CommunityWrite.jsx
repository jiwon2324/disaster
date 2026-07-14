import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CommunityWrite(){
  // 강사님 이미지 게시판 구조 표준 데이터 가공 세팅
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [writer, setWriter] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  
  // 파일 핸들링 및 미리보기 URL 자원 상태 변수 세팅
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');

  const navigate = useNavigate();

  // 첫 진입 시 제목 필드 포커싱 활성화
  useEffect(()=>{
    document.getElementById('title').focus();
  },[]);

  // 강사님 파일 핸들러 구조 이식 (Object URL 생성 및 예외 위임 처리)
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

  // 등록 비동기 가공 제출 이벤트 처리기
  const handleSubmit = async (e) => {
    e.preventDefault();

    if(pw !== pw2){
      alert('비밀번호와 비밀번호 확인은 같아야 합니다.');
      setPw('');
      setPw2('');
      document.getElementById('pw').focus();
      return false;
    }

    if (!imageFile) {
      alert('제보 이미지 파일을 선택해주세요.');
      return;
    }

    // 파일 통합 전송을 위한 멀티파트 폼 데이터 객체 가공
    const formData = new FormData();

    // 텍스트 속성 바인딩용 데이터 모델링
    const vo = {
      title : title,
      content : content,
      writer : writer,
      pw : pw
    }

    console.log(vo);

    // 강사님 아키텍처 핵심: JSON 문자열을 application/json 타입의 Blob 구조로 변환 후 적재
    formData.append('vo', new Blob([JSON.stringify(vo)], { type: 'application/json' }));
    formData.append('imageFile', imageFile);

    try {
      const response = await axios.post("http://localhost/community/write.do",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert(response.data);
      navigate("/community/list");
    } catch (error) {
      console.log(error);
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
          <input type="text" className="form-control" id="title"
           placeholder="제보 제목 입력" name="title" required maxLength={100}
           onChange={(e) => setTitle(e.target.value)}/>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="content">내용:</label>
          <textarea className="form-control" rows="5" id="content"
           name="content" required placeholder="상세 제보 내용 입력" 
           onChange={(e) => setContent(e.target.value)}></textarea>
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="writer" className="form-label">작성자:</label>
          <input type="text" className="form-control" id="writer"
           placeholder="제보자명 입력" name="writer" required maxLength={10}
           onChange={(e) => setWriter(e.target.value)}/>
        </div>

        <div className="mb-3">
          <label htmlFor="pw" className="form-label">비밀번호:</label>
          <input type="password" className="form-control" id="pw"
           placeholder="비밀번호를 입력하세요" name="pw" required maxLength={20}
           value={pw}
           onChange={(e) => setPw(e.target.value)} />
        </div>

        <div className="mb-3">
          <label htmlFor="pw2" className="form-label">비밀번호 확인:</label>
          <input type="password" className="form-control" id="pw2"
           placeholder="비밀번호 확인을 입력하세요" required maxLength={20} 
           value={pw2}
           onChange={(e) => setPw2(e.target.value)} />
        </div>

        <div className="mb-3 mt-3">
          <label htmlFor="imageFile" className="form-label">제보 현장 이미지 첨부:</label>
          <input type="file" className="form-control" id="imageFile"
           name="imageFile" required accept="image/*"
           onChange={handleFileChange}/>
        </div>

        {/* 실시간 업로드 자원 동적 렌더링 검증 처리 */}
        <div className="mb-3 mt-3">
          {preview && <img src={preview} alt="제보사진 미리보기" style={{ maxWidth: '300px', border: '1px solid #ddd' }} />}
        </div>

        <button type="submit" className="btn btn-primary mr-2">제보 등록</button>
        <button type="reset" className="btn btn-success mr-2" onClick={() => setPreview('')}>새로입력</button>
        <button type="button" className="btn btn-warning"
          onClick={() => navigate("/community/list")}>취소</button>
      </form>
    </>
  );
}

export default CommunityWrite;