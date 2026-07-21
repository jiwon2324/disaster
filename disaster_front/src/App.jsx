import { Routes, Route } from "react-router-dom"
import TopNavi from "./components/common/TopNavi"
import Home from "./components/common/Home"
import NotFoundMenu from "./components/error/NotFoundMenu"
import MemberComp from "./components/member/MemberComp"
import CommunityComp from "./components/community/CommunityComp"
import QuizComp from "./components/quiz/QuizComp";
import DisasterCategory from "./components/disaster/DisasterCategory"
import DisasterList from "./components/disaster/DisasterList"
import DisasterDetail from "./components/disaster/DisasterDetail"
import DisasterScrap from "./components/disaster/DisasterScrap"
import DisasterForm from "./components/disaster/DisasterForm"
import DisasterEditForm from "./components/disaster/DisasterEditForm"

function App() {

  return (
    <>
      {/* 맨 위에 메뉴 컴포넌트 : /src/components/common/TopNavi.jsx */}
      <TopNavi />

      <div className="container pt-5">
      {/* 라이팅 - 메뉴별 */}
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 재난 정보 도메인 라우트 */}
          <Route path="/disasterCategory/list" element={<DisasterCategory />} />
          <Route path="/disasterInfo/list/:catid" element={<DisasterList />} />
          <Route path="/disasterInfo/detail/:id" element={<DisasterDetail />} />
          <Route path="/disasterScrap/list" element={<DisasterScrap />} />
          <Route path="/disasterInfo/create" element={<DisasterForm />} />
          <Route path="/disasterInfo/edit/:id" element={<DisasterEditForm />} />
          <Route path="/disasterScrap/list" element={<DisasterScrap />} />

          <Route path="/member/*" element={<MemberComp />} />
          <Route path="/community/*" element={<CommunityComp />} />
          <Route path="/quiz/*" element={<QuizComp />} />

          <Route path="*" element={<NotFoundMenu />} />
        </Routes>
      </div>
      {/* 맨 아래 회사 소개 & 카피라이트 : /src/components/common/Footer.jsx */}
    </>
  )
}

export default App