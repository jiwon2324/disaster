import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";

function MemberWrite() {
    const navigate = useNavigate();
    const idInputRef = useRef(null);

    const [form, setForm] = useState({
        id: "",
        pw: "",
        pw2: "",
        name: "",
        gender: "",
        birth: "",
        tel: "",
        email: ""
    });

    const [idChecked, setIdChecked] = useState(false);
    const [idAvailable, setIdAvailable] = useState(false);
    const [idMessage, setIdMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        idInputRef.current?.focus();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        if (name === "id") {
            setIdChecked(false);
            setIdAvailable(false);
            setIdMessage("");
        }
    };

    const checkId = async () => {
        const id = form.id.trim();

        if (!id) {
            setIdMessage("아이디를 입력해주세요.");
            setIdAvailable(false);
            return;
        }

        if (id.length < 4) {
            setIdMessage("아이디는 4자 이상 입력해주세요.");
            setIdAvailable(false);
            return;
        }

        try {
            const response = await axios.get(
                `${API_BASE_URL}/member/check-id.do`,
                {
                    params: { id }
                }
            );

            const available = response.data?.available === true;

            setIdChecked(true);
            setIdAvailable(available);
            setIdMessage(
                available
                    ? "사용 가능한 아이디입니다."
                    : "이미 사용 중인 아이디입니다."
            );
        } catch (error) {
            console.error(error);

            setIdChecked(false);
            setIdAvailable(false);
            setIdMessage("중복 확인 중 오류가 발생했습니다.");
        }
    };

    const validate = () => {
        if (!idChecked || !idAvailable) {
            return "아이디 중복 확인을 완료해주세요.";
        }

        if (form.pw.length < 4) {
            return "비밀번호는 4자 이상 입력해주세요.";
        }

        if (form.pw !== form.pw2) {
            return "비밀번호가 일치하지 않습니다.";
        }

        if (!form.gender) {
            return "성별을 선택해주세요.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        const validationMessage = validate();

        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }

        const requestData = {
            id: form.id.trim(),
            pw: form.pw,
            name: form.name.trim(),
            gender: form.gender,
            birth: form.birth,
            tel: form.tel.trim(),
            email: form.email.trim()
        };

        try {
            setLoading(true);

            const response = await axios.post(
                `${API_BASE_URL}/member/write.do`,
                requestData
            );

            if (response.data?.success) {
                alert("회원가입이 완료되었습니다.");
                navigate("/member/login");
                return;
            }

            setErrorMessage(
                response.data?.msg || "회원가입에 실패했습니다."
            );
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.msg;

            if (!error.response) {
                setErrorMessage("백엔드 서버에 연결할 수 없습니다.");
            } else {
                setErrorMessage(
                    message || "회원가입 처리 중 오류가 발생했습니다."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={styles.page}>
            <div style={styles.circleLarge} />
            <div style={styles.circleSmall} />

            <div className="container position-relative">
                <section style={styles.formContainer}>
                    <header style={styles.header}>
                        <button
                            type="button"
                            style={styles.logoButton}
                            onClick={() => navigate("/")}
                        >
                            재난안전정보
                        </button>

                        <h1 style={styles.title}>회원가입</h1>

                        <p style={styles.description}>
                            회원정보를 입력해주세요.
                        </p>
                    </header>

                    {errorMessage && (
                        <div
                            className="alert alert-danger"
                            role="alert"
                            style={styles.alert}
                        >
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-12">
                                <label
                                    htmlFor="id"
                                    className="form-label fw-semibold"
                                >
                                    아이디
                                </label>

                                <div className="input-group">
                                    <input
                                        ref={idInputRef}
                                        type="text"
                                        id="id"
                                        name="id"
                                        className="form-control"
                                        placeholder="아이디를 입력하세요"
                                        maxLength={20}
                                        value={form.id}
                                        onChange={handleChange}
                                        style={styles.input}
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        style={styles.checkButton}
                                        onClick={checkId}
                                    >
                                        중복 확인
                                    </button>
                                </div>

                                {idMessage && (
                                    <p
                                        style={{
                                            ...styles.message,
                                            color: idAvailable
                                                ? "#198754"
                                                : "#dc3545"
                                        }}
                                    >
                                        {idMessage}
                                    </p>
                                )}
                            </div>

                            <div className="col-12 col-md-6">
                                <label
                                    htmlFor="pw"
                                    className="form-label fw-semibold"
                                >
                                    비밀번호
                                </label>

                                <input
                                    type="password"
                                    id="pw"
                                    name="pw"
                                    className="form-control"
                                    placeholder="비밀번호 입력"
                                    value={form.pw}
                                    onChange={handleChange}
                                    style={styles.input}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label
                                    htmlFor="pw2"
                                    className="form-label fw-semibold"
                                >
                                    비밀번호 확인
                                </label>

                                <input
                                    type="password"
                                    id="pw2"
                                    name="pw2"
                                    className="form-control"
                                    placeholder="비밀번호 다시 입력"
                                    value={form.pw2}
                                    onChange={handleChange}
                                    style={styles.input}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
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
                                    placeholder="이름을 입력하세요"
                                    maxLength={30}
                                    value={form.name}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">
                                    성별
                                </label>

                                <div style={styles.genderBox}>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="남자"
                                            checked={form.gender === "남자"}
                                            onChange={handleChange}
                                        />
                                        남자
                                    </label>

                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="여자"
                                            checked={form.gender === "여자"}
                                            onChange={handleChange}
                                        />
                                        여자
                                    </label>
                                </div>
                            </div>

                            <div className="col-12 col-md-6">
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
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div className="col-12 col-md-6">
                                <label
                                    htmlFor="tel"
                                    className="form-label fw-semibold"
                                >
                                    전화번호
                                </label>

                                <input
                                    type="tel"
                                    id="tel"
                                    name="tel"
                                    className="form-control"
                                    placeholder="010-0000-0000"
                                    maxLength={13}
                                    value={form.tel}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div className="col-12">
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
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            style={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? "가입 처리 중..." : "회원가입"}
                        </button>

                        <div style={styles.loginArea}>
                            <span>이미 계정이 있으신가요?</span>

                            <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => navigate("/member/login")}
                            >
                                로그인
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
        position: "relative",
        overflow: "hidden",
        minHeight: "calc(100vh - 70px)",
        padding: "58px 24px 90px",
        backgroundColor: "#f6f7fb"
    },

    circleLarge: {
        position: "absolute",
        top: "-240px",
        left: "50%",
        width: "900px",
        height: "900px",
        borderRadius: "50%",
        backgroundColor: "#e9edff",
        transform: "translateX(-50%)"
    },

    circleSmall: {
        position: "absolute",
        right: "-180px",
        bottom: "-240px",
        width: "540px",
        height: "540px",
        borderRadius: "50%",
        backgroundColor: "#eef4ff"
    },

    formContainer: {
        position: "relative",
        zIndex: 1,
        maxWidth: "760px",
        margin: "0 auto",
        padding: "44px 54px",
        backgroundColor: "#ffffff",
        border: "1px solid #eaecf0",
        borderRadius: "16px",
        boxShadow: "0 18px 50px rgba(37, 48, 76, 0.1)"
    },

    header: {
        marginBottom: "32px",
        textAlign: "center"
    },

    logoButton: {
        marginBottom: "24px",
        padding: 0,
        color: "#0d6efd",
        background: "none",
        border: 0,
        fontSize: "18px",
        fontWeight: "800"
    },

    title: {
        marginBottom: "10px",
        color: "#20242c",
        fontSize: "32px",
        fontWeight: "800"
    },

    description: {
        margin: 0,
        color: "#7a818d",
        fontSize: "15px"
    },

    alert: {
        marginBottom: "26px"
    },

    input: {
        height: "49px",
        padding: "0 15px",
        borderRadius: "7px",
        fontSize: "15px"
    },

    checkButton: {
        minWidth: "105px",
        borderRadius: "0 7px 7px 0"
    },

    message: {
        margin: "8px 0 0",
        fontSize: "13px"
    },

    genderBox: {
        display: "flex",
        alignItems: "center",
        gap: "32px",
        height: "49px",
        padding: "0 16px",
        border: "1px solid #dee2e6",
        borderRadius: "7px"
    },

    radioLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer"
    },

    submitButton: {
        height: "52px",
        marginTop: "32px",
        borderRadius: "7px",
        fontSize: "16px",
        fontWeight: "700"
    },

    loginArea: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        marginTop: "22px",
        color: "#777f8c",
        fontSize: "14px"
    }
};

export default MemberWrite;