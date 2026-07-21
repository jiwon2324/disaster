import { Routes, Route } from "react-router-dom"

import TopNavi from "./components/common/TopNavi"
import Home from "./components/common/Home"
import NotFoundMenu from "./components/error/NotFoundMenu"

import MemberComp from "./components/member/MemberComp"

import QuizComp from "./components/quiz/QuizComp"
import CommunityComp from "./components/community/CommunityComp"

import DisasterCategory from "./components/disaster/DisasterCategory"
import DisasterList from "./components/disaster/DisasterList"
import DisasterDetail from "./components/disaster/DisasterDetail"
import DisasterScrap from "./components/disaster/DisasterScrap"
import DisasterForm from "./components/disaster/DisasterForm"
import DisasterEditForm from "./components/disaster/DisasterEditForm"

import EduGuideList from "./components/guide/EduGuideList"
import EduGuideView from "./components/guide/EduGuideView"
import EduGuideForm from "./components/guide/EduGuideForm"

import ChecklistList from "./components/checklist/ChecklistList"
import ChecklistForm from "./components/checklist/ChecklistForm"


function App() {
    return (
        <>
            <TopNavi />

            <div className="container pt-5">
                <Routes>
                    <Route path="/" element={<Home />} />

                    {/* 재난 */}
                    <Route path="/disasterCategory/list" element={<DisasterCategory />} />
                    <Route path="/disasterInfo/list/:catid" element={<DisasterList />} />
                    <Route path="/disasterInfo/detail/:id" element={<DisasterDetail />} />
                    <Route path="/disasterScrap/list" element={<DisasterScrap />} />
                    <Route path="/disasterInfo/create" element={<DisasterForm />} />
                    <Route path="/disasterInfo/edit/:id" element={<DisasterEditForm />} />

                    {/* 회원 */}
                    <Route path="/member/*" element={<MemberComp />} />

                    {/* 커뮤니티 */}
                    <Route path="/community/*" element={<CommunityComp />} />

                    {/* 퀴즈 */}
                    <Route path="/quiz/*" element={<QuizComp />} />

                    {/* 교육 */}
                    <Route path="/edu" element={<EduGuideList />} />
                    <Route path="/edu/write" element={<EduGuideForm />} />
                    <Route path="/edu/:no" element={<EduGuideView />} />
                    <Route path="/edu/:no/edit" element={<EduGuideForm />} />

                    {/* 체크리스트 */}
                    <Route path="/checklists" element={<ChecklistList />} />
                    <Route path="/checklists/write" element={<ChecklistForm />} />
                    <Route path="/checklists/:no/edit" element={<ChecklistForm />} />

                    <Route path="*" element={<NotFoundMenu />} />
                </Routes>
            </div>
        </>
    );
}

export default App;