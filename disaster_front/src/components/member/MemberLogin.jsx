import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  useEffect,
  useRef,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const API_BASE_URL =
    "http://localhost";

function MemberLogin() {
  const navigate =
      useNavigate();

  const idInputRef =
      useRef(null);

  const [id, setId] =
      useState("");

  const [pw, setPw] =
      useState("");

  const [
    errorMessage,
    setErrorMessage
  ] = useState("");

  const [loading, setLoading] =
      useState(false);

  useEffect(() => {
    idInputRef.current?.focus();
  }, []);

  const handleSubmit = async (
      event
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!id.trim() || !pw) {
      setErrorMessage(
          "아이디와 비밀번호를 입력해주세요."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
          await axios.post(
              `${API_BASE_URL}/member/login.do`,
              {
                id: id.trim(),
                pw
              }
          );

      const result =
          response.data;

      if (
          !result?.success
          || !result?.token
      ) {
        setErrorMessage(
            result?.msg
            || "아이디 또는 비밀번호를 확인해주세요."
        );

        return;
      }

      const token =
          result.token;

      let loginInfo;

      try {
        loginInfo =
            jwtDecode(token);
      } catch {
        loginInfo = {
          id: id.trim()
        };
      }

      localStorage.setItem(
          "token",
          token
      );

      localStorage.setItem(
          "login",
          JSON.stringify(loginInfo)
      );

      window.location.href = "/";

    } catch (error) {
      const status =
          error.response?.status;

      const serverMessage =
          error.response?.data?.message
          || error.response?.data?.detail
          || error.response?.data?.msg;

      if (status === 401) {
        setErrorMessage(
            serverMessage
            || "아이디 또는 비밀번호가 올바르지 않습니다."
        );

      } else if (status === 403) {
        setErrorMessage(
            serverMessage
            || "로그인할 수 없는 회원 상태입니다."
        );

      } else if (!error.response) {
        setErrorMessage(
            "백엔드 서버에 연결할 수 없습니다."
        );

      } else {
        setErrorMessage(
            serverMessage
            || "로그인 처리 중 오류가 발생했습니다."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
      <main style={styles.page}>
        <section style={styles.loginBox}>
          <button
              type="button"
              style={styles.logo}
              onClick={() =>
                  navigate("/")
              }
          >
            <ShieldCheck
                size={31}
                strokeWidth={2.3}
                style={styles.logoIcon}
            />

            <span style={styles.logoText}>
                        안전온
                    </span>
          </button>

          <header style={styles.header}>
            <h1 style={styles.title}>
              로그인
            </h1>

            <p style={styles.description}>
              아이디와 비밀번호를 입력해주세요.
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
            <div style={styles.inputGroup}>
              <label
                  htmlFor="id"
                  style={styles.label}
              >
                아이디
              </label>

              <input
                  ref={idInputRef}
                  type="text"
                  id="id"
                  className="form-control"
                  placeholder="아이디를 입력하세요"
                  maxLength={20}
                  value={id}
                  onChange={(event) =>
                      setId(event.target.value)
                  }
                  autoComplete="username"
                  style={styles.input}
                  required
              />
            </div>

            <div style={styles.inputGroup}>
              <label
                  htmlFor="pw"
                  style={styles.label}
              >
                비밀번호
              </label>

              <input
                  type="password"
                  id="pw"
                  className="form-control"
                  placeholder="비밀번호를 입력하세요"
                  maxLength={100}
                  value={pw}
                  onChange={(event) =>
                      setPw(event.target.value)
                  }
                  autoComplete="current-password"
                  style={styles.input}
                  required
              />
            </div>

            <button
                type="submit"
                className="btn btn-primary w-100"
                style={styles.loginButton}
                disabled={loading}
            >
              {loading
                  ? "로그인 중..."
                  : "로그인"}
            </button>
          </form>

          <div style={styles.bottomArea}>
            <div style={styles.guideRow}>
                        <span style={styles.guideText}>
                            아직 회원이 아니신가요?
                        </span>

              <button
                  type="button"
                  style={styles.primaryLink}
                  onClick={() =>
                      navigate(
                          "/member/write"
                      )
                  }
              >
                회원가입
              </button>
            </div>

            <div style={styles.guideRow}>
                        <span style={styles.guideText}>
                            비밀번호를 잊으셨나요?
                        </span>

              <button
                  type="button"
                  style={styles.secondaryLink}
                  onClick={() =>
                      navigate(
                          "/member/find-password"
                      )
                  }
              >
                비밀번호 찾기
              </button>
            </div>
          </div>
        </section>
      </main>
  );
}

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 72px)",
    padding: "70px 24px",
    backgroundColor: "#ffffff"
  },

  loginBox: {
    width: "100%",
    maxWidth: "510px",
    padding: "52px 58px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e7ed",
    borderRadius: "14px",
    boxShadow:
        "0 10px 30px rgba(30, 45, 70, 0.07)"
  },

  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "fit-content",
    gap: "9px",
    margin: "0 auto 28px",
    padding: 0,
    background: "none",
    border: 0,
    cursor: "pointer"
  },

  logoIcon: {
    color: "#1769e0"
  },

  logoText: {
    color: "#172033",
    fontSize: "23px",
    fontWeight: "850",
    letterSpacing: "-0.05em"
  },

  header: {
    marginBottom: "34px",
    textAlign: "center"
  },

  title: {
    marginBottom: "10px",
    color: "#20242c",
    fontSize: "34px",
    fontWeight: "800"
  },

  description: {
    margin: 0,
    color: "#7b8492",
    fontSize: "15px"
  },

  alert: {
    marginBottom: "24px",
    fontSize: "14px"
  },

  inputGroup: {
    marginBottom: "22px"
  },

  label: {
    display: "block",
    marginBottom: "9px",
    color: "#303640",
    fontSize: "15px",
    fontWeight: "700"
  },

  input: {
    height: "53px",
    padding: "0 16px",
    borderColor: "#dfe4eb",
    borderRadius: "8px",
    fontSize: "15px"
  },

  loginButton: {
    height: "54px",
    marginTop: "4px",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "700"
  },

  bottomArea: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "11px",
    marginTop: "28px",
    paddingTop: "24px",
    borderTop: "1px solid #edf0f4"
  },

  guideRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },

  guideText: {
    color: "#7b8492",
    fontSize: "13px"
  },

  primaryLink: {
    padding: 0,
    color: "#1769e0",
    background: "none",
    border: 0,
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer"
  },

  secondaryLink: {
    padding: 0,
    color: "#586273",
    background: "none",
    border: 0,
    fontSize: "13px",
    fontWeight: "650",
    cursor: "pointer"
  }
};

export default MemberLogin;