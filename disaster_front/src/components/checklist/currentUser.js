const TEST_USER_ID = "test_user";

export const getCurrentUser = () => {
  try {
    const loginData = localStorage.getItem("login");

    return loginData ? JSON.parse(loginData) : null;
  } catch (error) {
    console.error("login 정보 파싱 오류:", error);
    return null;
  }
};

export const isLoggedIn = () => Boolean(localStorage.getItem("token"));

export const getCurrentUserId = () => {
  const login = getCurrentUser();

  // 로그인 기능이 완성되기 전 개발 테스트용 fallback입니다.
  // 실제 로그인 연동 완료 후에는 TEST_USER_ID fallback을 제거하면 됩니다.
  return login?.id || login?.username || login?.userId || TEST_USER_ID;
};

const toRoleText = (role) => {
  if (!role) {
    return "";
  }

  if (typeof role === "string") {
    return role.trim().toUpperCase();
  }

  return String(
    role.role ||
    role.authority ||
    role.auth ||
    role.name ||
    role.gradeName ||
    ""
  ).trim().toUpperCase();
};

const collectRoleValues = (login) => {
  if (!login) {
    return [];
  }

  const values = [
    login.roles,
    login.role,
    login.authorities,
    login.authority,
    login.auth,
    login.grade,
    login.gradeName,
    login.status,
  ];

  return values.flatMap((value) => {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  });
};

export const isAdmin = () => {
  const login = getCurrentUser();
  const roleTexts = collectRoleValues(login).map(toRoleText);

  if (roleTexts.some((role) => role === "ADMIN" || role === "ROLE_ADMIN")) {
    return true;
  }

  // 현재 회원 가입 화면은 관리자 체크박스 값을 "admin"으로 사용합니다.
  // JWT roles가 정상 반영되면 위 ROLE_ADMIN/ADMIN 조건에서 처리됩니다.
  return String(login?.id || "").trim().toLowerCase() === "admin";
};

export const getCurrentChecklistUserId = getCurrentUserId;
