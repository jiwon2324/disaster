import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";

const createEmptyForm = () => ({
    id: "",
    currentPw: "",
    name: "",
    gender: "",
    birth: "",
    tel: "",
    email: ""
});

function MemberUpdate() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [form, setForm] =
        useState(createEmptyForm);

    const [originalForm, setOriginalForm] =
        useState(createEmptyForm);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    const formatDateInput = (value) => {
        if (!value) {
            return "";
        }

        if (Array.isArray(value)) {
            const [year, month, day] = value;

            return `${year}-${String(month).padStart(
                2,
                "0"
            )}-${String(day).padStart(2, "0")}`;
        }

        return String(value).slice(0, 10);
    };

    const getToday = () => {
        return new Date()
            .toISOString()
            .slice(0, 10);
    };

    const getMinimumBirthDate = () => {
        const date = new Date();
        date.setFullYear(
            date.getFullYear() - 100
        );

        return date
            .toISOString()
            .slice(0, 10);
    };

    const getErrorMessage = (error) => {
        return (
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.response?.data?.msg ||
            error.response?.data?.error ||
            "회원정보 수정에 실패하였습니다. 정보를 확인 후 다시 시도해 주세요."
        );
    };

    useEffect(() => {
        if (!token) {
            alert("로그인이 필요합니다.");
            navigate("/member/login");
            return;
        }

        loadMemberInfo();
    }, [token, navigate]);

    const loadMemberInfo = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                `${API_BASE_URL}/member/me.do`,
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            const member = response.data;

            const loadedForm = {
                id: member.id || "",
                currentPw: "",
                name: member.name || "",
                gender: member.gender || "",
                birth: formatDateInput(
                    member.birth
                ),
                tel: member.tel || "",
                email: member.email || ""
            };

            setForm(loadedForm);
            setOriginalForm(loadedForm);
        } catch (error) {
            console.error(
                "회원정보 조회 실패:",
                error
            );

            setErrorMessage(
                getErrorMessage(error)
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("login");

                alert(
                    "로그인 정보가 만료되었습니다."
                );

                navigate("/member/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } =
            event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleReset = () => {
        setForm({
            ...originalForm,
            currentPw: ""
        });

        setErrorMessage("");
    };

    const validateForm = () => {
        if (
            form.currentPw.length < 4 ||
            form.currentPw.length > 20
        ) {
            return "비밀번호는 4자 이상 20자 이하로 입력해주세요.";
        }

        if (
            !/^[가-힣]{2,10}$/.test(
                form.name.trim()
            )
        ) {
            return "이름은 한글 2자 이상 10자 이하로 입력해주세요.";
        }

        if (
            form.gender !== "남자" &&
            form.gender !== "여자"
        ) {
            return "성별을 선택해주세요.";
        }

        if (!form.birth) {
            return "생년월일을 선택해주세요.";
        }

        if (
            form.birth < getMinimumBirthDate() ||
            form.birth > getToday()
        ) {
            return "생년월일은 100년 전부터 오늘까지 선택할 수 있습니다.";
        }

        if (
            form.tel &&
            !/^\d{2,3}-\d{3,4}-\d{4}$/.test(
                form.tel.trim()
            )
        ) {
            return "연락처는 010-1234-5678 형식으로 입력해주세요.";
        }

        if (
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                form.email.trim()
            )
        ) {
            return "이메일 형식이 올바르지 않습니다.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setErrorMessage("");

        const validationMessage =
            validateForm();

        if (validationMessage) {
            setErrorMessage(
                validationMessage
            );
            return;
        }

        try {
            setSaving(true);

            const response = await axios.put(
                `${API_BASE_URL}/member/update.do`,
                {
                    currentPw: form.currentPw,
                    name: form.name.trim(),
                    gender: form.gender,
                    birth: form.birth,
                    tel: form.tel.trim() || null,
                    email: form.email.trim()
                },
                {
                    headers: {
                        "X-AUTH-TOKEN": token
                    }
                }
            );

            const savedLogin =
                localStorage.getItem("login");

            if (savedLogin) {
                try {
                    const login =
                        JSON.parse(savedLogin);

                    login.name =
                        response.data?.name ||
                        form.name.trim();

                    localStorage.setItem(
                        "login",
                        JSON.stringify(login)
                    );
                } catch (error) {
                    console.error(
                        "로그인 정보 갱신 실패:",
                        error
                    );
                }
            }

            alert(
                "회원의 정보가 수정되었습니다."
            );

            window.location.href =
                "/member/mypage";
        } catch (error) {
            console.error(
                "회원정보 수정 실패:",
                error
            );

            setErrorMessage(
                getErrorMessage(error)
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <main style={styles.messagePage}>
                회원정보를 불러오는 중입니다.
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
                        마이페이지
                    </p>

                    <h1 style={styles.title}>
                        회원정보 수정
                    </h1>

                    <p style={styles.description}>
                        회원정보를 수정하려면 현재
                        비밀번호를 입력해주세요.
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
                                htmlFor="id"
                                className="form-label fw-semibold"
                            >
                                아이디
                            </label>

                            <input
                                type="text"
                                id="id"
                                className="form-control"
                                value={form.id}
                                disabled
                                style={styles.disabledInput}
                            />

                            <div className="form-text">
                                아이디는 변경할 수 없습니다.
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="currentPw"
                                className="form-label fw-semibold"
                            >
                                비밀번호
                            </label>

                            <input
                                type="password"
                                id="currentPw"
                                name="currentPw"
                                className="form-control"
                                placeholder="본인 확인을 위한 현재 비밀번호"
                                value={form.currentPw}
                                onChange={handleChange}
                                minLength={4}
                                maxLength={20}
                                autoComplete="current-password"
                                style={styles.input}
                                required
                            />

                            <div className="form-text">
                                회원정보 수정 전 본인 확인에
                                사용됩니다.
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="name"
                                className="form-label fw-semibold"
                            >
                                이름
                            </label>

                            <input
                                type="text"
                                id="name"
                                name="name"
                                className="form-control"
                                value={form.name}
                                onChange={handleChange}
                                minLength={2}
                                maxLength={10}
                                style={styles.input}
                                required
                            />
                        </div>

                        <fieldset className="mb-4">
                            <legend
                                style={styles.legend}
                            >
                                성별
                            </legend>

                            <div style={styles.radioArea}>
                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="genderFemale"
                                        name="gender"
                                        className="form-check-input"
                                        value="여자"
                                        checked={
                                            form.gender ===
                                            "여자"
                                        }
                                        onChange={handleChange}
                                    />

                                    <label
                                        htmlFor="genderFemale"
                                        className="form-check-label"
                                    >
                                        여자
                                    </label>
                                </div>

                                <div className="form-check">
                                    <input
                                        type="radio"
                                        id="genderMale"
                                        name="gender"
                                        className="form-check-input"
                                        value="남자"
                                        checked={
                                            form.gender ===
                                            "남자"
                                        }
                                        onChange={handleChange}
                                    />

                                    <label
                                        htmlFor="genderMale"
                                        className="form-check-label"
                                    >
                                        남자
                                    </label>
                                </div>
                            </div>
                        </fieldset>

                        <div className="mb-4">
                            <label
                                htmlFor="birth"
                                className="form-label fw-semibold"
                            >
                                생년월일
                            </label>

                            <input
                                type="date"
                                id="birth"
                                name="birth"
                                className="form-control"
                                value={form.birth}
                                onChange={handleChange}
                                min={getMinimumBirthDate()}
                                max={getToday()}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="tel"
                                className="form-label fw-semibold"
                            >
                                연락처
                            </label>

                            <input
                                type="text"
                                id="tel"
                                name="tel"
                                className="form-control"
                                placeholder="010-1234-5678"
                                value={form.tel}
                                onChange={handleChange}
                                maxLength={13}
                                style={styles.input}
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="form-label fw-semibold"
                            >
                                이메일
                            </label>

                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-control"
                                placeholder="example@email.com"
                                value={form.email}
                                onChange={handleChange}
                                maxLength={50}
                                style={styles.input}
                                required
                            />
                        </div>

                        <div style={styles.actionArea}>
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={handleReset}
                                disabled={saving}
                            >
                                다시 입력
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={() =>
                                    navigate(-1)
                                }
                                disabled={saving}
                            >
                                취소
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary px-4"
                                disabled={saving}
                            >
                                {saving
                                    ? "수정 중..."
                                    : "수정"}
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

    input: {
        minHeight: "50px"
    },

    disabledInput: {
        minHeight: "50px",
        color: "#737c8a",
        backgroundColor: "#f3f5f7"
    },

    legend: {
        marginBottom: "10px",
        fontSize: "16px",
        fontWeight: "600"
    },

    radioArea: {
        display: "flex",
        gap: "28px",
        minHeight: "45px",
        alignItems: "center"
    },

    actionArea: {
        display: "flex",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: "10px",
        paddingTop: "12px"
    },

    messagePage: {
        maxWidth: "800px",
        margin: "120px auto",
        padding: "20px",
        textAlign: "center"
    }
};

export default MemberUpdate;