import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";

function MemberPassword() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [currentPw, setCurrentPw] =
        useState("");

    const [newPw, setNewPw] =
        useState("");

    const [newPwConfirm, setNewPwConfirm] =
        useState("");

    const [showCurrentPw, setShowCurrentPw] =
        useState(false);

    const [showNewPw, setShowNewPw] =
        useState(false);

    const [showNewPwConfirm, setShowNewPwConfirm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/member/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");

        if (!currentPw.trim()) {
            setErrorMessage(
                "현재 비밀번호를 입력해주세요."
            );
            return;
        }

        if (!newPw.trim()) {
            setErrorMessage(
                "새 비밀번호를 입력해주세요."
            );
            return;
        }

        if (
            newPw.length < 4 ||
            newPw.length > 20
        ) {
            setErrorMessage(
                "새 비밀번호는 4자 이상 20자 이하로 입력해주세요."
            );
            return;
        }

        if (!newPwConfirm.trim()) {
            setErrorMessage(
                "새 비밀번호 확인을 입력해주세요."
            );
            return;
        }

        if (newPw !== newPwConfirm) {
            setErrorMessage(
                "새 비밀번호가 일치하지 않습니다."
            );
            return;
        }

        if (currentPw === newPw) {
            setErrorMessage(
                "현재 비밀번호와 다른 비밀번호를 입력해주세요."
            );
            return;
        }

        try {
            setSaving(true);

            const response = await axios.put(
                `${API_BASE_URL}/member/password.do`,
                {
                    currentPw: currentPw,
                    newPw: newPw
                },
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert(
                response.data?.message ||
                "비밀번호가 변경되었습니다."
            );

            /*
             * 비밀번호 변경 후 기존 로그인 정보를 제거하고
             * 다시 로그인하도록 이동
             */
            localStorage.removeItem("token");
            localStorage.removeItem("login");

            window.location.href =
                "/member/login";
        } catch (error) {
            console.error(
                "비밀번호 변경 실패:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                "비밀번호를 변경하지 못했습니다."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <main style={styles.page}>
            <div
                className="container"
                style={styles.container}
            >
                <header style={styles.header}>
                    <p style={styles.categoryLabel}>
                        마이페이지
                    </p>

                    <h1 style={styles.title}>
                        비밀번호 변경
                    </h1>

                    <p style={styles.description}>
                        안전한 계정 사용을 위해
                        비밀번호를 변경할 수 있습니다.
                    </p>
                </header>

                <section style={styles.card}>
                    {errorMessage && (
                        <div className="alert alert-danger">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <PasswordField
                            id="currentPw"
                            label="현재 비밀번호"
                            value={currentPw}
                            showPassword={showCurrentPw}
                            onChange={(event) =>
                                setCurrentPw(
                                    event.target.value
                                )
                            }
                            onToggle={() =>
                                setShowCurrentPw(
                                    (previous) =>
                                        !previous
                                )
                            }
                            placeholder="현재 비밀번호를 입력해주세요."
                            autoComplete="current-password"
                        />

                        <PasswordField
                            id="newPw"
                            label="새 비밀번호"
                            value={newPw}
                            showPassword={showNewPw}
                            onChange={(event) =>
                                setNewPw(
                                    event.target.value
                                )
                            }
                            onToggle={() =>
                                setShowNewPw(
                                    (previous) =>
                                        !previous
                                )
                            }
                            placeholder="새 비밀번호를 입력해주세요."
                            autoComplete="new-password"
                        />

                        <div className="form-text mb-4">
                            비밀번호는 4자 이상 20자 이하로
                            입력해주세요.
                        </div>

                        <PasswordField
                            id="newPwConfirm"
                            label="새 비밀번호 확인"
                            value={newPwConfirm}
                            showPassword={
                                showNewPwConfirm
                            }
                            onChange={(event) =>
                                setNewPwConfirm(
                                    event.target.value
                                )
                            }
                            onToggle={() =>
                                setShowNewPwConfirm(
                                    (previous) =>
                                        !previous
                                )
                            }
                            placeholder="새 비밀번호를 다시 입력해주세요."
                            autoComplete="new-password"
                        />

                        {newPwConfirm &&
                            newPw !==
                            newPwConfirm && (
                                <p
                                    style={
                                        styles.passwordMismatch
                                    }
                                >
                                    새 비밀번호가 일치하지
                                    않습니다.
                                </p>
                            )}

                        {newPwConfirm &&
                            newPw ===
                            newPwConfirm && (
                                <p
                                    style={
                                        styles.passwordMatch
                                    }
                                >
                                    새 비밀번호가
                                    일치합니다.
                                </p>
                            )}

                        <div style={styles.buttonArea}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={() =>
                                    navigate(
                                        "/member/mypage"
                                    )
                                }
                                disabled={saving}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={saving}
                            >
                                {saving
                                    ? "변경 중..."
                                    : "변경"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}

function PasswordField({
                           id,
                           label,
                           value,
                           showPassword,
                           onChange,
                           onToggle,
                           placeholder,
                           autoComplete
                       }) {
    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="form-label fw-semibold"
            >
                {label}
            </label>

            <div style={styles.passwordArea}>
                <input
                    type={
                        showPassword
                            ? "text"
                            : "password"
                    }
                    id={id}
                    className="form-control"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    maxLength={20}
                    style={styles.passwordInput}
                />

                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={onToggle}
                    style={styles.showButton}
                >
                    {showPassword
                        ? "숨기기"
                        : "보기"}
                </button>
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
        maxWidth: "760px"
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

    passwordArea: {
        display: "flex",
        gap: "8px"
    },

    passwordInput: {
        minHeight: "50px"
    },

    showButton: {
        minWidth: "76px"
    },

    passwordMismatch: {
        marginTop: "-10px",
        color: "#c92a2a",
        fontSize: "13px"
    },

    passwordMatch: {
        marginTop: "-10px",
        color: "#087f5b",
        fontSize: "13px"
    },

    buttonArea: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "30px"
    }
};

export default MemberPassword;