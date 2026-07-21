import { useState } from "react";
import { Link, NavLink } from "react-router-dom"

function TopNavi(){

  const [token, setToken] = useState(localStorage.getItem("token"));

  // JWT ?대? ?뺣낫
  const [login, setLogin] = useState(() => {
    const data = localStorage.getItem("login"); // 臾몄옄?댁씠誘濡?
    return data ? JSON.parse(data) : null; // JSON ?곗씠?곕줈 留뚮뱾??以??
  });
 
  console.log("TopNavi login = " + login);
  console.log(login?"TopNavi login.name = " + login.name:'?놁쓬');

  // 濡쒓렇?꾩썐 泥섎━
  const logout = (e) => {
    e.preventDefault();

    // react?먯꽌留?token怨??ъ슜???뺣낫瑜?吏?대떎.
    localStorage.removeItem("token");
    localStorage.removeItem("login");

    setToken(null);
    setLogin(null);

    alert("濡쒓렇?꾩썐 ?섏뿀?듬땲??");
    // Navigate("/");
    location.href = "/";
}

  return(
    <nav className="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mynavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mynavbar">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to={"/"} className="nav-link">Home</NavLink>&nbsp;
            </li>
            <li className="nav-item">
              <NavLink to={"/image/list"} className="nav-link">Image</NavLink>&nbsp;
            </li>
            <li className="nav-item">
              <NavLink to={"/board/list"} className="nav-link">Board</NavLink>&nbsp;
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/community/list">제보게시판</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/quiz/list">퀴즈</NavLink>
            </li>
            <li className="nav-item">

              <NavLink to={"/disasterCategory/list"} className="nav-link">재난 정보</NavLink>&nbsp;
            </li>
            <li className="nav-item">
              <NavLink to={"/disasterScrap/list"} className="nav-link">스크랩</NavLink>&nbsp;

              <NavLink to={"/edu"} className="nav-link">교육가이드</NavLink>&nbsp;
            </li>
            <li className="nav-item">
              <NavLink to={"/checklists"} className="nav-link">체크리스트</NavLink>&nbsp;

            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
              {!token && (
                  <>
                      <li className="nav-item">
                          <Link className="nav-link" to="/member/login">
                              Login
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link className="nav-link" to="/member/write">
                              Join
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link className="nav-link" to="/member/find-id">
                              ?꾩씠?붿갼湲?
                          </Link>
                      </li>
                  </>
              )}

              {token && (
                  <>
                      <li className="nav-item">
                          <Link className="nav-link" to="/member/logout" onClick={logout}>
                              Logout
                          </Link>
                      </li>

                      <li className="nav-item">
                          <Link className="nav-link" to="/member/view">
                              {login.name}
                          </Link>
                      </li>

                  </>
              )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default TopNavi;
