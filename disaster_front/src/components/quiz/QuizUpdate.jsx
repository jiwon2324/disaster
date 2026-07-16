import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

function QuizUpdate() {
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const navigate = useNavigate();
  const [vo, setVo] = useState({});

  useEffect(() => {
    axios.get(`http://localhost/quiz/view.do?no=${no}&inc=0`)
      .then((response) => setVo(response.data))
      .catch((error) => {
        console.error("수정 데이터 로드 에러: ", error);
        alert('데이터 수집 오류');
      });
  }, [no]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost/quiz/update.do", vo);
      alert(response.data);
      navigate(`/quiz/view?no=${no}&inc=0`);
    } catch (error) {
      console.error("퀴즈 업데이트 중 예외 발생: ", error);
      alert('퀴즈 수정 오류 발생');
    }
  }

  const changeData = (event) => {
    const { name, value } = event.target;
    setVo({ ...vo, [name]: value });
  }

  return (
    <>
      <div className="text-muted small mb-2">/quiz/update</div>
      <hr className="my-3 opacity-25" />
      
      <div className="card border-0 p-3 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">퀴즈 번호:</label>
            <input type="text" className="form-control rounded border-secondary-subtle bg-light text-muted" name="no" value={vo.no || ''} readOnly style={{cursor: 'not-allowed'}} />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">문제 명:</label>
            <input type="text" className="form-control rounded border-secondary-subtle" name="title" value={vo.title || ''} required onChange={changeData}/>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">문제 내용:</label>
            <textarea className="form-control rounded border-secondary-subtle" rows="5" name="content" value={vo.content || ''} required onChange={changeData}></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">정답 변경:</label>
            <input type="text" className="form-control rounded border-secondary-subtle" name="ans" value={vo.ans || ''} required onChange={changeData}/>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold text-secondary">해설 변경:</label>
            <textarea className="form-control rounded border-secondary-subtle" rows="4" name="explain" value={vo.explain || ''} required onChange={changeData}></textarea>
          </div>
          
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-warning px-5 rounded-pill text-white fw-bold">
              <i className="bi bi-check-circle me-1"></i>수정 완료
            </button>
            <button type="button" className="btn btn-light px-4 rounded-pill border border-secondary-subtle text-secondary" onClick={() => navigate(`/quiz/view?no=${no}&inc=0`)}>
              <i className="bi bi-x-circle me-1"></i>취소
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default QuizUpdate;