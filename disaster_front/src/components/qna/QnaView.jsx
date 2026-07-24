import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    AlertTriangle,
    Check,
    Trash2
} from "lucide-react";
import {
    useEffect,
    useState
} from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

const API_BASE_URL = "http://localhost";

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

    /*
     * confirm:
     * questionDelete = 문의 삭제 확인
     * answerDelete = 답변 삭제 확인
     */
    const [
        confirmType,
        setConfirmType
    ] = useState(null);

    /*
     * 완료 및 오류 안내 모달
     */
    const [
        noticeModal,
        setNoticeModal
    ] = useState({
        open: false,
        type: "success",
        title: "",
        description: "",
        action: null
    });

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
        loginInfo?.roles
        || loginInfo?.role
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
                String(role)
                    .toUpperCase();

            return (
                normalizedRole
                === "ROLE_ADMIN"
                || normalizedRole
                === "ADMIN"
            );
        })
        || Number(
            loginInfo?.gradeNo
        ) === 9
        || Number(
            loginInfo?.grade
        ) === 9
        || String(
            loginInfo?.gradeName
            || ""
        ).includes("관리자");

    const showNotice = ({
                            type = "success",
                            title,
                            description = "",
                            action = null
                        }) => {
        setNoticeModal({
            open: true,
            type,
            title,
            description,
            action
        });
    };

    const closeNotice = () => {
        const action =
            noticeModal.action;

        setNoticeModal({
            open: false,
            type: "success",
            title: "",
            description: "",
            action: null
        });

        if (typeof action
            === "function") {
            action();
        }
    };

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

    useEffect(() => {
        const modalOpen =
            Boolean(confirmType)
            || noticeModal.open;

        if (!modalOpen) {
            return undefined;
        }

        const originalOverflow =
            document.body.style
                .overflow;

        document.body.style
            .overflow = "hidden";

        const handleKeyDown =
            (event) => {
                if (event.key
                    !== "Escape") {
                    return;
                }

                if (confirmType) {
                    setConfirmType(
                        null
                    );
                    return;
                }

                if (
                    noticeModal.open
                ) {
                    closeNotice();
                }
            };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.body.style
                .overflow =
                originalOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        confirmType,
        noticeModal.open
    ]);

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

    /*
     * 문의 삭제 버튼 클릭
     */
    const openQuestionDeleteModal =
        () => {
            if (!token) {
                showNotice({
                    type: "warning",
                    title:
                        "로그인이 필요합니다.",
                    description:
                        "로그인 후 다시 이용해 주세요.",
                    action: () =>
                        navigate(
                            "/member/login"
                        )
                });

                return;
            }

            setConfirmType(
                "questionDelete"
            );
        };

    /*
     * 답변 삭제 버튼 클릭
     */
    const openAnswerDeleteModal =
        () => {
            if (
                !token
                || !answer
            ) {
                return;
            }

            setConfirmType(
                "answerDelete"
            );
        };

    /*
     * 문의 실제 삭제
     */
    const deleteQuestion =
        async () => {
            setConfirmType(null);

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

                showNotice({
                    type: "success",
                    title:
                        "문의가 삭제되었습니다.",
                    description:
                        "문의게시판 목록으로 이동합니다.",
                    action: () =>
                        navigate("/qna")
                });
            } catch (error) {
                console.error(error);

                showNotice({
                    type: "warning",
                    title:
                        "문의를 삭제하지 못했습니다.",
                    description:
                        error.response
                            ?.data
                            ?.message
                        || error.response
                            ?.data
                            ?.msg
                        || "잠시 후 다시 시도해 주세요."
                });
            }
        };

    /*
     * 답변 실제 삭제
     */
    const deleteAnswer =
        async () => {
            setConfirmType(null);

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

                setAnswer(null);

                await loadQna();

                showNotice({
                    type: "success",
                    title:
                        "답변이 삭제되었습니다.",
                    description:
                        "문의가 답변대기 상태로 변경되었습니다."
                });
            } catch (error) {
                console.error(error);

                showNotice({
                    type: "warning",
                    title:
                        "답변을 삭제하지 못했습니다.",
                    description:
                        error.response
                            ?.data
                            ?.message
                        || error.response
                            ?.data
                            ?.msg
                        || "잠시 후 다시 시도해 주세요."
                });
            }
        };

    /*
     * 관리자 답변 등록
     */
    const handleAnswerSubmit =
        async (event) => {
            event.preventDefault();

            if (!token) {
                showNotice({
                    type: "warning",
                    title:
                        "관리자 로그인이 필요합니다.",
                    description:
                        "로그인 후 다시 이용해 주세요.",
                    action: () =>
                        navigate(
                            "/member/login"
                        )
                });

                return;
            }

            if (
                !answerContent
                    .trim()
            ) {
                showNotice({
                    type: "warning",
                    title:
                        "답변 내용을 입력해 주세요.",
                    description:
                        "답변 내용은 필수 입력 항목입니다."
                });

                return;
            }

            try {
                setAnswerLoading(
                    true
                );

                await axios.post(
                    `${API_BASE_URL}/qna/answer.do`,
                    {
                        title:
                            `답변: ${question.title}`,

                        content:
                            answerContent
                                .trim(),

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

                setAnswerContent("");

                await loadQna();

                showNotice({
                    type: "success",
                    title:
                        "답변이 등록되었습니다.",
                    description:
                        "문의 작성자에게 답변 안내 이메일이 발송되었습니다."
                });
            } catch (error) {
                console.error(error);

                showNotice({
                    type: "warning",
                    title:
                        "답변을 등록하지 못했습니다.",
                    description:
                        error.response
                            ?.data
                            ?.message
                        || error.response
                            ?.data
                            ?.msg
                        || "잠시 후 다시 시도해 주세요."
                });
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

    const confirmTitle =
        confirmType
        === "answerDelete"
            ? "등록한 답변을 삭제하시겠습니까?"
            : "이 문의를 삭제하시겠습니까?";

    const confirmDescription =
        confirmType
        === "answerDelete"
            ? "삭제한 답변은 다시 복구할 수 없습니다."
            : answer
                ? "문의를 삭제하면 등록된 답변도 함께 삭제됩니다."
                : "삭제한 문의는 다시 복구할 수 없습니다.";

    return (
        <>
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
                                                    openQuestionDeleteModal
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
                                                    openAnswerDeleteModal
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
                                        maxLength={2000}
                                        placeholder="답변 내용을 입력해주세요."
                                        value={
                                            answerContent
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
                                            styles.characterCount
                                        }
                                    >
                                        {
                                            answerContent.length
                                        }
                                        /2000자
                                    </div>

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
                                </form>
                            </section>
                        )
                    }
                </div>
            </main>

            {
                confirmType && (
                    <div
                        style={
                            styles.modalBackdrop
                        }
                        role="presentation"
                    >
                        <div
                            style={
                                styles.modalBox
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="deleteConfirmTitle"
                        >
                            <div
                                style={
                                    styles.deleteIconWrap
                                }
                            >
                                <Trash2
                                    size={31}
                                    strokeWidth={2}
                                />
                            </div>

                            <h2
                                id="deleteConfirmTitle"
                                style={
                                    styles.modalTitle
                                }
                            >
                                {confirmTitle}
                            </h2>

                            <p
                                style={
                                    styles.modalDescription
                                }
                            >
                                {
                                    confirmDescription
                                }
                            </p>

                            <div
                                style={
                                    styles.modalButtonArea
                                }
                            >
                                <button
                                    type="button"
                                    style={
                                        styles.cancelButton
                                    }
                                    onClick={() =>
                                        setConfirmType(
                                            null
                                        )
                                    }
                                >
                                    취소
                                </button>

                                <button
                                    type="button"
                                    style={
                                        styles.deleteButton
                                    }
                                    onClick={
                                        confirmType
                                        === "answerDelete"
                                            ? deleteAnswer
                                            : deleteQuestion
                                    }
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                noticeModal.open && (
                    <div
                        style={
                            styles.modalBackdrop
                        }
                        role="presentation"
                    >
                        <div
                            style={
                                styles.modalBox
                            }
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="noticeModalTitle"
                        >
                            <div
                                style={
                                    noticeModal.type
                                    === "success"
                                        ? styles.successIconWrap
                                        : styles.warningIconWrap
                                }
                            >
                                {
                                    noticeModal.type
                                    === "success"
                                        ? (
                                            <Check
                                                size={34}
                                                strokeWidth={2.3}
                                            />
                                        )
                                        : (
                                            <AlertTriangle
                                                size={31}
                                                strokeWidth={2.1}
                                            />
                                        )
                                }
                            </div>

                            <h2
                                id="noticeModalTitle"
                                style={
                                    styles.modalTitle
                                }
                            >
                                {
                                    noticeModal.title
                                }
                            </h2>

                            {
                                noticeModal.description
                                && (
                                    <p
                                        style={
                                            styles.modalDescription
                                        }
                                    >
                                        {
                                            noticeModal.description
                                        }
                                    </p>
                                )
                            }

                            <button
                                type="button"
                                style={
                                    styles.confirmButton
                                }
                                onClick={
                                    closeNotice
                                }
                                autoFocus
                            >
                                확인
                            </button>
                        </div>
                    </div>
                )
            }
        </>
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

    characterCount: {
        marginTop: "7px",
        color: "#7a8493",
        fontSize: "13px",
        textAlign: "right"
    },

    answerButtonArea: {
        display: "flex",
        justifyContent:
            "flex-end",
        marginTop: "15px"
    },

    messagePage: {
        maxWidth: "800px",
        margin: "120px auto",
        padding: "20px",
        textAlign: "center"
    },

    modalBackdrop: {
        position: "fixed",
        zIndex: 10000,
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor:
            "rgba(15, 23, 42, 0.62)",
        backdropFilter: "blur(2px)"
    },

    modalBox: {
        width:
            "min(100%, 430px)",
        padding:
            "42px 36px 34px",
        border:
            "1px solid #e3e8ef",
        borderRadius: "18px",
        backgroundColor:
            "#ffffff",
        boxShadow:
            "0 25px 60px rgba(15, 23, 42, 0.24)",
        textAlign: "center"
    },

    successIconWrap: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "66px",
        height: "66px",
        margin:
            "0 auto 23px",
        border:
            "3px solid #2f6fed",
        borderRadius: "50%",
        backgroundColor:
            "#f7faff",
        color: "#2f6fed"
    },

    warningIconWrap: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "66px",
        height: "66px",
        margin:
            "0 auto 23px",
        border:
            "3px solid #ef9a32",
        borderRadius: "50%",
        backgroundColor:
            "#fff9f0",
        color: "#d97800"
    },

    deleteIconWrap: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "66px",
        height: "66px",
        margin:
            "0 auto 23px",
        border:
            "3px solid #e65454",
        borderRadius: "50%",
        backgroundColor:
            "#fff6f6",
        color: "#dc3545"
    },

    modalTitle: {
        margin: 0,
        color: "#151d2c",
        fontSize: "21px",
        fontWeight: "800",
        lineHeight: "1.5",
        letterSpacing:
            "-0.035em"
    },

    modalDescription: {
        margin:
            "10px 0 28px",
        color: "#77808e",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "1.65",
        whiteSpace: "pre-wrap"
    },

    modalButtonArea: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "29px"
    },

    cancelButton: {
        minWidth: "92px",
        height: "43px",
        padding: "0 22px",
        border:
            "1px solid #cfd6df",
        borderRadius: "10px",
        backgroundColor:
            "#ffffff",
        color: "#4d5868",
        fontSize: "14px",
        fontWeight: "750",
        cursor: "pointer"
    },

    deleteButton: {
        minWidth: "92px",
        height: "43px",
        padding: "0 22px",
        border: 0,
        borderRadius: "10px",
        backgroundColor:
            "#dc3545",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "750",
        cursor: "pointer"
    },

    confirmButton: {
        minWidth: "88px",
        height: "43px",
        marginTop: "28px",
        padding: "0 24px",
        border: 0,
        borderRadius: "10px",
        backgroundColor:
            "#275ed7",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "750",
        cursor: "pointer"
    }
};

export default QnaView;