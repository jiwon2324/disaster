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
import { useNavigate } from "react-router-dom";

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

function QnaWrite() {
    const navigate = useNavigate();

    const token =
        localStorage.getItem("token");

    const savedLogin =
        localStorage.getItem("login");

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
                String(role).toUpperCase();

            return (
                normalizedRole === "ROLE_ADMIN"
                || normalizedRole === "ADMIN"
            );
        })
        || Number(loginInfo?.gradeNo) === 9
        || Number(loginInfo?.grade) === 9
        || String(
            loginInfo?.gradeName || ""
        ).includes("관리자");

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

    useEffect(() => {
        if (!token) {
            showNotice({
                type: "warning",
                title: "로그인이 필요합니다.",
                description:
                    "문의 등록은 로그인 후 이용할 수 있습니다.",
                action: () =>
                    navigate("/member/login")
            });
        }
    }, [token, navigate]);

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

    const handleSubmit = async (event) => {
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
                    "문의 내용은 필수 입력 항목입니다."
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
                    "문의 내용의 글자 수를 확인해 주세요."
            });
            return;
        }

        try {
            setLoading(true);

            const response =
                await axios.post(
                    `${API_BASE_URL}/qna/write.do`,
                    {
                        title:
                        trimmedTitle,
                        content:
                        trimmedContent,
                        category
                    },
                    {
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
                    isAdmin
                        ? "글이 등록되었습니다."
                        : "문의가 등록되었습니다.",
                description:
                    "등록한 내용을 확인할 수 있도록 상세 화면으로 이동합니다.",
                action: () =>
                    navigate(
                        `/qna/${response.data.no}`
                    )
            });
        } catch (error) {
            console.error(error);

            showNotice({
                type: "warning",
                title:
                    isAdmin
                        ? "글을 등록하지 못했습니다."
                        : "문의를 등록하지 못했습니다.",
                description:
                    error.response?.data?.message
                    || error.response?.data?.msg
                    || "잠시 후 다시 시도해 주세요."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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
                                ? "등록할 내용을 작성해 주세요."
                                : "문의할 내용을 작성해 주세요."}
                        </p>
                    </header>

                    <section style={styles.card}>
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
                                            ? "제목을 입력해 주세요."
                                            : "문의 제목을 입력해 주세요."
                                    }
                                    maxLength={
                                        TITLE_MAX_LENGTH
                                    }
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(
                                            event.target.value
                                        )
                                    }
                                    style={styles.input}
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
                                            ? "내용을 입력해 주세요."
                                            : "문의 내용을 자세히 입력해 주세요."
                                    }
                                    maxLength={
                                        CONTENT_MAX_LENGTH
                                    }
                                    value={content}
                                    onChange={(event) =>
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
                                        navigate("/qna")
                                    }
                                    disabled={loading}
                                >
                                    취소
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary px-5"
                                    disabled={
                                        loading
                                        || !token
                                    }
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

            {noticeModal.open && (
                <div
                    style={styles.modalBackdrop}
                    role="presentation"
                >
                    <div
                        style={styles.modalBox}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="qnaWriteNoticeTitle"
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
                            id="qnaWriteNoticeTitle"
                            style={styles.modalTitle}
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
                            style={styles.confirmButton}
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
        border:
            "1px solid #e5e9ef",
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

    lengthText: {
        marginTop: "7px",
        color: "#7b8492",
        fontSize: "13px",
        textAlign: "right"
    },

    buttonArea: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        paddingTop: "10px"
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
        letterSpacing: "-0.035em"
    },

    modalDescription: {
        margin: "10px 0 28px",
        color: "#77808e",
        fontSize: "14px",
        fontWeight: "500",
        lineHeight: "1.65",
        whiteSpace: "pre-wrap"
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

export default QnaWrite;