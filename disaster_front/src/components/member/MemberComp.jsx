import { Route, Routes } from "react-router-dom";

import NotFoundPage from "../error/NotFoundPage";
import AdminMemberDetail from "./AdminMemberDetail";
import AdminMemberList from "./AdminMemberList";
import MemberLogin from "./MemberLogin";
import MemberMyPage from "./MemberMyPage";
import MemberPassword from "./MemberPassword";
import MemberPasswordFind from "./MemberPasswordFind";
import MemberUpdate from "./MemberUpdate";
import MemberWrite from "./MemberWrite";

function MemberComp() {
    return (
        <section>
            <Routes>
                <Route
                    path="login"
                    element={<MemberLogin />}
                />

                <Route
                    path="write"
                    element={<MemberWrite />}
                />

                <Route
                    path="find-password"
                    element={<MemberPasswordFind />}
                />

                <Route
                    path="mypage"
                    element={<MemberMyPage />}
                />

                <Route
                    path="update"
                    element={<MemberUpdate />}
                />

                <Route
                    path="password"
                    element={<MemberPassword />}
                />

                <Route
                    path="admin"
                    element={<AdminMemberList />}
                />

                <Route
                    path="admin/:id"
                    element={<AdminMemberDetail />}
                />

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
            </Routes>
        </section>
    );
}

export default MemberComp;