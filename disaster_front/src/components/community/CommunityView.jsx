import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import CommunityDelete from "./CommunityDelete";

function CommunityView(){
  const [searchParams] = useSearchParams();
  const no = searchParams.get('no');
  const inc = searchParams.get('inc');

  const [vo, setVo] = useState({});
  const [showDelete, setShowDelete] = useState(false);
  const navigate = useNavigate();

  const loginInfoStr = localStorage.getItem("login");
  const loginInfo = loginInfoStr ? JSON.parse(loginInfoStr) : null;

  useEffect(()=>{
    axios.get(`http://localhost/community/view.do?no=${no}&inc=${inc}`)
    .then((response) => {
      setVo(response.data);
    }).catch((error)=> {
      console.error('상세보기 조회 에러: ', error);
      alert('데이터를 불러오는 과정에서 에러가 발생했습니다.');
    })
  }, [no, inc]);

  const handleDeleteClick = async () => {
    const isAdmin = loginInfo && (
      loginInfo.sub === "admin" || 
      loginInfo.sub === "admin01" || 
      loginInfo.name === "관리자"
    );

    if (isAdmin) {
      if (window.confirm("관리자 권한으로 이 제보글을 즉시 삭제하시겠습니까?")) {
        try {
          const adminVo = {
            no: no,
            pw: "admin_master_pass", 
            writer: loginInfo.sub
          };
          const response = await axios.post("http://localhost/community/delete.do", adminVo);
          alert(response.data);
          navigate("/community/list");
        } catch (error) {
          alert(error.response?.data || '관리자 삭제 중 오류가 발생되었습니다.');
        }
      }
    } else {
      setShowDelete(!showDelete);
    }
  };

  const isAuthor = loginInfo && (
    loginInfo.sub === vo.writer || 
    loginInfo.sub === "admin" || 
    loginInfo.sub === "admin01" || 
    loginInfo.name === "관리자"
  );

  return(
    <>
      <div className="mb-4 p-2 bg-light rounded shadow-sm small text-muted">
        <i className="bi bi-house-door-fill me-1"></i> Home &gt; Community &gt; <span className="text-primary fw-bold">View</span>
      </div>

      {/* 데이터를 표시하는 틀을 테이블에서 깔끔한 카드 바디로 변경 */}
      <div className="mb-4">
        {!vo.no ? (
          <div className="text-center py-5 text-muted card border-light">데이터가 존재하지 않거나 불러오는 중입니다.</div>
        ) : (
          <div className="card border-light shadow-sm">
            <div className="card-body p-0">
              {/* 제목 및 메타 정보 영역 */}
              <div className="p-4 border-bottom border-light bg-light rounded-top">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary rounded-pill">No. {vo.no}</span>
                  <span className="text-muted small">
                    <i className="bi bi-eye me-1"></i> {vo.hit} &nbsp; | &nbsp;
                    <i className="bi bi-calendar-check me-1"></i> {vo.writeDate ? format(new Date(vo.writeDate), "yyyy-MM-dd HH:mm") : ""}
                  </span>
                </div>
                <h3 className="card-title fw-bold text-dark mb-0">{vo.title}</h3>
                <div className="mt-3 text-secondary small">
                   <i className="bi bi-person-circle me-1"></i> 작성자: <span className="text-dark fw-bold">{vo.writer}</span>
                </div>
              </div>

              {/* 이미지 영역 */}
              {vo.fileName && (
                <div className="text-center p-4 border-bottom border-light bg-white">
                  <img src={`http://localhost/image/${vo.fileName}`} alt="제보사진" 
                    className="img-fluid rounded shadow-sm border"
                    style={{maxWidth:"100%", maxHeight:"500px"}} />
                </div>
              )}

              {/* 내용 영역 */}
              <div className="p-4 bg-white rounded-bottom">
                <h5 className="text-muted mb-3"><i className="bi bi-chat-left-text me-2"></i>제보 내용</h5>
                <div className="p-3 bg-light rounded" style={{minHeight: '200px'}}>
                    <pre className="mb-0 text-dark" style={{whiteSpace: 'pre-wrap', fontfamily: 'inherit'}}>{vo.content}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 및 삭제 컴포넌트 영역 정렬 개선 */}
      <div className="d-flex justify-content-end align-items-center gap-2 mb-4 border-top pt-3">
        {isAuthor && (
          <>
            <button 
              // 버튼 디자인 변경: btn-primary -> btn-outline-warning (수정 느낌)
              className="btn btn-outline-warning px-4 rounded-pill" 
              onClick={() => {
                const isAdmin = loginInfo && (loginInfo.sub === "admin" || loginInfo.sub === "admin01" || loginInfo.name === "관리자");
                navigate(`/community/update?no=${no}`, { state: { isAdmin } });
              }}
            >
              <i className="bi bi-pencil me-1"></i>수정
            </button>

            <button 
                // 버튼 디자인 변경: btn-danger -> btn-outline-danger
                className="btn btn-outline-danger px-4 rounded-pill" 
                onClick={handleDeleteClick}>
                <i className="bi bi-trash me-1"></i>삭제
            </button>
          </>
        )}

        <Link to={"/community/list"} className="btn btn-secondary px-4 rounded-pill">
            <i className="bi bi-list-ul me-1"></i>리스트
        </Link>
      </div>
      
      {/* 삭제 폼 디자인은 CommunityDelete 컴포넌트 내부에서 변경됨 */}
      { showDelete && <CommunityDelete no={vo.no} writer={vo.writer} handleCancel={handleDeleteClick} />}
    </>
  );
}

export default CommunityView;