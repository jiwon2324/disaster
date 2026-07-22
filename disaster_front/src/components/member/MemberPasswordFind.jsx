import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const API_BASE_URL =
    "http://localhost";

function MemberPasswordFind() {
    const navigate =
        useNavigate();

    const [id, setId] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage
    ] = useState("");

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!id.trim()) {
            setErrorMessage(
                "아이디를 입력해주세요."
            );

            return;
        }

        if (!email.trim()) {
            setErrorMessage(
                "이메일을 입력해주세요."
            );

            return;
        }

        const emailPattern =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (
            !emailPattern.test(
                email.trim()
            )
        ) {
            setErrorMessage(
                "이메일 형식이 올바르지 않습니다."
            );

            return;
        }

        try {
            setLoading(true);

            const response =
                await axios.post(
                    `${API_BASE_URL}/member/find-password.do`,
                    {
                        id: id.trim(),
                        email: email.trim()
                    }
                );

            setSuccessMessage(
                response.data?.message
                || "가입한 이메일로 임시 비밀번호를 발송했습니다."
            );

            setId("");
            setEmail("");

        } catch (error) {
            console.error(
                "비밀번호 찾기 실패:",
                error
            );

            setErrorMessage(
                error.response?.data?.message
                || error.response?.data?.detail
                || error.response?.data?.msg
                || error.response?.data?.error
                || "임시 비밀번호 발송에 실패했습니다."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={styles.page}>
            <section style={styles.findBox}>
                <button
                    type="button"
                    style={styles.logo}
                    onClick={() =>
                        navigate("/")
                    }
                >
                    <ShieldCheck
                        size={31}
                        strokeWidth={2.3}
                        style={styles.logoIcon}
                    />

                    <span style={styles.logoText}>
                        안전온
                    </span>
                </button>

                <header style={styles.header}>
                    <h1 style={styles.title}>
                        비밀번호 찾기
                    </h1>

                    <p style={styles.description}>
                        가입한 아이디와 이메일을 입력해주세요.
                    </p>
                </header>

                {errorMessage && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                        style={styles.alert}
                    >
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div
                        className="alert alert-success"
                        role="alert"
                        style={styles.alert}
                    >
                        {successMessage}

                        <div style={styles.successGuide}>
                            이메일에서 임시 비밀번호를
                            확인한 후 로그인해주세요.
                        </div>
                    </div>
                )}

                {!successMessage && (
                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label
                                htmlFor="findId"
                                style={styles.label}
                            >
                                아이디
                            </label>

                            <input
                                type="text"
                                id="findId"
                                className="form-control"
                                placeholder="가입한 아이디"
                                value={id}
                                onChange={(event) =>
                                    setId(
                                        event.target.value
                                    )
                                }
                                maxLength={20}
                                autoComplete="username"
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label
                                htmlFor="findEmail"
                                style={styles.label}
                            >
                                이메일
                            </label>

                            <input
                                type="email"
                                id="findEmail"
                                className="form-control"
                                placeholder="가입한 이메일"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                maxLength={50}
                                autoComplete="email"
                                style={styles.input}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            style={styles.submitButton}
                            disabled={loading}
                        >
                            {loading
                                ? "발송 중..."
                                : "임시 비밀번호 발송"}
                        </button>
                    </form>
                )}

                <div style={styles.bottomArea}>
                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100"
                        style={styles.backButton}
                        onClick={() =>
                            navigate(
                                "/member/login"
                            )
                        }
                    >
                        로그인 화면으로
                    </button>
                </div>
            </section>
        </main>
    );
}

const styles = {
    page: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 72px)",
        padding: "70px 24px",
        backgroundColor: "#ffffff"
    },

    findBox: {
        width: "100%",
        maxWidth: "510px",
        padding: "52px 58px",
        backgroundColor: "#ffffff",
        border: "1px solid #e2e7ed",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30, 45, 70, 0.07)"
    },

    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "fit-content",
        gap: "9px",
        margin: "0 auto 28px",
        padding: 0,
        background: "none",
        border: 0,
        cursor: "pointer"
    },

    logoIcon: {
        color: "#1769e0"
    },

    logoText: {
        color: "#172033",
        fontSize: "23px",
        fontWeight: "850",
        letterSpacing: "-0.05em"
    },

    header: {
        marginBottom: "34px",
        textAlign: "center"
    },

    title: {
        marginBottom: "10px",
        color: "#20242c",
        fontSize: "34px",
        fontWeight: "800"
    },

    description: {
        margin: 0,
        color: "#7b8492",
        fontSize: "15px"
    },

    alert: {
        marginBottom: "24px",
        fontSize: "14px"
    },

    successGuide: {
        marginTop: "8px",
        fontSize: "13px"
    },

    inputGroup: {
        marginBottom: "22px"
    },

    label: {
        display: "block",
        marginBottom: "9px",
        color: "#303640",
        fontSize: "15px",
        fontWeight: "700"
    },

    input: {
        height: "53px",
        padding: "0 16px",
        borderColor: "#dfe4eb",
        borderRadius: "8px",
        fontSize: "15px"
    },

    submitButton: {
        height: "54px",
        marginTop: "4px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "700"
    },

    bottomArea: {
        marginTop: "20px"
    },

    backButton: {
        height: "48px",
        borderRadius: "8px",
        fontWeight: "700"
    }
};

export default MemberPasswordFind;