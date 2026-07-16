import { useNavigate, useLocation } from "react-router-dom";

// 컴포넌트에서 Spring Boot에서 넘어오는 pageObject를 수집
const PageNation = ({pageObject}) => {

  const navigate = useNavigate();
  const location = useLocation(); // 🔑 [핵심] 현재 주소창의 진짜 경로(예: /community/list 또는 /quiz/list)를 읽어옵니다.

  // 데이터 처리
  console.log("pageObject=",JSON.stringify(pageObject));

  const liTag = [];

  // 페이지 네이션의 페이지를 클릭하면 동작시키는 함수 작성
  const handleClick = (event, page) => {
    event.preventDefault(); // 기본 처리를 무시시킨다. 페이지 이동 무시
    // 넘어온 페이지 확인
    console.log("page=",page);

    // 🔑 [해결 완료] navigate 앞의 주소 부분을 고정된 "/board/list" 대신
    // 현재 주소인 location.pathname으로 동적 처리하여 어느 게시판이든 알아서 해당 경로를 쫓아가게 만듭니다!
    navigate(location.pathname + "?page=" + page
      + "&perPageNum=" + pageObject.perPageNum
      + "&key=" + pageObject.key
      + "&word=" + pageObject.word
    );
  }

  // 맨 앞 페이지(1페이지) 이동 코드 작성
  liTag.push(
      <li key="first" className={(pageObject.page==1)?"page-item disabled":"page-item"}>
        <a className="page-link" href="#" onClick={(event)=>handleClick(event, 1)}>&lt;&lt;</a>
      </li>
  );
  // 시작페이지의 이전 페이지
  liTag.push(
      <li key="prev" className={(pageObject.startPage==1)?"page-item disabled":"page-item"}>
        <a className="page-link" href="#"
         onClick={(event)=>handleClick(event, pageObject.startPage - 1)}>&lt;</a>
      </li>
  );

  // 페이지 클릭 버튼
  for(let i=pageObject.startPage; i <= pageObject.endPage; i++){
    liTag.push(
      <li key={i} className={(pageObject.page == i)?"page-item active disabled":"page-item"}> {/* active 스타일 지원 추가 */}
        <a className="page-link" href="#"
         onClick={(event)=>handleClick(event,i)}>{i}</a>
      </li>
    );
  }

  // 끝 페이지의 다음 페이지
  liTag.push(
      <li key="next" className={(pageObject.totalPage > pageObject.endPage)?"page-item":"page-item disabled"}>
        <a className="page-link" href="#"
         onClick={(event)=>handleClick(event,pageObject.endPage + 1)}>&gt;</a>
      </li>
  );

  // 마지막 페이지 가기
  liTag.push(
      <li key="last" className={(pageObject.totalPage > pageObject.page)?"page-item":"page-item disabled"}>
        <a className="page-link" href="#"
          onClick={(event)=>handleClick(event,pageObject.totalPage)}>&gt;&gt;</a>
      </li>
  );

  // 데이터 표시
  return (
    // justify-content-center로 페이지네이션 버튼들이 가운데로 정렬되게 클래스만 깔끔하게 보강했습니다!
    <div className="d-flex justify-content-center mt-4">
      <ul className="pagination mb-0">
        {liTag}
      </ul>
    </div>
  )
}

export default PageNation;