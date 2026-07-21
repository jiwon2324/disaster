import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";
const PAGE_SIZE = 10;

const CATEGORY_OPTIONS = [
    "이용문의",
    "계정문의",
    "재난정보",
    "오류신고",
    "기타"
];

function QnaList() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const savedLogin = localStorage.getItem("login");

    const [qnaList, setQnaList] = useState([]);

    const [searchType, setSearchType] =
        useState("all");

    const [keyword, setKeyword] =
        useState("");

    const [appliedSearchType, setAppliedSearchType] =
        useState("all");

    const [appliedKeyword, setAppliedKeyword] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [page, setPage] =
        useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");

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

    useEffect(() => {
        loadQnaList();
    }, [
        page,
        category,
        appliedSearchType,
        appliedKeyword
    ]);

    const loadQnaList = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                `${API_BASE_URL}/qna/list.do`,
                {
                    params: {
                        searchType: appliedSearchType,
                        keyword:
                            appliedKeyword || undefined,
                        category:
                            category || undefined,
                        page,
                        size: PAGE_SIZE
                    }
                }
            );

            setQnaList(
                response.data?.content ?? []
            );

            setTotalPages(
                response.data?.totalPages ?? 0
            );

            setTotalElements(
                response.data?.totalElements ?? 0
            );
        } catch (error) {
            console.error(error);

            setQnaList([]);
            setTotalPages(0);
            setTotalElements(0);

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                "문의 목록을 불러오지 못했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(0);
        setAppliedSearchType(searchType);
        setAppliedKeyword(keyword.trim());
    };

    const handleReset = () => {
        setSearchType("all");
        setKeyword("");
        setAppliedSearchType("all");
        setAppliedKeyword("");
        setCategory("");
        setPage(0);
    };

    const handleCategoryChange = (event) => {
        setCategory(event.target.value);
        setPage(0);
    };

    const handleWrite = () => {
        if (!token) {
            alert(
                "글 등록은 로그인 후 이용할 수 있습니다."
            );

            navigate("/member/login");
            return;
        }

        navigate("/qna/write");
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

    const displayCategory = (value) => {
        if (value === "서비스문의") {
            return "이용문의";
        }

        if (value === "기타문의") {
            return "기타";
        }

        return value || "기타";
    };

    return (
        <main style={styles.page}>
            <div
                className="container"
                style={styles.container}
            >
                <header style={styles.header}>
                    <div>
                        <p style={styles.categoryLabel}>
                            고객지원
                        </p>

                        <h1 style={styles.title}>
                            문의
                        </h1>

                        <p style={styles.description}>
                            서비스 이용 중 궁금한 내용을
                            문의해주세요.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary px-4"
                        style={styles.writeButton}
                        onClick={handleWrite}
                    >
                        {isAdmin
                            ? "글 등록"
                            : "문의 등록"}
                    </button>
                </header>

                <section style={styles.contentBox}>
                    <form
                        className="row g-2"
                        style={styles.searchArea}
                        onSubmit={handleSearch}
                    >
                        <div className="col-12 col-lg-2">
                            <select
                                className="form-select"
                                value={category}
                                onChange={handleCategoryChange}
                                style={styles.searchInput}
                            >
                                <option value="">
                                    전체 카테고리
                                </option>

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

                        <div className="col-12 col-lg-2">
                            <select
                                className="form-select"
                                value={searchType}
                                onChange={(event) =>
                                    setSearchType(
                                        event.target.value
                                    )
                                }
                                style={styles.searchInput}
                            >
                                <option value="all">
                                    전체
                                </option>

                                <option value="title">
                                    제목
                                </option>

                                <option value="content">
                                    내용
                                </option>

                                <option value="writer">
                                    작성자
                                </option>
                            </select>
                        </div>

                        <div className="col-12 col-lg-5">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="검색어를 입력해주세요."
                                value={keyword}
                                onChange={(event) =>
                                    setKeyword(
                                        event.target.value
                                    )
                                }
                                style={styles.searchInput}
                            />
                        </div>

                        <div className="col-6 col-lg-2">
                            <button
                                type="submit"
                                className="btn btn-dark w-100"
                                style={styles.searchButton}
                            >
                                검색
                            </button>
                        </div>

                        <div className="col-6 col-lg-1">
                            <button
                                type="button"
                                className="btn btn-outline-secondary w-100"
                                style={styles.searchButton}
                                onClick={handleReset}
                            >
                                초기화
                            </button>
                        </div>
                    </form>

                    <div style={styles.listHeader}>
                        총{" "}
                        <strong>{totalElements}</strong>
                        개의 문의
                    </div>

                    {errorMessage && (
                        <div className="alert alert-warning">
                            {errorMessage}
                        </div>
                    )}

                    {loading ? (
                        <div style={styles.emptyArea}>
                            목록을 불러오는 중입니다.
                        </div>
                    ) : qnaList.length === 0 ? (
                        <div style={styles.emptyArea}>
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead>
                                <tr>
                                    <th style={styles.numberColumn}>
                                        번호
                                    </th>

                                    <th style={styles.categoryColumn}>
                                        카테고리
                                    </th>

                                    <th>제목</th>

                                    <th style={styles.writerColumn}>
                                        작성자
                                    </th>

                                    <th style={styles.hitColumn}>
                                        조회수
                                    </th>

                                    <th style={styles.statusColumn}>
                                        답변 상태
                                    </th>

                                    <th style={styles.dateColumn}>
                                        등록일
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {qnaList.map((qna) => (
                                    <tr key={qna.no}>
                                        <td className="text-secondary">
                                            {qna.no}
                                        </td>

                                        <td>
                        <span
                            style={
                                styles.categoryBadge
                            }
                        >
                          {displayCategory(
                              qna.category
                          )}
                        </span>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                style={
                                                    styles.titleButton
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/qna/${qna.no}`
                                                    )
                                                }
                                            >
                                                {qna.title}
                                            </button>
                                        </td>

                                        <td>
                                            {qna.writerName ||
                                                qna.writerId ||
                                                "-"}
                                        </td>

                                        <td className="text-secondary">
                                            {qna.hit ?? 0}
                                        </td>

                                        <td>
                        <span
                            style={
                                qna.answerStatus ===
                                "답변완료"
                                    ? styles.completeBadge
                                    : styles.waitingBadge
                            }
                        >
                          {qna.answerStatus ||
                              "답변대기"}
                        </span>
                                        </td>

                                        <td className="text-secondary">
                                            {formatDate(
                                                qna.writeDate
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <nav style={styles.paginationArea}>
                            {Array.from(
                                { length: totalPages },
                                (_, index) => index
                            ).map((pageNumber) => (
                                <button
                                    type="button"
                                    key={pageNumber}
                                    className={
                                        page === pageNumber
                                            ? "btn btn-primary btn-sm"
                                            : "btn btn-outline-secondary btn-sm"
                                    }
                                    onClick={() =>
                                        setPage(pageNumber)
                                    }
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}
                        </nav>
                    )}
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
        maxWidth: "1180px"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        marginBottom: "28px"
    },

    categoryLabel: {
        marginBottom: "7px",
        color: "#0d6efd",
        fontSize: "14px",
        fontWeight: "700"
    },

    title: {
        marginBottom: "9px",
        fontSize: "38px",
        fontWeight: "800"
    },

    description: {
        margin: 0,
        color: "#737c8a",
        fontSize: "15px"
    },

    writeButton: {
        height: "46px",
        borderRadius: "8px",
        fontWeight: "700"
    },

    contentBox: {
        padding: "30px",
        backgroundColor: "#ffffff",
        border: "1px solid #e6eaf0",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30,45,70,0.05)"
    },

    searchArea: {
        marginBottom: "26px",
        padding: "20px",
        backgroundColor: "#f8fafc",
        borderRadius: "10px"
    },

    searchInput: {
        height: "46px"
    },

    searchButton: {
        height: "46px"
    },

    listHeader: {
        marginBottom: "13px",
        color: "#606978",
        fontSize: "14px"
    },

    emptyArea: {
        padding: "80px 20px",
        color: "#7c8491",
        textAlign: "center"
    },

    numberColumn: {
        width: "70px"
    },

    categoryColumn: {
        width: "115px"
    },

    writerColumn: {
        width: "120px"
    },

    hitColumn: {
        width: "75px"
    },

    statusColumn: {
        width: "110px"
    },

    dateColumn: {
        width: "115px"
    },

    categoryBadge: {
        display: "inline-block",
        padding: "5px 9px",
        color: "#315b93",
        backgroundColor: "#eef5ff",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "650"
    },

    titleButton: {
        padding: 0,
        color: "#242a33",
        background: "none",
        border: 0,
        fontSize: "15px",
        fontWeight: "600",
        textAlign: "left"
    },

    completeBadge: {
        display: "inline-block",
        padding: "5px 9px",
        color: "#087f5b",
        backgroundColor: "#e7f8f1",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700"
    },

    waitingBadge: {
        display: "inline-block",
        padding: "5px 9px",
        color: "#a15c00",
        backgroundColor: "#fff4df",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700"
    },

    paginationArea: {
        display: "flex",
        justifyContent: "center",
        gap: "7px",
        marginTop: "30px"
    }
};

export default QnaList;