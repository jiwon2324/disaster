import axios from "axios";
import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

const API_BASE_URL = "http://localhost";

function AdminMemberDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token =
        localStorage.getItem("token");

    const [member, setMember] =
        useState(null);

    const [selectedGradeNo, setSelectedGradeNo] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [savingGrade, setSavingGrade] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    useEffect(() => {
        if (!token) {
            alert("관리자 로그인이 필요합니다.");
            navigate("/member/login");
            return;
        }

        loadMember();
    }, [id, token, navigate]);

    const loadMember = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                `${API_BASE_URL}/member/admin/view.do`,
                {
                    params: {
                        id
                    },

                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            const memberData = response.data;

            setMember(memberData);

            setSelectedGradeNo(
                String(
                    memberData?.gradeNo ?? 1
                )
            );
        } catch (error) {
            console.error(
                "회원 상세조회 실패:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                error.response?.data?.error ||
                "회원정보를 불러오지 못했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGradeChange = async () => {
        if (!member) {
            return;
        }

        const newGradeNo =
            Number(selectedGradeNo);

        if (
            newGradeNo ===
            Number(member.gradeNo)
        ) {
            alert(
                "현재 회원 등급과 동일합니다."
            );
            return;
        }

        const newGradeName =
            newGradeNo === 9
                ? "관리자"
                : "일반회원";

        const confirmed =
            window.confirm(
                `${member.id} 회원의 등급을 '${newGradeName}'로 변경하시겠습니까?`
            );

        if (!confirmed) {
            setSelectedGradeNo(
                String(member.gradeNo)
            );
            return;
        }

        try {
            setSavingGrade(true);
            setErrorMessage("");

            const response = await axios.put(
                `${API_BASE_URL}/member/admin/grade.do`,
                {
                    gradeNo: newGradeNo
                },
                {
                    params: {
                        id: member.id
                    },

                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            setMember(response.data);

            setSelectedGradeNo(
                String(
                    response.data?.gradeNo ??
                    newGradeNo
                )
            );

            alert(
                "회원 등급이 변경되었습니다."
            );
        } catch (error) {
            console.error(
                "회원 등급 변경 실패:",
                error
            );

            setSelectedGradeNo(
                String(member.gradeNo)
            );

            setErrorMessage(
                error.response?.data?.message ||
                error.response?.data?.msg ||
                error.response?.data?.error ||
                "회원 등급을 변경하지 못했습니다."
            );
        } finally {
            setSavingGrade(false);
        }
    };

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        if (Array.isArray(value)) {
            const [year, month, day] =
                value;

            return `${year}-${String(
                month
            ).padStart(2, "0")}-${String(
                day
            ).padStart(2, "0")}`;
        }

        return String(value)
            .replace("T", " ")
            .slice(0, 10);
    };

    const displayStatus = (value) => {
        if (!value) {
            return "-";
        }

        if (
            value === "NORMAL" ||
            value === "ACTIVE" ||
            value === "정상"
        ) {
            return "정상";
        }

        if (
            value === "DORMANT" ||
            value === "SLEEP" ||
            value === "휴면"
        ) {
            return "휴면";
        }

        if (
            value === "STOP" ||
            value === "SUSPENDED" ||
            value === "FORCED" ||
            value === "정지" ||
            value === "강퇴"
        ) {
            return "강퇴";
        }

        if (
            value === "WITHDRAW" ||
            value === "WITHDRAWN" ||
            value === "탈퇴"
        ) {
            return "탈퇴";
        }

        return value;
    };

    const getStatusStyle = (status) => {
        const statusName =
            displayStatus(status);

        if (statusName === "정상") {
            return {
                ...styles.statusBadge,
                color: "#087f5b",
                backgroundColor: "#e6f7f1",
                borderColor: "#b9e9d8"
            };
        }

        if (statusName === "휴면") {
            return {
                ...styles.statusBadge,
                color: "#9a6700",
                backgroundColor: "#fff7df",
                borderColor: "#f1d991"
            };
        }

        if (statusName === "강퇴") {
            return {
                ...styles.statusBadge,
                color: "#c92a2a",
                backgroundColor: "#fff0f0",
                borderColor: "#ffc9c9"
            };
        }

        if (statusName === "탈퇴") {
            return {
                ...styles.statusBadge,
                color: "#59636f",
                backgroundColor: "#f1f3f5",
                borderColor: "#d9dde2"
            };
        }

        return styles.statusBadge;
    };

    if (loading) {
        return (
            <main style={styles.messagePage}>
                회원정보를 불러오는 중입니다.
            </main>
        );
    }

    if (errorMessage && !member) {
        return (
            <main style={styles.messagePage}>
                <div className="alert alert-warning">
                    {errorMessage}
                </div>

                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate("/member/admin")
                    }
                >
                    리스트
                </button>
            </main>
        );
    }

    if (!member) {
        return (
            <main style={styles.messagePage}>
                회원정보가 존재하지 않습니다.
            </main>
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
                        관리자
                    </p>

                    <h1 style={styles.title}>
                        회원정보보기
                    </h1>

                    <p style={styles.description}>
                        선택한 회원의 정보를 확인하고
                        등급을 변경할 수 있습니다.
                    </p>
                </header>

                <section style={styles.card}>
                    <div style={styles.profileHeader}>
                        <div style={styles.profileIcon}>
                            👤
                        </div>

                        <div>
                            <h2 style={styles.memberName}>
                                {member.name || "-"}
                            </h2>

                            <p style={styles.memberGrade}>
                                {member.gradeName ||
                                    "일반회원"}
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div
                            className="alert alert-danger"
                            style={styles.alertArea}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div style={styles.infoList}>
                        <InfoRow
                            label="아이디"
                            value={member.id}
                        />

                        <InfoRow
                            label="이름"
                            value={member.name}
                        />

                        <InfoRow
                            label="성별"
                            value={member.gender}
                        />

                        <InfoRow
                            label="생년월일"
                            value={formatDate(
                                member.birth
                            )}
                        />

                        <InfoRow
                            label="연락처"
                            value={member.tel}
                        />

                        <InfoRow
                            label="이메일"
                            value={member.email}
                        />

                        <InfoRow
                            label="가입일"
                            value={formatDate(
                                member.regDate
                            )}
                        />

                        <InfoRow
                            label="최근 접속일"
                            value={formatDate(
                                member.conDate
                            )}
                        />

                        <div style={styles.infoRow}>
                            <div style={styles.infoLabel}>
                                상태
                            </div>

                            <div style={styles.infoValue}>
                                <span
                                    style={getStatusStyle(
                                        member.status
                                    )}
                                >
                                    {displayStatus(
                                        member.status
                                    )}
                                </span>
                            </div>
                        </div>

                        <InfoRow
                            label="등급번호"
                            value={member.gradeNo}
                        />

                        <InfoRow
                            label="등급명"
                            value={member.gradeName}
                        />
                    </div>

                    <div style={styles.gradeArea}>
                        <div>
                            <h3 style={styles.gradeTitle}>
                                회원 등급 변경
                            </h3>

                            <p style={styles.gradeDescription}>
                                선택한 회원의 등급을
                                일반회원 또는 관리자로
                                변경할 수 있습니다.
                            </p>
                        </div>

                        <div style={styles.gradeControl}>
                            <select
                                className="form-select"
                                value={selectedGradeNo}
                                onChange={(event) =>
                                    setSelectedGradeNo(
                                        event.target.value
                                    )
                                }
                                disabled={savingGrade}
                                style={styles.gradeSelect}
                            >
                                <option value="1">
                                    일반회원
                                </option>

                                <option value="9">
                                    관리자
                                </option>
                            </select>

                            <button
                                type="button"
                                className="btn btn-dark"
                                onClick={
                                    handleGradeChange
                                }
                                disabled={savingGrade}
                                style={styles.gradeButton}
                            >
                                {savingGrade
                                    ? "변경 중..."
                                    : "등급 변경"}
                            </button>
                        </div>
                    </div>

                    <div style={styles.buttonArea}>
                        <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={() =>
                                navigate(
                                    "/member/admin"
                                )
                            }
                        >
                            리스트
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

function InfoRow({ label, value }) {
    return (
        <div style={styles.infoRow}>
            <div style={styles.infoLabel}>
                {label}
            </div>

            <div style={styles.infoValue}>
                {value === null ||
                value === undefined ||
                value === ""
                    ? "-"
                    : value}
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
        maxWidth: "850px"
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

    profileHeader: {
        display: "flex",
        alignItems: "center",
        gap: "18px",
        paddingBottom: "28px",
        borderBottom: "1px solid #edf0f3"
    },

    profileIcon: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "65px",
        height: "65px",
        backgroundColor: "#eef5ff",
        borderRadius: "50%",
        fontSize: "30px"
    },

    memberName: {
        margin: "0 0 5px",
        color: "#20242c",
        fontSize: "23px",
        fontWeight: "800"
    },

    memberGrade: {
        margin: 0,
        color: "#737c8a",
        fontSize: "14px"
    },

    alertArea: {
        marginTop: "24px",
        marginBottom: 0
    },

    infoList: {
        marginTop: "12px"
    },

    infoRow: {
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        alignItems: "center",
        padding: "18px 8px",
        borderBottom: "1px solid #edf0f3"
    },

    infoLabel: {
        color: "#626b78",
        fontSize: "14px",
        fontWeight: "700"
    },

    infoValue: {
        color: "#20242c",
        fontSize: "15px"
    },

    statusBadge: {
        display: "inline-block",
        minWidth: "65px",
        padding: "6px 12px",
        border: "1px solid #d9dde2",
        borderRadius: "7px",
        fontSize: "13px",
        fontWeight: "700",
        textAlign: "center"
    },

    gradeArea: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px",
        marginTop: "30px",
        padding: "22px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e5e9ef",
        borderRadius: "10px"
    },

    gradeTitle: {
        marginBottom: "7px",
        color: "#20242c",
        fontSize: "18px",
        fontWeight: "800"
    },

    gradeDescription: {
        margin: 0,
        color: "#737c8a",
        fontSize: "13px"
    },

    gradeControl: {
        display: "flex",
        gap: "8px"
    },

    gradeSelect: {
        width: "145px",
        minHeight: "42px"
    },

    gradeButton: {
        minWidth: "100px"
    },

    buttonArea: {
        display: "flex",
        justifyContent: "flex-end",
        marginTop: "28px"
    },

    messagePage: {
        maxWidth: "800px",
        margin: "120px auto",
        padding: "20px",
        textAlign: "center"
    }
};

export default AdminMemberDetail;