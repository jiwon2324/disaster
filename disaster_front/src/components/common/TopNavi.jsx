import { useEffect, useState } from "react";
import {
    Link,
    NavLink,
    useNavigate
} from "react-router-dom";
import {
    Check,
    ShieldCheck
} from "lucide-react";

import "./TopNavi.css";

function TopNavi() {
    const navigate = useNavigate();

    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [login, setLogin] = useState(() => {
        const savedLogin =
            localStorage.getItem("login");

        if (!savedLogin) {
            return null;
        }

        try {
            return JSON.parse(savedLogin);
        } catch {
            return null;
        }
    });

    const [
        isLogoutModalOpen,
        setIsLogoutModalOpen
    ] = useState(false);

    /**
     * 로그아웃 처리
     *
     * 1. JWT 토큰 삭제
     * 2. 로그인 회원정보 삭제
     * 3. 상단 메뉴 로그인 상태 초기화
     * 4. 로그아웃 완료 모달 표시
     */
    const logout = (event) => {
        event.preventDefault();

        localStorage.removeItem("token");
        localStorage.removeItem("login");

        setToken(null);
        setLogin(null);
        setIsLogoutModalOpen(true);
    };

    /**
     * 로그아웃 완료 모달 확인
     */
    const confirmLogout = () => {
        setIsLogoutModalOpen(false);
        navigate("/");
    };

    /**
     * ESC 키로 모달 닫기
     */
    useEffect(() => {
        if (!isLogoutModalOpen) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                confirmLogout();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [isLogoutModalOpen]);

    const loginName =
        login?.name
        || login?.id
        || login?.sub
        || "회원";

    const rawRoles =
        login?.roles
        || login?.role
        || [];

    const roles =
        Array.isArray(rawRoles)
            ? rawRoles
            : rawRoles
                ? [rawRoles]
                : [];

    const isAdmin =
        roles.some((role) => {
            const normalizedRole =
                String(role).toUpperCase();

            return (
                normalizedRole === "ROLE_ADMIN"
                || normalizedRole === "ADMIN"
            );
        })
        || Number(login?.gradeNo) === 9
        || String(
            login?.gradeName || ""
        ).includes("관리자")
        || String(loginName).includes("관리자");

    const getNavClassName = ({
                                 isActive
                             }) => {
        return isActive
            ? "nav-link active"
            : "nav-link";
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg safety-navbar fixed-top">
                <div className="container-fluid">
                    <Link
                        className="navbar-brand safety-brand"
                        to="/"
                        aria-label="안전온 홈으로 이동"
                    >
                        <ShieldCheck
                            className="safety-brand-icon"
                            size={32}
                            strokeWidth={2.3}
                        />

                        <span className="safety-brand-text">
                            안전온
                        </span>
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainNavbar"
                        aria-controls="mainNavbar"
                        aria-expanded="false"
                        aria-label="메뉴 열기"
                    >
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div
                        className="collapse navbar-collapse"
                        id="mainNavbar"
                    >
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/community/list"
                                >
                                    제보게시판
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/qna"
                                >
                                    문의게시판
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/disasterCategory/list"
                                >
                                    재난 정보
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/disasterScrap/list"
                                >
                                    스크랩
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/quiz/list"
                                >
                                    퀴즈
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/edu"
                                >
                                    교육가이드
                                </NavLink>
                            </li>

                            <li className="nav-item">
                                <NavLink
                                    className={
                                        getNavClassName
                                    }
                                    to="/checklists"
                                >
                                    체크리스트
                                </NavLink>
                            </li>
                        </ul>

                        <ul className="navbar-nav ms-auto">
                            {!token ? (
                                <>
                                    <li className="nav-item">
                                        <NavLink
                                            className={
                                                getNavClassName
                                            }
                                            to="/member/login"
                                        >
                                            로그인
                                        </NavLink>
                                    </li>

                                    <li className="nav-item">
                                        <NavLink
                                            className={
                                                getNavClassName
                                            }
                                            to="/member/write"
                                        >
                                            회원가입
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {isAdmin ? (
                                        <li className="nav-item">
                                            <NavLink
                                                className={
                                                    getNavClassName
                                                }
                                                to="/member/admin"
                                            >
                                                회원관리
                                            </NavLink>
                                        </li>
                                    ) : (
                                        <>
                                            <li className="nav-item">
                                                <NavLink
                                                    className={
                                                        getNavClassName
                                                    }
                                                    to="/member/mypage"
                                                >
                                                    마이페이지
                                                </NavLink>
                                            </li>

                                            <li className="nav-item">
                                                <NavLink
                                                    className={
                                                        getNavClassName
                                                    }
                                                    to="/member/password"
                                                >
                                                    비밀번호 변경
                                                </NavLink>
                                            </li>
                                        </>
                                    )}

                                    <li className="nav-item">
                                        <span className="nav-link safety-member-name">
                                            {isAdmin
                                                ? "관리자님"
                                                : `${loginName}님`}
                                        </span>
                                    </li>

                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/"
                                            onClick={logout}
                                        >
                                            로그아웃
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {isLogoutModalOpen && (
                <div
                    className="safety-logout-modal-backdrop"
                    role="presentation"
                >
                    <div
                        className="safety-logout-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logoutModalTitle"
                        aria-describedby="logoutModalDescription"
                    >
                        <div className="safety-logout-icon-wrap">
                            <Check
                                className="safety-logout-icon"
                                size={35}
                                strokeWidth={2.2}
                                aria-hidden="true"
                            />
                        </div>

                        <h2
                            id="logoutModalTitle"
                            className="safety-logout-title"
                        >
                            로그아웃이 완료되었습니다.
                        </h2>

                        <p
                            id="logoutModalDescription"
                            className="safety-logout-description"
                        >
                            이용해 주셔서 감사합니다.
                        </p>

                        <button
                            type="button"
                            className="safety-logout-confirm-button"
                            onClick={confirmLogout}
                            autoFocus
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default TopNavi;