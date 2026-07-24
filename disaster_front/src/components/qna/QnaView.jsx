import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

const API_BASE_URL = "http://localhost";
const TITLE_MAX_LENGTH = 300;
const ANSWER_CONTENT_MAX_LENGTH = 2000;

function QnaView() {
    const { no } = useParams();
    const navigate = useNavigate();

    const token =
        localStorage.getItem("token");

    const savedLogin =
        localStorage.getItem("login");

    const [question, setQuestion] =
        useState(null);

    const [answer, setAnswer] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    const [
        answerContent,
        setAnswerContent
    ] = useState("");

    const [
        answerLoading,
        setAnswerLoading
    ] = useState(false);

    let loginInfo = null;

    try {
        loginInfo = savedLogin
            ? JSON.parse(savedLogin)
            : token
                ? jwtDecode(token)
                : null;
    } catch (error) {
        console.error(
            "로그인 정보 확인 실패:",
            error
        );

        loginInfo = null;
    }

    const loginId =
        loginInfo?.sub
        || loginInfo?.id
        || null;

    const rawRoles =
        loginInfo?.roles;

    const roles =
        Array.isArray(rawRoles)
            ? rawRoles
            : rawRoles
                ? [rawRoles]
                : [];

    const isAdmin =
        roles.some((role) => {
            const normalizedRole =
                String(role)
                    .toUpperCase();

            return (
                normalizedRole
                === "ROLE_ADMIN"
                || normalizedRole
                === "ADMIN"
            );
        });

    const loadQna = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response =
                await axios.get(
                    `${API_BASE_URL}/qna/view.do`,
                    {
                        params: {
                            no
                        }
                    }
                );

            const thread =
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : [];

            const questionData =
                thread.find(
                    (item) =>
                        item.parentNo
                        === null
                        || item.parentNo
                        === undefined
                )
                || thread[0];

            const answerData =
                thread.find(
                    (item) =>
                        item.parentNo
                        !== null
                        && item.parentNo
                        !== undefined
                )
                || null;

            setQuestion(
                questionData
                || null
            );

            setAnswer(
                answerData
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.response
                    ?.data
                    ?.message
                || error.response
                    ?.data
                    ?.msg
                || "문의 내용을 불러오지 못했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQna();
    }, [no]);

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        if (Array.isArray(value)) {
            const [
                year,
                month,
                day,
                hour = 0,
                minute = 0
            ] = value;

            return `${year}-${String(
                month
            ).padStart(
                2,
                "0"
            )}-${String(
                day
            ).padStart(
                2,
                "0"
            )} ${String(
                hour
            ).padStart(
                2,
                "0"
            )}:${String(
                minute
            ).padStart(
                2,
                "0"
            )}`;
        }

        return String(value)
            .replace("T", " ")
            .slice(0, 16);
    };

    const displayCategory = (
        value
    ) => {
        if (
            value
            === "서비스문의"
        ) {
            return "이용문의";
        }

        if (
            value
            === "기타문의"
        ) {
            return "기타";
        }

        return value
            || "기타";
    };

    const handleQuestionDelete =
        async () => {
            if (!token) {
                alert(
                    "로그인이 필요합니다."
                );

                navigate(
                    "/member/login"
                );
                return;
            }

            const confirmed =
                window.confirm(
                    "이 문의를 삭제하시겠습니까?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await axios.delete(
                    `${API_BASE_URL}/qna/delete.do`,
                    {
                        params: {
                            no:
                            question.no
                        },

                        headers: {
                            "X-AUTH-TOKEN":
                            token
                        }
                    }
                );

                alert(
                    "문의가 삭제되었습니다."
                );

                navigate("/qna");
            } catch (error) {
                console.error(error);

                alert(
                    error.response
                        ?.data
                        ?.message
                    || error.response
                        ?.data
                        ?.msg
                    || "문의를 삭제하지 못했습니다."
                );
            }
        };

    const handleAnswerDelete =
        async () => {
            if (
                !token
                || !answer
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    "등록한 답변을 삭제하시겠습니까?"
                );

            if (!confirmed) {
                return;
            }

            try {
                await axios.delete(
                    `${API_BASE_URL}/qna/delete.do`,
                    {
                        params: {
                            no:
                            answer.no
                        },

                        headers: {
                            "X-AUTH-TOKEN":
                            token
                        }
                    }
                );

                alert(
                    "답변이 삭제되었습니다."
                );

                setAnswer(null);

                await loadQna();
            } catch (error) {
                console.error(error);

                alert(
                    error.response
                        ?.data
                        ?.message
                    || error.response
                        ?.data
                        ?.msg
                    || "답변을 삭제하지 못했습니다."
                );
            }
        };

    const handleAnswerSubmit =
        async (event) => {
            event.preventDefault();

            if (!token) {
                alert(
                    "관리자 로그인이 필요합니다."
                );

                navigate(
                    "/member/login"
                );
                return;
            }

            const trimmedAnswerContent =
                answerContent.trim();

            if (!trimmedAnswerContent) {
                alert(
                    "답변 내용을 입력해주세요."
                );
                return;
            }

            if (
                trimmedAnswerContent.length
                > ANSWER_CONTENT_MAX_LENGTH
            ) {
                alert(
                    `답변 내용은 ${ANSWER_CONTENT_MAX_LENGTH}자 이내로 입력해주세요.`
                );
                return;
            }

            const answerTitle =
                `답변: ${question.title}`
                    .slice(
                        0,
                        TITLE_MAX_LENGTH
                    );

            try {
                setAnswerLoading(
                    true
                );

                await axios.post(
                    `${API_BASE_URL}/qna/answer.do`,
                    {
                        title:
                        answerTitle,

                        content:
                        trimmedAnswerContent,

                        category:
                        question.category
                    },
                    {
                        params: {
                            no:
                            question.no
                        },

                        headers: {
                            "X-AUTH-TOKEN":
                            token
                        }
                    }
                );

                alert(
                    "답변이 등록되었습니다."
                );

                setAnswerContent("");

                await loadQna();
            } catch (error) {
                console.error(error);

                alert(
                    error.response
                        ?.data
                        ?.message
                    || error.response
                        ?.data
                        ?.msg
                    || "답변을 등록하지 못했습니다."
                );
            } finally {
                setAnswerLoading(
                    false
                );
            }
        };

    if (loading) {
        return (
            <div
                style={
                    styles.messagePage
                }
            >
                문의 내용을 불러오는 중입니다.
            </div>
        );
    }

    if (
        errorMessage
        || !question
    ) {
        return (
            <div
                style={
                    styles.messagePage
                }
            >
                <div className="alert alert-warning">
                    {
                        errorMessage
                        || "문의가 존재하지 않습니다."
                    }
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate(
                            "/qna"
                        )
                    }
                >
                    목록으로
                </button>
            </div>
        );
    }

    const isQuestionOwner =
        Boolean(loginId)
        && loginId
        === question.writerId;

    const canEditQuestion =
        isQuestionOwner
        && !answer;

    const canDeleteQuestion =
        isQuestionOwner;

    const canManageAnswer =
        Boolean(answer)
        && isAdmin
        && loginId
        === answer.writerId;

    return (
        <main style={styles.page}>
            <div
                className="container"
                style={styles.container}
            >
                <header
                    style={styles.header}
                >
                    <div>
                        <p
                            style={
                                styles.categoryLabel
                            }
                        >
                            고객지원
                        </p>

                        <h1
                            style={
                                styles.pageTitle
                            }
                        >
                            문의 상세
                        </h1>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                            navigate(
                                "/qna"
                            )
                        }
                    >
                        목록
                    </button>
                </header>

                <section
                    style={
                        styles.questionCard
                    }
                >
                    <div
                        style={
                            styles.badgeArea
                        }
                    >
                        <span
                            style={
                                styles.categoryBadge
                            }
                        >
                            {
                                displayCategory(
                                    question.category
                                )
                            }
                        </span>

                        <span
                            style={
                                answer
                                    ? styles.completeBadge
                                    : styles.waitingBadge
                            }
                        >
                            {
                                answer
                                    ? "답변완료"
                                    : "답변대기"
                            }
                        </span>
                    </div>

                    <h2
                        style={
                            styles.questionTitle
                        }
                    >
                        {question.title}
                    </h2>

                    <div
                        style={
                            styles.metaArea
                        }
                    >
                        <span>
                            작성자:{" "}
                            {
                                question.writerId
                                || question.writerName
                                || "-"
                            }
                        </span>

                        <span>
                            등록일:{" "}
                            {
                                formatDate(
                                    question.writeDate
                                )
                            }
                        </span>

                        <span>
                            조회수:{" "}
                            {
                                question.hit
                                ?? 0
                            }
                        </span>
                    </div>

                    <div
                        style={
                            styles.content
                        }
                    >
                        {
                            question.content
                        }
                    </div>

                    {
                        (
                            canEditQuestion
                            || canDeleteQuestion
                        ) && (
                            <div
                                style={
                                    styles.buttonArea
                                }
                            >
                                {
                                    canEditQuestion
                                    && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() =>
                                                navigate(
                                                    `/qna/${question.no}/edit`
                                                )
                                            }
                                        >
                                            수정
                                        </button>
                                    )
                                }

                                {
                                    canDeleteQuestion
                                    && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={
                                                handleQuestionDelete
                                            }
                                        >
                                            삭제
                                        </button>
                                    )
                                }
                            </div>
                        )
                    }
                </section>

                {
                    answer && (
                        <section
                            style={
                                styles.answerCard
                            }
                        >
                            <div
                                style={
                                    styles.answerLabel
                                }
                            >
                                관리자 답변
                            </div>

                            <h3
                                style={
                                    styles.answerTitle
                                }
                            >
                                {
                                    answer.title
                                }
                            </h3>

                            <div
                                style={
                                    styles.metaArea
                                }
                            >
                                <span>
                                    작성자:{" "}
                                    {
                                        answer.writerId
                                        || answer.writerName
                                        || "-"
                                    }
                                </span>

                                <span>
                                    등록일:{" "}
                                    {
                                        formatDate(
                                            answer.writeDate
                                        )
                                    }
                                </span>
                            </div>

                            <div
                                style={
                                    styles.content
                                }
                            >
                                {
                                    answer.content
                                }
                            </div>

                            {
                                canManageAnswer
                                && (
                                    <div
                                        style={
                                            styles.buttonArea
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() =>
                                                navigate(
                                                    `/qna/${answer.no}/edit`
                                                )
                                            }
                                        >
                                            답변 수정
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={
                                                handleAnswerDelete
                                            }
                                        >
                                            답변 삭제
                                        </button>
                                    </div>
                                )
                            }
                        </section>
                    )
                }

                {
                    isAdmin
                    && !answer
                    && !isQuestionOwner
                    && (
                        <section
                            style={
                                styles.answerFormCard
                            }
                        >
                            <h3
                                style={
                                    styles.answerFormTitle
                                }
                            >
                                답변 등록
                            </h3>

                            <form
                                onSubmit={
                                    handleAnswerSubmit
                                }
                            >
                                <textarea
                                    className="form-control"
                                    rows={8}
                                    placeholder="답변 내용을 입력해주세요."
                                    value={
                                        answerContent
                                    }
                                    maxLength={
                                        ANSWER_CONTENT_MAX_LENGTH
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setAnswerContent(
                                            event.target
                                                .value
                                        )
                                    }
                                    style={
                                        styles.textarea
                                    }
                                />

                                <div
                                    style={
                                        styles.answerFormFooter
                                    }
                                >
                                    <span
                                        style={
                                            styles.characterCount
                                        }
                                    >
                                        {
                                            answerContent.length
                                        } / {
                                        ANSWER_CONTENT_MAX_LENGTH
                                    }자
                                    </span>

                                    <div
                                        style={
                                            styles.answerButtonArea
                                        }
                                    >
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            disabled={
                                                answerLoading
                                            }
                                        >
                                            {
                                                answerLoading
                                                    ? "등록 중..."
                                                    : "답변 등록"
                                            }
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </section>
                    )
                }
            </div>
        </main>
    );
}

