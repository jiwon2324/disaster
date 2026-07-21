import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";

function MemberMyPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [showWithdrawModal, setShowWithdrawModal] =
        useState(false);

    const [currentPw, setCurrentPw] = useState("");
    const [withdrawError, setWithdrawError] = useState("");
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/member/login");
            return;
        }

        loadMemberInfo();
    }, [token, navigate]);

    const loadMemberInfo = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                `${API_BASE_URL}/member/me.do`,
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            setMember(response.data);
        } catch (error) {
            console.error(
                "회원정보 조회 실패:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                error.response?.data?.error ||
                "회원정보를 불러오지 못했습니다."
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("login");

                alert("로그인이 만료되었습니다.");

                navigate("/member/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        if (Array.isArray(value)) {
            const [year, month, day] = value;

            return `${year}-${String(month).padStart(
                2,
                "0"
            )}-${String(day).padStart(2, "0")}`;
        }

        return String(value)
            .replace("T", " ")
            .slice(0, 10);
    };

    const displayStatus = (status) => {
        if (!status) {
            return "-";
        }

        if (
            status === "NORMAL" ||
            status === "ACTIVE" ||
            status === "정상"
        ) {
            return "정상";
        }

        if (
            status === "DORMANT" ||
            status === "SLEEP" ||
            status === "휴면"
        ) {
            return "휴면";
        }

        if (
            status === "STOP" ||
            status === "SUSPENDED" ||
            status === "FORCED" ||
            status === "강퇴"
        ) {
            return "강퇴";
        }

        if (
            status === "WITHDRAW" ||
            status === "WITHDRAWN" ||
            status === "탈퇴"
        ) {
            return "탈퇴";
        }

        return status;
    };

    const openWithdrawModal = () => {
        setCurrentPw("");
        setWithdrawError("");
        setShowWithdrawModal(true);
    };

    const closeWithdrawModal = () => {
        if (withdrawing) {
            return;
        }

        setCurrentPw("");
        setWithdrawError("");
        setShowWithdrawModal(false);
    };

    const handleWithdraw = async (event) => {
        event.preventDefault();

        setWithdrawError("");

        if (!currentPw.trim()) {
            setWithdrawError(
                "현재 비밀번호를 입력해주세요."
            );
            return;
        }

        const confirmed = window.confirm(
            "정말 회원 탈퇴하시겠습니까?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setWithdrawing(true);

            const response = await axios.put(
                `${API_BASE_URL}/member/withdraw.do`,
                {
                    currentPw: currentPw.trim()
                },
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert(
                response.data?.message ||
                "회원 탈퇴가 되었습니다."
            );

            localStorage.removeItem("token");
            localStorage.removeItem("login");

            window.location.href = "/";
        } catch (error) {
            console.error(
                "회원 탈퇴 실패:",
                error
            );

            setWithdrawError(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                error.response?.data?.error ||
                "회원 탈퇴에 실패하였습니다. 비밀번호를 확인해주세요."
            );
        } finally {
            setWithdrawing(false);
        }
    };

    if (loading) {
        return (
            <main style={styles.messagePage}>
                회원정보를 불러오는 중입니다.
            </main>
        );
    }

    if (errorMessage || !member) {
        return (
            <main style={styles.messagePage}>
                <div className="alert alert-warning">
                    {errorMessage ||
                        "회원정보가 존재하지 않습니다."}
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/")}
                >
                    메인으로
                </button>
            </main>
        );
    }

    const isAdmin =
        Number(member.gradeNo) === 9 ||
        String(member.gradeName || "").includes(
            "관리자"
        );

    return (
        <>
            <main style={styles.page}>
                <div
                    className="container"
                    style={styles.container}
                >
                    <header style={styles.header}>
                        <p style={styles.categoryLabel}>
                            {isAdmin
                                ? "회원관리"
                                : "마이페이지"}
                        </p>

                        <h1 style={styles.title}>
                            {isAdmin
                                ? "회원정보보기"
                                : "내 정보보기"}
                        </h1>

                        <p style={styles.description}>
                            회원정보를 확인할 수 있습니다.
                        </p>
                    </header>

                    <section style={styles.card}>
                        <div style={styles.profileHeader}>
                            <div style={styles.profileIcon}>
                                👤
                            </div>

                            <div>
                                <h2 style={styles.memberName}>
                                    {member.name || "-"}
                                </h2>

                                <p style={styles.memberGrade}>
                                    {member.gradeName ||
                                        (isAdmin
                                            ? "관리자"
                                            : "일반회원")}
                                </p>
                            </div>
                        </div>

                        <div style={styles.infoList}>
                            <InfoRow
                                label="아이디"
                                value={member.id}
                            />

                            <InfoRow
                                label="이름"
                                value={member.name}
                            />

                            <InfoRow
                                label="성별"
                                value={member.gender}
                            />

                            <InfoRow
                                label="생년월일"
                                value={formatDate(
                                    member.birth
                                )}
                            />

                            <InfoRow
                                label="연락처"
                                value={member.tel}
                            />

                            <InfoRow
                                label="이메일"
                                value={member.email}
                            />

                            <InfoRow
                                label="가입일"
                                value={formatDate(
                                    member.regDate
                                )}
                            />

                            <InfoRow
                                label="최근 접속일"
                                value={formatDate(
                                    member.conDate
                                )}
                            />

                            <InfoRow
                                label="상태"
                                value={displayStatus(
                                    member.status
                                )}
                            />

                            <InfoRow
                                label="등급번호"
                                value={
                                    member.gradeNo ?? "-"
                                }
                            />

                            <InfoRow
                                label="등급명"
                                value={
                                    member.gradeName ||
                                    (isAdmin
                                        ? "관리자"
                                        : "일반회원")
                                }
                            />
                        </div>

                        <div style={styles.buttonArea}>
                            {isAdmin ? (
                                <button
                                    type="button"
                                    className="btn btn-primary px-4"
                                    onClick={() =>
                                        navigate(
                                            "/member/admin"
                                        )
                                    }
                                >
                                    리스트
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger px-4"
                                        onClick={
                                            openWithdrawModal
                                        }
                                    >
                                        회원 탈퇴
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-primary px-4"
                                        onClick={() =>
                                            navigate(
                                                "/member/update"
                                            )
                                        }
                                    >
                                        수정
                                    </button>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {showWithdrawModal && (
                <div style={styles.modalOverlay}>
                    <section
                        style={styles.modalCard}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="withdraw-title"
                    >
                        <h2
                            id="withdraw-title"
                            style={styles.modalTitle}
                        >
                            회원 탈퇴
                        </h2>

                        <p style={styles.modalDescription}>
                            회원 탈퇴를 진행하려면 현재
                            비밀번호를 입력해주세요.
                        </p>

                        {withdrawError && (
                            <div className="alert alert-danger">
                                {withdrawError}
                            </div>
                        )}

                        <form
                            onSubmit={handleWithdraw}
                        >
                            <div className="mb-4">
                                <label
                                    htmlFor="currentPw"
                                    className="form-label fw-semibold"
                                >
                                    비밀번호
                                </label>

                                <input
                                    type="password"
                                    id="currentPw"
                                    className="form-control"
                                    placeholder="현재 비밀번호를 입력해주세요."
                                    value={currentPw}
                                    onChange={(event) =>
                                        setCurrentPw(
                                            event.target
                                                .value
                                        )
                                    }
                                    style={
                                        styles.passwordInput
                                    }
                                    autoComplete="current-password"
                                    autoFocus
                                    maxLength={20}
                                />
                            </div>

                            <div
                                style={
                                    styles.modalButtonArea
                                }
                            >
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4"
                                    onClick={
                                        closeWithdrawModal
                                    }
                                    disabled={withdrawing}
                                >
                                    취소
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-danger px-4"
                                    disabled={withdrawing}
                                >
                                    {withdrawing
                                        ? "처리 중..."
                                        : "탈퇴"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={styles.infoRow}>
            <div style={styles.infoLabel}>
                {label}
            </div>

            <div style={styles.infoValue}>
                {value === null ||
                value === undefined ||
                value === ""
                    ? "-"
                    : value}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "calc(100vh - 70px)",
        padding: "58px 24px 90px",
        backgroundColor: "#f6f8fb"
    },

    container: {
        maxWidth: "850px"
    },

    header: {
        marginBottom: "26px"
    },

    categoryLabel: {
        marginBottom: "7px",
        color: "#0d6efd",
        fontSize: "14px",
        fontWeight: "700"
    },

    title: {
        marginBottom: "9px",
        color: "#20242c",
        fontSize: "36px",
        fontWeight: "800"
    },

    description: {
        margin: 0,
        color: "#737c8a",
        fontSize: "15px"
    },

    card: {
        padding: "38px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e9ef",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30,45,70,0.05)"
    },

    profileHeader: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
        paddingBottom: "28px",
        borderBottom: "1px solid #edf0f3"
    },

    profileIcon: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "65px",
        height: "65px",
        backgroundColor: "#eef5ff",
        borderRadius: "50%",
        fontSize: "30px"
    },

    memberName: {
        margin: "0 0 5px",
        color: "#20242c",
        fontSize: "23px",
        fontWeight: "800"
    },

    memberGrade: {
        margin: 0,
        color: "#737c8a",
        fontSize: "14px"
    },

    infoList: {
        marginTop: "12px"
    },

    infoRow: {
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        padding: "18px 8px",
        borderBottom: "1px solid #edf0f3"
    },

    infoLabel: {
        color: "#626b78",
        fontSize: "14px",
        fontWeight: "700"
    },

    infoValue: {
        color: "#20242c",
        fontSize: "15px"
    },

    buttonArea: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "30px"
    },

    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor:
            "rgba(0, 0, 0, 0.48)"
    },

    modalCard: {
        width: "100%",
        maxWidth: "470px",
        padding: "32px",
        backgroundColor: "#ffffff",
        borderRadius: "14px",
        boxShadow:
            "0 20px 50px rgba(0, 0, 0, 0.2)"
    },

    modalTitle: {
        marginBottom: "10px",
        color: "#20242c",
        fontSize: "25px",
        fontWeight: "800"
    },

    modalDescription: {
        marginBottom: "24px",
        color: "#737c8a",
        fontSize: "14px",
        lineHeight: "1.6"
    },

    passwordInput: {
        minHeight: "50px"
    },

    modalButtonArea: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
    },

    messagePage: {
        maxWidth: "800px",
        margin: "120px auto",
        padding: "20px",
        textAlign: "center"
    }
};

export default MemberMyPage;