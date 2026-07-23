import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

const API_BASE_URL = "http://localhost";

const CATEGORY_OPTIONS = [
    "이용문의",
    "계정문의",
    "재난정보",
    "오류신고",
    "기타"
];

const TITLE_MAX_LENGTH = 300;
const CONTENT_MAX_LENGTH = 2000;

function QnaEdit() {
    const { no } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const [title, setTitle] =
        useState("");

    const [content, setContent] =
        useState("");

    const [category, setCategory] =
        useState("이용문의");

    const [isAnswer, setIsAnswer] =
        useState(false);

    const [questionNo, setQuestionNo] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/member/login");
            return;
        }

        loadQna();
    }, [no]);

    const getLoginId = () => {
        try {
            const savedLogin =
                localStorage.getItem("login");

            const loginInfo = savedLogin
                ? JSON.parse(savedLogin)
                : jwtDecode(token);

            return (
                loginInfo?.sub ||
                loginInfo?.id ||
                null
            );
        } catch {
            return null;
        }
    };

    const normalizeCategory = (value) => {
        if (value === "서비스문의") {
            return "이용문의";
        }

        if (value === "기타문의") {
            return "기타";
        }

        return CATEGORY_OPTIONS.includes(value)
            ? value
            : "기타";
    };

    const loadQna = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                `${API_BASE_URL}/qna/view.do`,
                {
                    params: { no }
                }
            );

            const thread =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            const target = thread.find(
                (item) =>
                    Number(item.no) === Number(no)
            );

            if (!target) {
                setErrorMessage(
                    "수정할 글을 찾을 수 없습니다."
                );
                return;
            }

            if (target.writerId !== getLoginId()) {
                alert(
                    "본인이 작성한 글만 수정할 수 있습니다."
                );

                const originalQuestionNo =
                    target.parentNo ||
                    target.refNo ||
                    target.no;

                navigate(
                    `/qna/${originalQuestionNo}`
                );
                return;
            }

            const targetIsAnswer =
                target.parentNo !== null &&
                target.parentNo !== undefined;

            if (!targetIsAnswer) {
                const registeredAnswer =
                    thread.find(
                        (item) =>
                            item.parentNo !== null &&
                            item.parentNo !== undefined
                    );

                if (registeredAnswer) {
                    alert(
                        "답변이 등록된 문의는 수정할 수 없습니다."
                    );

                    navigate(`/qna/${target.no}`);
                    return;
                }
            }

            const originalQuestionNo =
                targetIsAnswer
                    ? target.parentNo ||
                    target.refNo
                    : target.no;

            setIsAnswer(targetIsAnswer);

            setQuestionNo(
                originalQuestionNo
            );

            setTitle(target.title || "");

            setContent(target.content || "");

            setCategory(
                normalizeCategory(
                    target.category
                )
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                "글 정보를 불러오지 못했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");

        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
            setErrorMessage(
                "제목을 입력해주세요."
            );
            return;
        }

        if (trimmedTitle.length > TITLE_MAX_LENGTH) {
            setErrorMessage(
                `제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해주세요.`
            );
            return;
        }

        if (!trimmedContent) {
            setErrorMessage(
                "내용을 입력해주세요."
            );
            return;
        }

        if (trimmedContent.length > CONTENT_MAX_LENGTH) {
            setErrorMessage(
                `내용은 ${CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`
            );
            return;
        }

        try {
            setSaving(true);

            await axios.put(
                `${API_BASE_URL}/qna/update.do`,
                {
                    title: trimmedTitle,
                    content: trimmedContent,
                    category
                },
                {
                    params: { no },
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            alert(
                isAnswer
                    ? "답변이 수정되었습니다."
                    : "문의가 수정되었습니다."
            );

            navigate(
                `/qna/${questionNo}`
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                "글을 수정하지 못했습니다."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                글 정보를 불러오는 중입니다.
            </div>
        );
    }

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
                        {isAnswer
                            ? "답변 수정"
                            : "문의 수정"}
                    </h1>
                </header>

                <section style={styles.card}>
                    {errorMessage && (
                        <div className="alert alert-danger">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isAnswer && (
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
                        )}

                        <div className="mb-4">
                            <label
                                htmlFor="title"
                                className="form-label fw-semibold"
                            >
                                {isAnswer
                                    ? "답변 제목"
                                    : "제목"}
                            </label>

                            <input
                                type="text"
                                id="title"
                                className="form-control"
                                maxLength={TITLE_MAX_LENGTH}
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value
                                    )
                                }
                                style={styles.input}
                                required
                            />

                            <div style={styles.lengthText}>
                                {title.length}/{TITLE_MAX_LENGTH}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="content"
                                className="form-label fw-semibold"
                            >
                                {isAnswer
                                    ? "답변 내용"
                                    : "문의 내용"}
                            </label>

                            <textarea
                                id="content"
                                className="form-control"
                                rows={12}
                                maxLength={CONTENT_MAX_LENGTH}
                                value={content}
                                onChange={(event) =>
                                    setContent(
                                        event.target.value
                                    )
                                }
                                style={styles.textarea}
                                required
                            />

                            <div style={styles.lengthText}>
                                {content.length}/{CONTENT_MAX_LENGTH}
                            </div>
                        </div>

                        <div style={styles.buttonArea}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={() =>
                                    navigate(
                                        `/qna/${questionNo}`
                                    )
                                }
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary px-5"
                                disabled={saving}
                            >
                                {saving
                                    ? "수정 중..."
                                    : "수정 완료"}
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
        margin: 0,
        fontSize: "36px",
        fontWeight: "800"
    },

    card: {
        padding: "38px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e9ef",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30, 45, 70, 0.05)"
    },

    input: {
        minHeight: "50px"
    },

    textarea: {
        resize: "vertical",
        lineHeight: "1.7"
    },

    lengthText: {
        marginTop: "7px",
        color: "#7b8492",
        fontSize: "13px",
        textAlign: "right"
    },

    buttonArea: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
    },

    loading: {
        padding: "150px 20px",
        textAlign: "center"
    }
};

export default QnaEdit;