const styles = {
    page: {
        minHeight:
            "calc(100vh - 70px)",
        padding:
            "58px 24px 90px",
        backgroundColor:
            "#f6f8fb"
    },

    container: {
        maxWidth: "1000px"
    },

    header: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "25px"
    },

    categoryLabel: {
        marginBottom: "7px",
        color: "#0d6efd",
        fontSize: "14px",
        fontWeight: "700"
    },

    pageTitle: {
        margin: 0,
        color: "#20242c",
        fontSize: "36px",
        fontWeight: "800"
    },

    questionCard: {
        padding: "38px",
        backgroundColor:
            "#ffffff",
        border:
            "1px solid #e5e9ef",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30, 45, 70, 0.05)"
    },

    badgeArea: {
        display: "flex",
        gap: "8px",
        marginBottom: "18px"
    },

    questionTitle: {
        marginBottom: "18px",
        color: "#20242c",
        fontSize: "27px",
        fontWeight: "800"
    },

    metaArea: {
        display: "flex",
        flexWrap: "wrap",
        gap: "22px",
        paddingBottom: "20px",
        color: "#707988",
        borderBottom:
            "1px solid #edf0f3",
        fontSize: "14px"
    },

    content: {
        minHeight: "150px",
        padding: "30px 4px",
        color: "#303640",
        fontSize: "16px",
        lineHeight: "1.8",
        whiteSpace: "pre-wrap"
    },

    categoryBadge: {
        display: "inline-block",
        padding: "5px 10px",
        color: "#315b93",
        backgroundColor:
            "#eef5ff",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700"
    },

    completeBadge: {
        display: "inline-block",
        padding: "5px 10px",
        color: "#087f5b",
        backgroundColor:
            "#e7f8f1",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700"
    },

    waitingBadge: {
        display: "inline-block",
        padding: "5px 10px",
        color: "#a15c00",
        backgroundColor:
            "#fff4df",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700"
    },

    buttonArea: {
        display: "flex",
        justifyContent:
            "flex-end",
        gap: "8px",
        paddingTop: "20px",
        borderTop:
            "1px solid #edf0f3"
    },

    answerCard: {
        marginTop: "24px",
        padding: "35px 38px",
        backgroundColor:
            "#eef5ff",
        border:
            "1px solid #d8e7ff",
        borderRadius: "14px"
    },

    answerLabel: {
        marginBottom: "12px",
        color: "#0d6efd",
        fontSize: "14px",
        fontWeight: "800"
    },

    answerTitle: {
        marginBottom: "16px",
        color: "#20242c",
        fontSize: "22px",
        fontWeight: "800"
    },

    answerFormCard: {
        marginTop: "24px",
        padding: "35px 38px",
        backgroundColor:
            "#ffffff",
        border:
            "1px solid #e5e9ef",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30, 45, 70, 0.04)"
    },

    answerFormTitle: {
        marginBottom: "20px",
        color: "#20242c",
        fontSize: "21px",
        fontWeight: "800"
    },

    textarea: {
        resize: "vertical",
        lineHeight: "1.7"
    },

    answerFormFooter: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "center",
        gap: "16px",
        marginTop: "15px"
    },

    characterCount: {
        color: "#6c757d",
        fontSize: "14px"
    },

    answerButtonArea: {
        display: "flex",
        justifyContent:
            "flex-end"
    },

    messagePage: {
        maxWidth: "800px",
        margin: "120px auto",
        padding: "20px",
        textAlign: "center"
    }
};

export default QnaView;