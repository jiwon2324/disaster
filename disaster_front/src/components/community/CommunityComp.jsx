import { Routes, Route } from "react-router-dom"; 
import CommunityList from "./CommunityList";
import CommunityWrite from "./CommunityWrite";
import CommunityView from "./CommunityView";
import CommunityUpdate from "./CommunityUpdate";
import NotFoundPage from "../error/NotFoundPage";

function CommunityComp(){
  return (
    // mt-5 유지, 디자인을 위해 card 클래스 추가
    <div className="container mt-5">
      <div className="card shadow-sm border-0">
        {/* 제목 부분을 카드 헤더로 스타일링 */}
        <div className="card-header bg-white border-0 pt-4 pb-0">
          <h2 className="card-title text-center fw-bold text-primary">
            <i className="bi bi-megaphone-fill me-2"></i>제보 게시판
          </h2>
          <hr className="text-secondary opacity-25" />
        </div>
        
        {/* 실제 콘텐츠가 바뀌는 부분 */}
        <div className="card-body p-4">
          <Routes>
            <Route path="list" element={<CommunityList /> } />
            <Route path="view" element={<CommunityView /> } />
            <Route path="write" element={<CommunityWrite /> } />
            <Route path="update" element={<CommunityUpdate /> } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        
        <div className="card-footer bg-white border-0 pb-3 text-center text-muted small">
          안전한 사회를 위한 당신의 제보가 큰 힘이 됩니다.
        </div>
      </div>
    </div>
  )
}

export default CommunityComp;