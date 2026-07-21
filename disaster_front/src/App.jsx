import { Route, Routes } from "react-router-dom";

import TopNavi from "./components/common/TopNavi";
import Home from "./components/common/Home";
import NotFoundMenu from "./components/error/NotFoundMenu";

import MemberComp from "./components/member/MemberComp";
import CommunityComp from "./components/community/CommunityComp";
import QuizComp from "./components/quiz/QuizComp";

import DisasterCategory from "./components/disaster/DisasterCategory";
import DisasterList from "./components/disaster/DisasterList";
import DisasterDetail from "./components/disaster/DisasterDetail";
import DisasterScrap from "./components/disaster/DisasterScrap";
import DisasterForm from "./components/disaster/DisasterForm";
import DisasterEditForm from "./components/disaster/DisasterEditForm";

import EduGuideList from "./components/guide/EduGuideList";
import EduGuideView from "./components/guide/EduGuideView";
import EduGuideForm from "./components/guide/EduGuideForm";

import ChecklistList from "./components/checklist/ChecklistList";
import ChecklistForm from "./components/checklist/ChecklistForm";

import QnaList from "./components/qna/QnaList";
import QnaView from "./components/qna/QnaView";
import QnaWrite from "./components/qna/QnaWrite";
import QnaEdit from "./components/qna/QnaEdit";

function App() {
    return (
        <>
            <TopNavi />

            <div style={{ paddingTop: "56px" }}>
                <Routes>
                    <Route
                        path="/"
                        element={<Home />}
                    />

                    {/* 재난 정보 */}
                    <Route
                        path="/disasterCategory/list"
                        element={<DisasterCategory />}
                    />

                    <Route
                        path="/disasterInfo/list/:catid"
                        element={<DisasterList />}
                    />

                    <Route
                        path="/disasterInfo/detail/:id"
                        element={<DisasterDetail />}
                    />

                    <Route
                        path="/disasterScrap/list"
                        element={<DisasterScrap />}
                    />

                    <Route
                        path="/disasterInfo/create"
                        element={<DisasterForm />}
                    />

                    <Route
                        path="/disasterInfo/edit/:id"
                        element={<DisasterEditForm />}
                    />

                    {/* 회원 */}
                    <Route
                        path="/member/*"
                        element={<MemberComp />}
                    />

                    {/* 커뮤니티 */}
                    <Route
                        path="/community/*"
                        element={<CommunityComp />}
                    />

                    {/* 문의게시판 */}
                    <Route
                        path="/qna"
                        element={<QnaList />}
                    />

                    <Route
                        path="/qna/write"
                        element={<QnaWrite />}
                    />

                    <Route
                        path="/qna/:no/edit"
                        element={<QnaEdit />}
                    />

                    <Route
                        path="/qna/:no"
                        element={<QnaView />}
                    />

                    {/* 퀴즈 */}
                    <Route
                        path="/quiz/*"
                        element={<QuizComp />}
                    />

                    {/* 교육가이드 */}
                    <Route
                        path="/edu"
                        element={<EduGuideList />}
                    />

                    <Route
                        path="/edu/write"
                        element={<EduGuideForm />}
                    />

                    <Route
                        path="/edu/:no"
                        element={<EduGuideView />}
                    />

                    <Route
                        path="/edu/:no/edit"
                        element={<EduGuideForm />}
                    />

                    {/* 체크리스트 */}
                    <Route
                        path="/checklists"
                        element={<ChecklistList />}
                    />

                    <Route
                        path="/checklists/write"
                        element={<ChecklistForm />}
                    />

                    <Route
                        path="/checklists/:no/edit"
                        element={<ChecklistForm />}
                    />

                    <Route
                        path="*"
                        element={<NotFoundMenu />}
                    />
                </Routes>
            </div>
        </>
    );
}

export default App;