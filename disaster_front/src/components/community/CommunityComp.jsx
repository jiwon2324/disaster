import { Routes, Route } from "react-router-dom"; 
import CommunityList from "./CommunityList";
import CommunityWrite from "./CommunityWrite";
import CommunityView from "./CommunityView";
import CommunityUpdate from "./CommunityUpdate";
import NotFoundPage from "../error/NotFoundPage";

function CommunityComp(){
  return (
    <div className="mt-5">
      <h2>제보 게시판</h2>
      <Routes>
        <Route path="list" element={<CommunityList /> } />
        <Route path="view" element={<CommunityView /> } />
        <Route path="write" element={<CommunityWrite /> } />
        <Route path="update" element={<CommunityUpdate /> } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default CommunityComp;