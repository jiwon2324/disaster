import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";

const API_BASE_URL =
    "http://localhost";

function AdminMemberList() {
    const navigate =
        useNavigate();

    const token =
        localStorage.getItem("token");

    const [members, setMembers] =
        useState([]);

    const [searchType, setSearchType] =
        useState("id");

    const [keyword, setKeyword] =
        useState("");

    const [
        appliedSearchType,
        setAppliedSearchType
    ] = useState("id");

    const [
        appliedKeyword,
        setAppliedKeyword
    ] = useState("");

    const [status, setStatus] =
        useState("");

    const [gradeNo, setGradeNo] =
        useState("");

    const [page, setPage] =
        useState(0);

    const [pageSize, setPageSize] =
        useState(10);

    const [sortBy, setSortBy] =
        useState("id");

    const [
        sortDirection,
        setSortDirection
    ] = useState("asc");

    const [totalPages, setTotalPages] =
        useState(0);

    const [
        totalElements,
        setTotalElements
    ] = useState(0);

    const [loading, setLoading] =
        useState(true);

    const [
        changingMemberId,
        setChangingMemberId
    ] = useState("");

    const [
        errorMessage,
        setErrorMessage
    ] = useState("");

    useEffect(() => {
        if (!token) {
            alert(
                "관리자 로그인이 필요합니다."
            );

            navigate(
                "/member/login"
            );

            return;
        }

        loadMembers();
    }, [
        token,
        navigate,
        page,
        pageSize,
        status,
        gradeNo,
        appliedSearchType,
        appliedKeyword,
        sortBy,
        sortDirection
    ]);

    const loadMembers = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response =
                await axios.get(
                    `${API_BASE_URL}/member/admin/list.do`,
                    {
                        params: {
                            searchType:
                            appliedSearchType,

                            keyword:
                                appliedKeyword
                                || undefined,

                            status:
                                status
                                || undefined,

                            gradeNo:
                                gradeNo
                                || undefined,

                            page,
                            size: pageSize,
                            sortBy,
                            sortDirection
                        },

                        headers: {
                            "X-AUTH-TOKEN":
                            token
                        }
                    }
                );

            const data =
                response.data;

            setMembers(
                data?.content
                ?? []
            );

            setTotalPages(
                data?.totalPages
                ?? 0
            );

            setTotalElements(
                data?.totalElements
                ?? 0
            );

            if (
                data?.totalPages > 0
                && page >= data.totalPages
            ) {
                setPage(
                    data.totalPages - 1
                );
            }

        } catch (error) {
            console.error(
                "회원 목록 조회 실패:",
                error
            );

            setMembers([]);
            setTotalPages(0);
            setTotalElements(0);

            setErrorMessage(
                error.response?.data?.message
                || error.response?.data?.msg
                || error.response?.data?.error
                || "회원 목록을 불러오지 못했습니다."
            );

            if (
                error.response?.status === 401
                || error.response?.status === 403
            ) {
                alert(
                    "관리자만 접근할 수 있습니다."
                );

                navigate("/");
            }

        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (
        event
    ) => {
        event.preventDefault();

        setPage(0);

        setAppliedSearchType(
            searchType
        );

        setAppliedKeyword(
            keyword.trim()
        );
    };

    const handleReset = () => {
        setSearchType("id");
        setKeyword("");

        setAppliedSearchType("id");
        setAppliedKeyword("");

        setStatus("");
        setGradeNo("");

        setPage(0);
        setPageSize(10);

        setSortBy("id");
        setSortDirection("asc");
    };

    const handleSort = (
        column
    ) => {
        setPage(0);

        if (sortBy === column) {
            setSortDirection(
                sortDirection === "asc"
                    ? "desc"
                    : "asc"
            );

            return;
        }

        setSortBy(column);
        setSortDirection("asc");
    };

    const getSortMark = (
        column
    ) => {
        if (sortBy !== column) {
            return "↕";
        }

        return sortDirection === "asc"
            ? "▲"
            : "▼";
    };

    const handleStatusChange = async (
        event,
        member
    ) => {
        event.stopPropagation();

        const newStatus =
            event.target.value;

        const currentStatus =
            displayStatus(
                member.status
            );

        if (
            !newStatus
            || newStatus === currentStatus
        ) {
            return;
        }

        const actionName = {
            정상: "정상처리",
            휴면: "휴면전환",
            강퇴: "강제탈퇴"
        }[newStatus];

        const confirmed =
            window.confirm(
                `${member.id} 회원을 '${actionName}' 상태로 변경하시겠습니까?`
            );

        if (!confirmed) {
            event.target.value =
                currentStatus;

            return;
        }

        try {
            setChangingMemberId(
                member.id
            );

            await axios.put(
                `${API_BASE_URL}/member/admin/status.do`,
                {
                    status: newStatus
                },
                {
                    params: {
                        id: member.id
                    },

                    headers: {
                        "X-AUTH-TOKEN":
                        token
                    }
                }
            );

            alert(
                "회원 상태가 변경되었습니다."
            );

            await loadMembers();

        } catch (error) {
            console.error(
                "회원 상태 변경 실패:",
                error
            );

            alert(
                error.response?.data?.message
                || error.response?.data?.msg
                || error.response?.data?.error
                || "회원 상태를 변경하지 못했습니다."
            );

            await loadMembers();

        } finally {
            setChangingMemberId("");
        }
    };

    const formatDate = (
        value
    ) => {
        if (!value) {
            return "-";
        }

        if (Array.isArray(value)) {
            const [
                year,
                month,
                day
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
            )}`;
        }

        return String(value)
            .replace("T", " ")
            .slice(0, 10);
    };

    const displayStatus = (
        value
    ) => {
        if (!value) {
            return "-";
        }

        if (
            value === "NORMAL"
            || value === "ACTIVE"
            || value === "정상"
        ) {
            return "정상";
        }

        if (
            value === "DORMANT"
            || value === "SLEEP"
            || value === "휴면"
        ) {
            return "휴면";
        }

        if (
            value === "STOP"
            || value === "SUSPENDED"
            || value === "FORCED"
            || value === "정지"
            || value === "강퇴"
        ) {
            return "강퇴";
        }

        if (
            value === "WITHDRAW"
            || value === "WITHDRAWN"
            || value === "탈퇴"
        ) {
            return "탈퇴";
        }

        return value;
    };

    const getStatusSelectStyle = (
        memberStatus
    ) => {
        const baseStyle = {
            ...styles.statusSelect
        };

        if (
            memberStatus === "정상"
        ) {
            return {
                ...baseStyle,
                color: "#087f5b",
                backgroundColor: "#e6f7f1",
                borderColor: "#b9e9d8"
            };
        }

        if (
            memberStatus === "휴면"
        ) {
            return {
                ...baseStyle,
                color: "#9a6700",
                backgroundColor: "#fff7df",
                borderColor: "#f1d991"
            };
        }

        if (
            memberStatus === "강퇴"
        ) {
            return {
                ...baseStyle,
                color: "#c92a2a",
                backgroundColor: "#fff0f0",
                borderColor: "#ffc9c9"
            };
        }

        if (
            memberStatus === "탈퇴"
        ) {
            return {
                ...baseStyle,
                color: "#59636f",
                backgroundColor: "#f1f3f5",
                borderColor: "#d9dde2"
            };
        }

        return baseStyle;
    };

    return (
        <main style={styles.page}>
            <div
                className="container-fluid"
                style={styles.container}
            >
                <header style={styles.header}>
                    <p style={styles.categoryLabel}>
                        관리자
                    </p>

                    <h1 style={styles.title}>
                        회원관리
                    </h1>

                    <p style={styles.description}>
                        회원을 검색하고 회원 상태를
                        관리할 수 있습니다.
                    </p>
                </header>

                <section style={styles.card}>
                    <form
                        style={styles.searchArea}
                        onSubmit={handleSearch}
                    >
                        <div style={styles.searchMainRow}>
                            <div style={styles.searchFieldGroup}>
                                <label
                                    htmlFor="searchType"
                                    style={styles.fieldLabel}
                                >
                                    검색 조건
                                </label>

                                <select
                                    id="searchType"
                                    className="form-select"
                                    value={searchType}
                                    onChange={(event) =>
                                        setSearchType(
                                            event.target.value
                                        )
                                    }
                                    style={styles.searchTypeInput}
                                >
                                    <option value="id">
                                        아이디
                                    </option>

                                    <option value="name">
                                        이름
                                    </option>

                                    <option value="email">
                                        이메일
                                    </option>

                                    <option value="tel">
                                        연락처
                                    </option>
                                </select>
                            </div>

                            <div style={styles.keywordGroup}>
                                <label
                                    htmlFor="memberKeyword"
                                    style={styles.fieldLabel}
                                >
                                    검색어
                                </label>

                                <input
                                    type="text"
                                    id="memberKeyword"
                                    className="form-control"
                                    value={keyword}
                                    onChange={(event) =>
                                        setKeyword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="검색어를 입력해주세요."
                                    style={styles.keywordInput}
                                />
                            </div>

                            <div style={styles.searchButtonArea}>
                                <button
                                    type="submit"
                                    className="btn btn-dark"
                                    style={styles.searchButton}
                                >
                                    검색
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    style={styles.resetButton}
                                    onClick={handleReset}
                                    aria-label="검색 조건 초기화"
                                    title="초기화"
                                >
                                    <RotateCcw
                                        size={19}
                                        strokeWidth={2.2}
                                    />
                                </button>
                            </div>
                        </div>

                        <div style={styles.filterRow}>
                            <div style={styles.filterLeft}>
                                <span style={styles.filterTitle}>
                                    상세 조건
                                </span>

                                <div style={styles.filterField}>
                                    <label
                                        htmlFor="statusFilter"
                                        style={styles.smallLabel}
                                    >
                                        상태
                                    </label>

                                    <select
                                        id="statusFilter"
                                        className="form-select form-select-sm"
                                        value={status}
                                        onChange={(event) => {
                                            setStatus(
                                                event.target.value
                                            );

                                            setPage(0);
                                        }}
                                        style={styles.filterSelect}
                                    >
                                        <option value="">
                                            전체 상태
                                        </option>

                                        <option value="정상">
                                            정상
                                        </option>

                                        <option value="휴면">
                                            휴면
                                        </option>

                                        <option value="강퇴">
                                            강퇴
                                        </option>

                                        <option value="탈퇴">
                                            탈퇴
                                        </option>
                                    </select>
                                </div>

                                <div style={styles.filterField}>
                                    <label
                                        htmlFor="gradeFilter"
                                        style={styles.smallLabel}
                                    >
                                        등급
                                    </label>

                                    <select
                                        id="gradeFilter"
                                        className="form-select form-select-sm"
                                        value={gradeNo}
                                        onChange={(event) => {
                                            setGradeNo(
                                                event.target.value
                                            );

                                            setPage(0);
                                        }}
                                        style={styles.filterSelect}
                                    >
                                        <option value="">
                                            전체 등급
                                        </option>

                                        <option value="1">
                                            일반회원
                                        </option>

                                        <option value="9">
                                            관리자
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div style={styles.listHeader}>
                        <div style={styles.listCount}>
                            총{" "}
                            <strong>
                                {totalElements}
                            </strong>
                            명의 회원
                        </div>

                        <div style={styles.pageSizeArea}>
                            <label
                                htmlFor="pageSize"
                                style={styles.pageSizeLabel}
                            >
                                페이지당
                            </label>

                            <select
                                id="pageSize"
                                className="form-select form-select-sm"
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(
                                        Number(
                                            event.target.value
                                        )
                                    );

                                    setPage(0);
                                }}
                                style={styles.pageSizeSelect}
                            >
                                <option value={10}>
                                    10개
                                </option>

                                <option value={15}>
                                    15개
                                </option>

                                <option value={20}>
                                    20개
                                </option>

                                <option value={25}>
                                    25개
                                </option>
                            </select>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="alert alert-warning">
                            {errorMessage}
                        </div>
                    )}

                    {loading ? (
                        <div style={styles.emptyArea}>
                            회원 목록을 불러오는 중입니다.
                        </div>
                    ) : members.length === 0 ? (
                        <div style={styles.emptyArea}>
                            조회된 회원이 없습니다.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table
                                className="table table-hover align-middle mb-0"
                                style={styles.table}
                            >
                                <thead>
                                <tr>
                                    <SortableHeader
                                        title="아이디"
                                        column="id"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "id"
                                        )}
                                    />

                                    <SortableHeader
                                        title="이름"
                                        column="name"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "name"
                                        )}
                                    />

                                    <SortableHeader
                                        title="성별"
                                        column="gender"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "gender"
                                        )}
                                    />

                                    <SortableHeader
                                        title="생년월일"
                                        column="birth"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "birth"
                                        )}
                                    />

                                    <SortableHeader
                                        title="연락처"
                                        column="tel"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "tel"
                                        )}
                                    />

                                    <SortableHeader
                                        title="상태"
                                        column="status"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "status"
                                        )}
                                    />

                                    <SortableHeader
                                        title="등급번호"
                                        column="gradeNo"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "gradeNo"
                                        )}
                                    />

                                    <SortableHeader
                                        title="등급명"
                                        column="gradeName"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "gradeName"
                                        )}
                                    />

                                    <SortableHeader
                                        title="최근 접속일"
                                        column="conDate"
                                        onSort={handleSort}
                                        sortMark={getSortMark(
                                            "conDate"
                                        )}
                                    />
                                </tr>
                                </thead>

                                <tbody>
                                {members.map(
                                    (member) => {
                                        const memberStatus =
                                            displayStatus(
                                                member.status
                                            );

                                        return (
                                            <tr
                                                key={member.id}
                                                style={styles.tableRow}
                                                onClick={() =>
                                                    navigate(
                                                        `/member/admin/${encodeURIComponent(
                                                            member.id
                                                        )}`
                                                    )
                                                }
                                            >
                                                <td style={styles.idCell}>
                                                    {member.id}
                                                </td>

                                                <td>
                                                    {member.name
                                                        || "-"}
                                                </td>

                                                <td>
                                                    {member.gender
                                                        || "-"}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        member.birth
                                                    )}
                                                </td>

                                                <td>
                                                    {member.tel
                                                        || "-"}
                                                </td>

                                                <td
                                                    onClick={(event) =>
                                                        event.stopPropagation()
                                                    }
                                                >
                                                    <select
                                                        className="form-select form-select-sm"
                                                        aria-label={`${member.id} 회원 상태 변경`}
                                                        value={memberStatus}
                                                        disabled={
                                                            changingMemberId
                                                            === member.id
                                                        }
                                                        onClick={(event) =>
                                                            event.stopPropagation()
                                                        }
                                                        onChange={(event) =>
                                                            handleStatusChange(
                                                                event,
                                                                member
                                                            )
                                                        }
                                                        style={
                                                            getStatusSelectStyle(
                                                                memberStatus
                                                            )
                                                        }
                                                    >
                                                        {memberStatus
                                                            === "탈퇴" && (
                                                                <option
                                                                    value="탈퇴"
                                                                    disabled
                                                                >
                                                                    탈퇴
                                                                </option>
                                                            )}

                                                        <option value="정상">
                                                            정상처리
                                                        </option>

                                                        <option value="휴면">
                                                            휴면전환
                                                        </option>

                                                        <option value="강퇴">
                                                            강제탈퇴
                                                        </option>
                                                    </select>
                                                </td>

                                                <td>
                                                    {member.gradeNo
                                                        ?? "-"}
                                                </td>

                                                <td>
                                                    {member.gradeName
                                                        || "-"}
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        member.conDate
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div style={styles.paginationArea}>
                            {Array.from(
                                {
                                    length:
                                    totalPages
                                },
                                (_, index) =>
                                    index
                            ).map(
                                (pageNumber) => (
                                    <button
                                        type="button"
                                        key={pageNumber}
                                        className={
                                            page
                                            === pageNumber
                                                ? "btn btn-primary btn-sm"
                                                : "btn btn-outline-secondary btn-sm"
                                        }
                                        onClick={() =>
                                            setPage(
                                                pageNumber
                                            )
                                        }
                                        style={styles.pageButton}
                                    >
                                        {pageNumber + 1}
                                    </button>
                                )
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}

function SortableHeader({
                            title,
                            column,
                            onSort,
                            sortMark
                        }) {
    return (
        <th scope="col">
            <button
                type="button"
                onClick={() =>
                    onSort(column)
                }
                style={styles.sortButton}
            >
                {title}

                <span style={styles.sortMark}>
                    {sortMark}
                </span>
            </button>
        </th>
    );
}

const styles = {
    page: {
        minHeight:
            "calc(100vh - 72px)",
        padding:
            "58px 20px 90px",
        backgroundColor:
            "#ffffff"
    },

    container: {
        maxWidth: "1450px",
        margin: "0 auto"
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
        padding: "26px",
        backgroundColor: "#ffffff",
        border:
            "1px solid #e5e9ef",
        borderRadius: "14px",
        boxShadow:
            "0 10px 30px rgba(30,45,70,0.05)"
    },

    searchArea: {
        marginBottom: "24px",
        padding: "20px",
        backgroundColor: "#f8fafc",
        border:
            "1px solid #edf0f3",
        borderRadius: "10px"
    },

    searchMainRow: {
        display: "flex",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "10px"
    },

    searchFieldGroup: {
        width: "150px"
    },

    keywordGroup: {
        flex: "1 1 360px",
        minWidth: "260px"
    },

    fieldLabel: {
        display: "block",
        marginBottom: "7px",
        color: "#4f5966",
        fontSize: "13px",
        fontWeight: "700"
    },

    searchTypeInput: {
        minHeight: "44px"
    },

    keywordInput: {
        minHeight: "44px"
    },

    searchButtonArea: {
        display: "flex",
        gap: "8px"
    },

    searchButton: {
        width: "95px",
        minHeight: "44px"
    },

    resetButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "48px",
        minHeight: "44px",
        padding: 0
    },

    filterRow: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        marginTop: "16px",
        paddingTop: "16px",
        borderTop:
            "1px solid #e4e8ed"
    },

    filterLeft: {
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px"
    },

    filterTitle: {
        color: "#323a45",
        fontSize: "13px",
        fontWeight: "800"
    },

    filterField: {
        display: "flex",
        alignItems: "center",
        gap: "7px"
    },

    smallLabel: {
        color: "#68727f",
        fontSize: "13px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },

    filterSelect: {
        width: "135px",
        minHeight: "36px"
    },

    listHeader: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "14px"
    },

    listCount: {
        color: "#606978",
        fontSize: "14px"
    },

    pageSizeArea: {
        display: "flex",
        alignItems: "center",
        gap: "7px"
    },

    pageSizeLabel: {
        color: "#68727f",
        fontSize: "13px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },

    pageSizeSelect: {
        width: "86px"
    },

    table: {
        minWidth: "1080px",
        fontSize: "13px"
    },

    tableRow: {
        cursor: "pointer"
    },

    idCell: {
        fontWeight: "700"
    },

    sortButton: {
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: 0,
        color: "#20242c",
        background: "none",
        border: "none",
        fontSize: "13px",
        fontWeight: "700",
        whiteSpace: "nowrap"
    },

    sortMark: {
        color: "#8a93a1",
        fontSize: "10px"
    },

    statusSelect: {
        minWidth: "110px",
        fontSize: "12px",
        fontWeight: "700"
    },

    emptyArea: {
        padding: "80px 20px",
        color: "#737c8a",
        textAlign: "center"
    },

    paginationArea: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "7px",
        marginTop: "28px"
    },

    pageButton: {
        minWidth: "34px"
    }
};

export default AdminMemberList;