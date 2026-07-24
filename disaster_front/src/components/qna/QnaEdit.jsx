import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
    AlertTriangle,
    Check
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

    const token =
        localStorage.getItem("token");

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

    const [pageError, setPageError] =
        useState("");

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

    const showNotice = ({
                            type = "success",
                            title: modalTitle,
                            description = "",
                            action = null
                        }) => {
        setNoticeModal({
            open: true,
            type,
            title: modalTitle,
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

        if (typeof action === "function") {
            action();
        }
    };

    const getLoginId = () => {
        try {
            const savedLogin =
                localStorage.getItem("login");

            const loginInfo =
                savedLogin
                    ? JSON.parse(savedLogin)
                    : token
                        ? jwtDecode(token)
                        : null;

            return (
                loginInfo?.sub
                || loginInfo?.id
                || null
            );
        } catch {
            return null;
        }
    };

    const normalizeCategory = (
        value
    ) => {
        if (value === "서비스문의") {
            return "이용문의";
        }

        if (value === "기타문의") {
            return "기타";
        }

        return CATEGORY_OPTIONS.includes(
            value
        )
            ? value
            : "기타";
    };

    const loadQna = async () => {
        if (!token) {
            setLoading(false);

            showNotice({
                type: "warning",
                title: "로그인이 필요합니다.",
                description:
                    "로그인 후 다시 이용해 주세요.",
                action: () =>
                    navigate("/member/login")
            });

            return;
        }

        try {
            setLoading(true);
            setPageError("");

            const response =
                await axios.get(
                    `${API_BASE_URL}/qna/view.do`,
                    {
                        params: { no }
                    }
                );

            const thread =
                Array.isArray(
                    response.data
                )
                    ? response.data
                    : [];

            const target =
                thread.find(
                    (item) =>
                        Number(item.no)
                        === Number(no)
                );

            if (!target) {
                setPageError(
                    "수정할 글을 찾을 수 없습니다."
                );

                showNotice({
                    type: "warning",
                    title:
                        "수정할 글을 찾을 수 없습니다.",
                    description:
                        "문의게시판 목록으로 이동합니다.",
                    action: () =>
                        navigate("/qna")
                });

                return;
            }

            const originalQuestionNo =
                target.parentNo
                || target.refNo
                || target.no;

            if (
                target.writerId
                !== getLoginId()
            ) {
                showNotice({
                    type: "warning",
                    title:
                        "본인이 작성한 글만 수정할 수 있습니다.",
                    description:
                        "문의 상세 화면으로 이동합니다.",
                    action: () =>
                        navigate(
                            `/qna/${originalQuestionNo}`
                        )
                });

                return;
            }

            const targetIsAnswer =
                target.parentNo !== null
                && target.parentNo
                !== undefined;

            if (!targetIsAnswer) {
                const registeredAnswer =
                    thread.find(
                        (item) =>
                            item.parentNo
                            !== null
                            && item.parentNo
                            !== undefined
                    );

                if (registeredAnswer) {
                    showNotice({
                        type: "warning",
                        title:
                            "답변이 등록된 문의는 수정할 수 없습니다.",
                        description:
                            "문의 상세 화면에서 등록된 답변을 확인해 주세요.",
                        action: () =>
                            navigate(
                                `/qna/${target.no}`
                            )
                    });

                    return;
                }
            }

            const resolvedQuestionNo =
                targetIsAnswer
                    ? target.parentNo
                    || target.refNo
                    : target.no;

            setIsAnswer(
                targetIsAnswer
            );

            setQuestionNo(
                resolvedQuestionNo
            );

            setTitle(
                target.title || ""
            );

            setContent(
                target.content || ""
            );

            setCategory(
                normalizeCategory(
                    target.category
                )
            );
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.message
                || error.response?.data?.msg
                || "글 정보를 불러오지 못했습니다.";

            setPageError(message);

            showNotice({
                type: "warning",
                title:
                    "글 정보를 불러오지 못했습니다.",
                description: message,
                action: () =>
                    navigate("/qna")
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadQna();
    }, [no, token]);

    useEffect(() => {
        if (!noticeModal.open) {
            return undefined;
        }

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                closeNotice();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.body.style.overflow =
                originalOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [noticeModal.open]);

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        const trimmedTitle =
            title.trim();

        const trimmedContent =
            content.trim();

        if (!trimmedTitle) {
            showNotice({
                type: "warning",
                title: "제목을 입력해 주세요.",
                description:
                    "제목은 필수 입력 항목입니다."
            });
            return;
        }

        if (
            trimmedTitle.length
            > TITLE_MAX_LENGTH
        ) {
            showNotice({
                type: "warning",
                title:
                    `제목은 ${TITLE_MAX_LENGTH}자 이하로 입력해 주세요.`,
                description:
                    "제목의 글자 수를 확인해 주세요."
            });
            return;
        }

        if (!trimmedContent) {
            showNotice({
                type: "warning",
                title: "내용을 입력해 주세요.",
                description:
                    isAnswer
                        ? "답변 내용은 필수 입력 항목입니다."
                        : "문의 내용은 필수 입력 항목입니다."
            });
            return;
        }

        if (
            trimmedContent.length
            > CONTENT_MAX_LENGTH
        ) {
            showNotice({
                type: "warning",
                title:
                    `내용은 ${CONTENT_MAX_LENGTH}자 이하로 입력해 주세요.`,
                description:
                    "내용의 글자 수를 확인해 주세요."
            });
            return;
        }

        try {
            setSaving(true);

            await axios.put(
                `${API_BASE_URL}/qna/update.do`,
                {
                    title:
                    trimmedTitle,
                    content:
                    trimmedContent,
                    category
                },
                {
                    params: { no },
                    headers: {
                        "X-AUTH-TOKEN":
                        token,
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            showNotice({
                type: "success",
                title:
                    isAnswer
                        ? "답변이 수정되었습니다."
                        : "문의가 수정되었습니다.",
                description:
                    "상세 화면으로 이동합니다.",
                action: () =>
                    navigate(
                        `/qna/${questionNo}`
                    )
            });
        } catch (error) {
            console.error(error);

            showNotice({
                type: "warning",
                title:
                    isAnswer
                        ? "답변을 수정하지 못했습니다."
                        : "문의를 수정하지 못했습니다.",
                description:
                    error.response?.data?.message
                    || error.response?.data?.msg
                    || "잠시 후 다시 시도해 주세요."
            });
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
        <>
            <main style={styles.page}>
                <div
                    className="container"
                    style={styles.container}
                >
                    <header style={styles.header}>
                        <p
                            style={
                                styles.categoryLabel
                            }
                        >
                            고객지원
                        </p>

                        <h1 style={styles.title}>
                            {isAnswer
                                ? "답변 수정"
                                : "문의 수정"}
                        </h1>
                    </header>

                    <section style={styles.card}>
                        {pageError && (
                            <div
                                className="alert alert-warning"
                            >
                                {pageError}
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
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
                                        value={
                                            category
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setCategory(
                                                event.target.value
                                            )
                                        }
                                        style={
                                            styles.input
                                        }
                                    >
                                        {CATEGORY_OPTIONS.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {
                                                        item
                                                    }
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
                                    maxLength={
                                        TITLE_MAX_LENGTH
                                    }
                                    value={title}
                                    onChange={(
                                        event
                                    ) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    style={
                                        styles.input
                                    }
                                    required
                                />

                                <div
                                    style={
                                        styles.lengthText
                                    }
                                >
                                    {title.length}/
                                    {TITLE_MAX_LENGTH}
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
                                    maxLength={
                                        CONTENT_MAX_LENGTH
                                    }
                                    value={content}
                                    onChange={(
                                        event
                                    ) =>
                                        setContent(
                                            event.target.value
                                        )
                                    }
                                    style={
                                        styles.textarea
                                    }
                                    required
                                />

                                <div
                                    style={
                                        styles.lengthText
                                    }
                                >
                                    {content.length}/
                                    {CONTENT_MAX_LENGTH}
                                </div>
                            </div>

                            <div
                                style={
                                    styles.buttonArea
                                }
                            >
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4"
                                    onClick={() =>
                                        navigate(
                                            questionNo
                                                ? `/qna/${questionNo}`
                                                : "/qna"
                                        )
                                    }
                                    disabled={saving}
                                >
                                    취소
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary px-5"
                                    disabled={
                                        saving
                                        || Boolean(
                                            pageError
                                        )
                                    }
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

            {noticeModal.open && (
                <div
                    style={
                        styles.modalBackdrop
                    }
                    role="presentation"
                >
                    <div
                        style={styles.modalBox}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="qnaEditNoticeTitle"
                    >
                        <div
                            style={
                                noticeModal.type
                                === "success"
                                    ? styles.successIconWrap
                                    : styles.warningIconWrap
                            }
                        >
                            {noticeModal.type
                            === "success" ? (
                                <Check
                                    size={34}
                                    strokeWidth={2.3}
                                />
                            ) : (
                                <AlertTriangle
                                    size={31}
                                    strokeWidth={2.1}
                                />
                            )}
                        </div>

                        <h2
                            id="qnaEditNoticeTitle"
                            style={
                                styles.modalTitle
                            }
                        >
                            {noticeModal.title}
                        </h2>

                        {noticeModal.description && (
                            <p
                                style={
                                    styles.modalDescription
                                }
                            >
                                {
                                    noticeModal.description
                                }
                            </p>
                        )}

                        <button
                            type="button"
                            style={
                                styles.confirmButton
                            }
                            onClick={closeNotice}
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
        backgroundColor:
            "#ffffff",
        border:
            "1px solid #e5e9ef",
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
        padding:
            "150px 20px",
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
        margin: "0 auto 23px",
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
        margin: "0 auto 23px",
        border:
            "3px solid #ef9a32",
        borderRadius: "50%",
        backgroundColor:
            "#fff9f0",
        color: "#d97800"
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
        whiteSpace: "nowrap"
    },

    confirmButton: {
        minWidth: "88px",
        height: "43px",
        marginTop: "8px",
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

export default QnaEdit;
