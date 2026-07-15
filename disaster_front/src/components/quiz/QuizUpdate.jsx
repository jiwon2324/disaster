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
      <div>/quiz/update</div>
      <hr />
      <form onSubmit={handleSubmit}>
        <div className="mb-3 mt-3">
          <label>퀴즈 번호:</label>
          <input type="text" className="form-control" name="no" value={vo.no || ''} readOnly />
        </div>
        <div className="mb-3 mt-3">
          <label>문제 명:</label>
          <input type="text" className="form-control" name="title" value={vo.title || ''} required onChange={changeData}/>
        </div>
        <div className="mb-3 mt-3">
          <label>문제 내용:</label>
          <textarea className="form-control" rows="4" name="content" value={vo.content || ''} required onChange={changeData}></textarea>
        </div>
        <div className="mb-3 mt-3">
          <label>정답 변경:</label>
          <input type="text" className="form-control" name="ans" value={vo.ans || ''} required onChange={changeData}/>
        </div>
        <div className="mb-3 mt-3">
          <label>해설 변경:</label>
          <textarea className="form-control" rows="3" name="explain" value={vo.explain || ''} required onChange={changeData}></textarea>
        </div>
        <button type="submit" className="btn btn-primary mr-2">수정 완료</button>
        <button type="button" className="btn btn-warning" onClick={() => navigate(`/quiz/view?no=${no}&inc=0`)}>취소</button>
      </form>
    </>
  );
}

export default QuizUpdate;