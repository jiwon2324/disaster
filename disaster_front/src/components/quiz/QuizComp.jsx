import { Routes, Route } from "react-router-dom"; 
import QuizList from "./QuizList";
import QuizWrite from "./QuizWrite";
import QuizView from "./QuizView";
import QuizUpdate from "./QuizUpdate";
import NotFoundPage from "../error/NotFoundPage";

function QuizComp(){
  return (
    <div className="mt-5">
      <h2> 퀴즈 게시판</h2>
      <Routes>
        <Route path="list" element={<QuizList /> } />
        <Route path="view" element={<QuizView /> } />
        <Route path="write" element={<QuizWrite /> } />
        <Route path="update" element={<QuizUpdate /> } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default QuizComp;