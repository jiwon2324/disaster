import { Routes, Route } from "react-router-dom"
import TopNavi from "./components/common/TopNavi"
import Home from "./components/common/Home"
import NotFoundMenu from "./components/error/NotFoundMenu"
import BoardComp from "./components/board/BoardComp"
import ImageComp from "./components/image/ImageComp"
import MemberComp from "./components/member/MemberComp"
import EduGuideList from "./components/guide/EduGuideList"
import EduGuideView from "./components/guide/EduGuideView"
import EduGuideForm from "./components/guide/EduGuideForm"
import ChecklistList from "./components/checklist/ChecklistList"
import ChecklistForm from "./components/checklist/ChecklistForm"

function App() {

  return (
    <>
      {/* 留??꾩뿉 硫붾돱 而댄룷?뚰듃 : /src/components/common/TopNavi.jsx */}
      <TopNavi />

      <div className="container pt-5">
      {/* ?쇱씠??- 硫붾돱蹂?*/}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/*" element={<BoardComp />} />
          <Route path="/image/*" element={<ImageComp />} />
          <Route path="/member/*" element={<MemberComp />} />
          <Route path="/edu" element={<EduGuideList />} />
          <Route path="/edu/write" element={<EduGuideForm />} />
          <Route path="/edu/:no" element={<EduGuideView />} />
          <Route path="/edu/:no/edit" element={<EduGuideForm />} />
          <Route path="/checklists" element={<ChecklistList />} />
          <Route path="/checklists/write" element={<ChecklistForm />} />
          <Route path="/checklists/:no/edit" element={<ChecklistForm />} />
          <Route path="*" element={<NotFoundMenu />} />
        </Routes>
      </div>
      {/* 留??꾨옒 ?뚯궗 ?뚭컻 & 移댄뵾?쇱씠??: /src/components/common/Footer.jsx */}
    </>
  )
}

export default App
