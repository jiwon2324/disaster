import { Routes, Route } from "react-router-dom"; 
import QuizList from "./QuizList";
import QuizWrite from "./QuizWrite";
import QuizView from "./QuizView";
import QuizUpdate from "./QuizUpdate";
import NotFoundPage from "../error/NotFoundPage";

function QuizComp(){
  return (
    <div className="container mt-5">
      {/* 제보 게시판과 일관된 깔끔한 카드 레이아웃 */}
      <div className="card shadow-sm border-light">
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-patch-question-fill me-2"></i>퀴즈 게시판
          </h2>
          <hr className="text-secondary opacity-25 mt-3 mb-0" />
        </div>
        
        {/* 내부 라우터들이 렌더링되는 바디 영역 */}
        <div className="card-body p-4">
          <Routes>
            <Route path="list" element={<QuizList /> } />
            <Route path="view" element={<QuizView /> } />
            <Route path="write" element={<QuizWrite /> } />
            <Route path="update" element={<QuizUpdate /> } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        
        <div className="card-footer bg-white border-0 pb-4 text-center text-muted small">
          매일 새로운 퀴즈로 지식을 넓혀보세요!
        </div>
      </div>
    </div>
  )
}

export default QuizComp;