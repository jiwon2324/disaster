import { Routes, Route } from "react-router-dom"

import TopNavi from "./components/common/TopNavi"
import Home from "./components/common/Home"
import NotFoundMenu from "./components/error/NotFoundMenu"
import MemberComp from "./components/member/MemberComp"
import CommunityComp from "./components/community/CommunityComp"
import QuizComp from "./components/quiz/QuizComp"

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

                    <Route path="/member/*" element={<MemberComp />} />
                    <Route path="/community/*" element={<CommunityComp />} />
                    <Route path="/quiz/*" element={<QuizComp />} />

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
        </>
    )
}

export default App