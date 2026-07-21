import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";

const CATEGORY_OPTIONS = [
    "이용문의",
    "계정문의",
    "재난정보",
    "오류신고",
    "기타"
];

function QnaWrite() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const savedLogin = localStorage.getItem("login");

    let loginInfo = null;

    try {
        loginInfo = savedLogin
            ? JSON.parse(savedLogin)
            : token
                ? jwtDecode(token)
                : null;
    } catch {
        loginInfo = null;
    }

    const rawRoles = loginInfo?.roles;

    const roles = Array.isArray(rawRoles)
        ? rawRoles
        : rawRoles
            ? [rawRoles]
            : [];

    const isAdmin = roles.some((role) => {
        const normalizedRole =
            String(role).toUpperCase();

        return (
            normalizedRole === "ROLE_ADMIN" ||
            normalizedRole === "ADMIN"
        );
    });

    const [title, setTitle] =
        useState("");

    const [content, setContent] =
        useState("");

    const [category, setCategory] =
        useState(
            isAdmin
                ? "재난정보"
                : "이용문의"
        );

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        if (!token) {
            alert(
                "글 등록은 로그인 후 이용할 수 있습니다."
            );

            navigate("/member/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");

        if (!title.trim()) {
            setErrorMessage(
                "제목을 입력해주세요."
            );
            return;
        }

        if (!content.trim()) {
            setErrorMessage(
                "내용을 입력해주세요."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_BASE_URL}/qna/write.do`,
                {
                    title: title.trim(),
                    content: content.trim(),
                    category
                },
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert(
                isAdmin
                    ? "글이 등록되었습니다."
                    : "문의가 등록되었습니다."
            );

            navigate(
                `/qna/${response.data.no}`
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                (isAdmin
                    ? "글을 등록하지 못했습니다."
                    : "문의를 등록하지 못했습니다.")
            );
        } finally {
            setLoading(false);
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
                        고객지원
                    </p>

                    <h1 style={styles.title}>
                        {isAdmin
                            ? "글 등록"
                            : "문의 등록"}
                    </h1>

                    <p style={styles.description}>
                        {isAdmin
                            ? "등록할 내용을 작성해주세요."
                            : "문의할 내용을 작성해주세요."}
                    </p>
                </header>

                <section style={styles.card}>
                    {errorMessage && (
                        <div className="alert alert-danger">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                htmlFor="category"
                                className="form-label fw-semibold"
                            >
                                카테고리
                            </label>

                            <select
                                id="category"
                                className="form-select"
                                value={category}
                                onChange={(event) =>
                                    setCategory(
                                        event.target.value
                                    )
                                }
                                style={styles.input}
                            >
                                {CATEGORY_OPTIONS.map(
                                    (item) => (
                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="title"
                                className="form-label fw-semibold"
                            >
                                제목
                            </label>

                            <input
                                type="text"
                                id="title"
                                className="form-control"
                                placeholder={
                                    isAdmin
                                        ? "제목을 입력해주세요."
                                        : "문의 제목을 입력해주세요."
                                }
                                maxLength={200}
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                style={styles.input}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="content"
                                className="form-label fw-semibold"
                            >
                                {isAdmin
                                    ? "내용"
                                    : "문의 내용"}
                            </label>

                            <textarea
                                id="content"
                                className="form-control"
                                rows={12}
                                placeholder={
                                    isAdmin
                                        ? "내용을 입력해주세요."
                                        : "문의 내용을 자세히 입력해주세요."
                                }
                                value={content}
                                onChange={(event) =>
                                    setContent(
                                        event.target.value
                                    )
                                }
                                style={styles.textarea}
                                required
                            />
                        </div>

                        <div style={styles.buttonArea}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={() =>
                                    navigate("/qna")
                                }
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary px-5"
                                disabled={loading}
                            >
                                {loading
                                    ? "등록 중..."
                                    : "등록"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}

const styles = {
    page: {
        minHeight: "calc(100vh - 70px)",
        padding: "58px 24px 90px",
        backgroundColor: "#f6f8fb"
    },

    container: {
        maxWidth: "900px"
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

    input: {
        minHeight: "50px"
    },

    textarea: {
        resize: "vertical",
        lineHeight: "1.7"
    },

    buttonArea: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        paddingTop: "10px"
    }
};

export default QnaWrite;