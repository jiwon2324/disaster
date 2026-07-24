import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost";

function MemberWithdraw() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [member, setMember] =
      useState(null);

  const [currentPw, setCurrentPw] =
      useState("");

  const [agreed, setAgreed] =
      useState(false);

  const [loading, setLoading] =
      useState(true);

  const [withdrawing, setWithdrawing] =
      useState(false);

  const [errorMessage, setErrorMessage] =
      useState("");

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

      const memberData = response.data;

      if (
          Number(memberData?.gradeNo) === 9
      ) {
        alert(
            "관리자 계정은 회원 탈퇴할 수 없습니다."
        );

        navigate("/member/mypage");
        return;
      }

      setMember(memberData);
    } catch (error) {
      console.error(
          "회원정보 조회 실패:",
          error
      );

      setErrorMessage(
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "회원정보를 불러오지 못했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (
      event
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (!currentPw.trim()) {
      setErrorMessage(
          "현재 비밀번호를 입력해주세요."
      );
      return;
    }

    if (!agreed) {
      setErrorMessage(
          "회원 탈퇴 안내사항을 확인해주세요."
      );
      return;
    }

    const confirmed =
        window.confirm(
            "정말 회원 탈퇴하시겠습니까?\n탈퇴 후에는 현재 계정으로 로그인할 수 없습니다."
        );

    if (!confirmed) {
      return;
    }

    try {
      setWithdrawing(true);

      const response = await axios.put(
          `${API_BASE_URL}/member/withdraw.do`,
          {
            currentPw:
                currentPw.trim()
          },
          {
            headers: {
              "X-AUTH-TOKEN": token
            }
          }
      );

      alert(
          response.data?.message ||
          "회원 탈퇴가 완료되었습니다."
      );

      localStorage.removeItem("token");
      localStorage.removeItem("login");

      window.location.href = "/";
    } catch (error) {
      console.error(
          "회원 탈퇴 실패:",
          error
      );

      setErrorMessage(
          error.response?.data?.message ||
          error.response?.data?.msg ||
          "회원 탈퇴를 처리하지 못했습니다."
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
        <main style={styles.messagePage}>
          회원정보를 불러오는 중입니다.
        </main>
    );
  }

  if (!member) {
    return (
        <main style={styles.messagePage}>
          <div className="alert alert-warning">
            {errorMessage ||
                "회원정보를 확인할 수 없습니다."}
          </div>
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
              회원 탈퇴
            </h1>

            <p style={styles.description}>
              탈퇴 전 안내사항을 확인해주세요.
            </p>
          </header>

          <section style={styles.card}>
            <div style={styles.warningBox}>
              <h2 style={styles.warningTitle}>
                탈퇴하기 전에 확인해주세요
              </h2>

              <p style={styles.warningText}>
                회원 탈퇴 후에는 현재
                아이디로 로그인할 수
                없습니다.
              </p>

              <p style={styles.warningText}>
                회원정보는 삭제되지 않고
                회원 상태가 탈퇴로
                변경됩니다.
              </p>

              <p style={styles.warningText}>
                작성한 문의와 게시글은
                서비스 정책에 따라 남아
                있을 수 있습니다.
              </p>
            </div>

            {errorMessage && (
                <div className="alert alert-danger">
                  {errorMessage}
                </div>
            )}

            <form
                onSubmit={handleWithdraw}
            >
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>
                  아이디
                </div>

                <div style={styles.infoValue}>
                  {member.id || "-"}
                </div>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>
                  이메일
                </div>

                <div style={styles.infoValue}>
                  {member.email || "-"}
                </div>
              </div>

              <div className="mt-4">
                <label
                    htmlFor="currentPw"
                    className="form-label fw-semibold"
                >
                  현재 비밀번호
                </label>

                <input
                    type="password"
                    id="currentPw"
                    className="form-control"
                    placeholder="현재 비밀번호를 입력해주세요."
                    value={currentPw}
                    onChange={(event) =>
                        setCurrentPw(
                            event.target.value
                        )
                    }
                    style={styles.input}
                    autoComplete="current-password"
                />
              </div>

              <div
                  className="form-check"
                  style={styles.checkArea}
              >
                <input
                    type="checkbox"
                    id="withdrawAgree"
                    className="form-check-input"
                    checked={agreed}
                    onChange={(event) =>
                        setAgreed(
                            event.target.checked
                        )
                    }
                />

                <label
                    htmlFor="withdrawAgree"
                    className="form-check-label"
                >
                  회원 탈퇴 안내사항을 모두
                  확인했습니다.
                </label>
              </div>

              <div style={styles.buttonArea}>
                <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() =>
                        navigate(
                            "/member/mypage"
                        )
                    }
                    disabled={withdrawing}
                >
                  취소
                </button>

                <button
                    type="submit"
                    className="btn btn-danger px-4"
                    disabled={
                        withdrawing ||
                        !agreed
                    }
                >
                  {withdrawing
                      ? "탈퇴 처리 중..."
                      : "회원 탈퇴"}
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
    maxWidth: "760px"
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

  warningBox: {
    marginBottom: "28px",
    padding: "22px",
    backgroundColor: "#fff5f5",
    border: "1px solid #ffd8d8",
    borderRadius: "10px"
  },

  warningTitle: {
    marginBottom: "13px",
    color: "#c92a2a",
    fontSize: "18px",
    fontWeight: "800"
  },

  warningText: {
    margin: "5px 0",
    color: "#6d4c4c",
    fontSize: "14px",
    lineHeight: "1.6"
  },

  infoRow: {
    display: "grid",
    gridTemplateColumns: "130px 1fr",
    padding: "17px 8px",
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

  input: {
    minHeight: "50px"
  },

  checkArea: {
    marginTop: "22px",
    padding: "15px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px"
  },

  buttonArea: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "28px"
  },

  messagePage: {
    maxWidth: "800px",
    margin: "120px auto",
    padding: "20px",
    textAlign: "center"
  }
};

export default MemberWithdraw;