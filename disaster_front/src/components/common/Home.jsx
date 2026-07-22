import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import axios from "axios";

import {
    AlertTriangle,
    BookOpen,
    Bookmark,
    Car,
    ChevronRight,
    CircleHelp,
    ClipboardCheck,
    CloudLightning,
    Flame,
    Headphones,
    MapPin,
    Megaphone,
    Phone,
    Puzzle,
    Radiation,
    ShieldCheck,
    Thermometer,
    Trees,
    UserCog,
    Waves,
    Wind
} from "lucide-react";

import apiClient from "../../api/apiClient";
import "./Home.css";

const getArrayContent = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.content ?? [];
};

const getDateTime = (value) => {
    if (!value) {
        return 0;
    }

    const time = new Date(value).getTime();

    return Number.isNaN(time)
        ? 0
        : time;
};

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    );
};

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString(
        "ko-KR",
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
};

const getCategoryIcon = (
    categoryName = ""
) => {
    if (
        categoryName.includes("화재")
        || categoryName.includes("폭발")
    ) {
        return Flame;
    }

    if (
        categoryName.includes("지진")
        || categoryName.includes("해일")
    ) {
        return Waves;
    }

    if (
        categoryName.includes("태풍")
        || categoryName.includes("호우")
        || categoryName.includes("홍수")
    ) {
        return CloudLightning;
    }

    if (
        categoryName.includes("폭염")
        || categoryName.includes("한파")
    ) {
        return Thermometer;
    }

    if (
        categoryName.includes("산사태")
        || categoryName.includes("붕괴")
    ) {
        return Trees;
    }

    if (
        categoryName.includes("교통")
        || categoryName.includes("사고")
    ) {
        return Car;
    }

    if (
        categoryName.includes("감염병")
    ) {
        return Radiation;
    }

    if (
        categoryName.includes("미세먼지")
    ) {
        return Wind;
    }

    if (
        categoryName.includes("대피")
        || categoryName.includes("응급")
    ) {
        return ShieldCheck;
    }

    return CircleHelp;
};

function Home() {
    const navigate = useNavigate();

    const [categories, setCategories] =
        useState([]);

    const [disasters, setDisasters] =
        useState([]);

    const [
        communityPosts,
        setCommunityPosts
    ] = useState([]);

    const [
        educationGuides,
        setEducationGuides
    ] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [
        loadMessage,
        setLoadMessage
    ] = useState("");

    const loginData =
        localStorage.getItem("login");

    const token =
        localStorage.getItem("token");

    const isLogin =
        Boolean(loginData || token);

    const quickMenus = [
        {
            title: "재난정보",
            description: "재난 유형별 정보 확인",
            path: "/disasterCategory/list",
            icon: AlertTriangle,
            className: "red"
        },
        {
            title: "제보게시판",
            description: "주변 재난 상황 공유",
            path: "/community/list",
            icon: Megaphone,
            className: "orange"
        },
        {
            title: "스크랩",
            description: "저장한 재난정보 확인",
            path: "/disasterScrap/list",
            icon: Bookmark,
            className: "yellow",
            loginRequired: true
        },
        {
            title: "안전퀴즈",
            description: "재난안전 지식 점검",
            path: "/quiz/list",
            icon: Puzzle,
            className: "green"
        },
        {
            title: "교육가이드",
            description: "재난 행동요령 학습",
            path: "/edu",
            icon: BookOpen,
            className: "blue"
        },
        {
            title: "체크리스트",
            description: "비상 물품 준비 점검",
            path: "/checklists",
            icon: ClipboardCheck,
            className: "purple"
        },
        {
            title: "문의게시판",
            description: "서비스 문의 및 답변",
            path: "/qna",
            icon: Headphones,
            className: "navy"
        }
    ];

    const bottomServices = [
        {
            title: "비상 물품 체크리스트",
            description:
                "재난에 대비해 필요한 물품을 미리 준비하세요.",
            path: "/checklists",
            icon: ClipboardCheck
        },
        {
            title: "재난안전 퀴즈",
            description:
                "퀴즈를 통해 안전 지식을 점검해 보세요.",
            path: "/quiz/list",
            icon: Puzzle
        },
        {
            title: "문의 및 고객지원",
            description:
                "서비스 이용 중 궁금한 내용을 문의하세요.",
            path: "/qna",
            icon: Headphones
        },
        {
            title: "회원정보 관리",
            description:
                "내 정보와 비밀번호를 안전하게 관리하세요.",
            path: "/member/mypage",
            icon: UserCog,
            loginRequired: true
        }
    ];

    useEffect(() => {
        let active = true;

        const loadHomeData = async () => {
            setLoading(true);
            setLoadMessage("");

            try {
                const [
                    categoryResult,
                    communityResult,
                    educationResult
                ] = await Promise.allSettled([
                    axios.get(
                        "http://localhost/disasterCategory/list.do",
                        {
                            withCredentials: true
                        }
                    ),

                    axios.get(
                        "http://localhost/community/list.do",
                        {
                            params: {
                                page: 1,
                                perPageNum: 5,
                                key: "",
                                word: ""
                            }
                        }
                    ),

                    apiClient.get(
                        "/api/edu",
                        {
                            params: {
                                page: 1,
                                size: 6
                            }
                        }
                    )
                ]);

                if (!active) {
                    return;
                }

                let loadedCategories = [];

                if (
                    categoryResult.status
                    === "fulfilled"
                ) {
                    loadedCategories =
                        Array.isArray(
                            categoryResult.value.data
                        )
                            ? categoryResult.value.data
                            : [];

                    setCategories(
                        loadedCategories
                    );
                }

                if (
                    communityResult.status
                    === "fulfilled"
                ) {
                    const communityData =
                        communityResult.value.data;

                    const postList =
                        Array.isArray(
                            communityData?.list
                        )
                            ? communityData.list
                            : [];

                    setCommunityPosts(
                        postList.slice(0, 5)
                    );
                }

                if (
                    educationResult.status
                    === "fulfilled"
                ) {
                    const guideList =
                        getArrayContent(
                            educationResult.value.data
                        );

                    const publicGuideList =
                        guideList.filter(
                            (guide) =>
                                guide.status
                                !== "DRAFT"
                        );

                    setEducationGuides(
                        publicGuideList.slice(0, 5)
                    );
                }

                if (
                    loadedCategories.length > 0
                ) {
                    const disasterRequests =
                        loadedCategories.map(
                            (category) =>
                                axios.get(
                                    `http://localhost/disasterInfo/category/${category.catid}/paged`,
                                    {
                                        params: {
                                            page: 0,
                                            size: 3
                                        },

                                        withCredentials: true
                                    }
                                )
                        );

                    const disasterResults =
                        await Promise.allSettled(
                            disasterRequests
                        );

                    if (!active) {
                        return;
                    }

                    const mergedDisasters =
                        disasterResults
                            .flatMap((result) => {
                                if (
                                    result.status
                                    !== "fulfilled"
                                ) {
                                    return [];
                                }

                                return getArrayContent(
                                    result.value.data
                                );
                            })
                            .filter(
                                (item) =>
                                    item
                                    && item.id != null
                            );

                    const uniqueDisasters =
                        Array.from(
                            new Map(
                                mergedDisasters.map(
                                    (item) => [
                                        item.id,
                                        item
                                    ]
                                )
                            ).values()
                        );

                    uniqueDisasters.sort(
                        (first, second) =>
                            getDateTime(
                                second.disasterDate
                            )
                            - getDateTime(
                                first.disasterDate
                            )
                    );

                    setDisasters(
                        uniqueDisasters.slice(0, 5)
                    );
                }

                const hasRejectedRequest = [
                    categoryResult,
                    communityResult,
                    educationResult
                ].some(
                    (result) =>
                        result.status === "rejected"
                );

                if (hasRejectedRequest) {
                    setLoadMessage(
                        "일부 최신 정보를 불러오지 못했습니다."
                    );
                }

            } catch (error) {
                console.error(
                    "홈 화면 데이터 조회 실패:",
                    error
                );

                if (active) {
                    setLoadMessage(
                        "최신 정보를 불러오지 못했습니다."
                    );
                }

            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadHomeData();

        return () => {
            active = false;
        };
    }, []);

    const moveToMenu = (
        menu
    ) => {
        if (
            menu.loginRequired
            && !isLogin
        ) {
            alert(
                "로그인 후 이용할 수 있습니다."
            );

            navigate(
                "/member/login"
            );

            return;
        }

        navigate(
            menu.path
        );
    };

    return (
        <main className="safety-home">
            <section className="home-main-section">
                <div className="home-container">
                    {loadMessage && (
                        <div className="home-load-message">
                            {loadMessage}
                        </div>
                    )}

                    <div className="home-main-grid">
                        <section className="home-board-panel">
                            <div className="home-panel-header">
                                <div>
                                    <span className="home-panel-label">
                                        REAL-TIME
                                    </span>

                                    <h2>
                                        최신 재난정보
                                    </h2>
                                </div>

                                <Link
                                    to="/disasterCategory/list"
                                    className="home-more-link"
                                >
                                    전체보기

                                    <ChevronRight
                                        size={17}
                                    />
                                </Link>
                            </div>

                            <div className="home-disaster-list">
                                {loading ? (
                                    <div className="home-empty-state">
                                        최신 재난정보를 불러오는 중입니다.
                                    </div>
                                ) : disasters.length === 0 ? (
                                    <div className="home-empty-state">
                                        등록된 재난정보가 없습니다.
                                    </div>
                                ) : (
                                    disasters.map(
                                        (disaster) => (
                                            <Link
                                                key={disaster.id}
                                                className="home-disaster-item"
                                                to={`/disasterInfo/detail/${disaster.id}`}
                                            >
                                                <span className="home-disaster-badge">
                                                    {
                                                        disaster.catName
                                                        || "재난"
                                                    }
                                                </span>

                                                <div className="home-disaster-content">
                                                    <strong>
                                                        {
                                                            disaster.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        <MapPin
                                                            size={14}
                                                        />

                                                        {
                                                            disaster.location
                                                            || "위치 정보 없음"
                                                        }
                                                    </span>
                                                </div>

                                                <time>
                                                    {
                                                        formatDateTime(
                                                            disaster.disasterDate
                                                        )
                                                    }
                                                </time>
                                            </Link>
                                        )
                                    )
                                )}
                            </div>
                        </section>

                        <aside className="home-side-column">
                            <section className="home-contact-panel">
                                <div className="home-contact-heading">
                                    <div className="home-contact-icon">
                                        <Phone size={23} />
                                    </div>

                                    <div>
                                        <span>
                                            EMERGENCY
                                        </span>

                                        <h2>
                                            긴급 연락처
                                        </h2>
                                    </div>
                                </div>

                                <a
                                    className="home-contact-row"
                                    href="tel:119"
                                >
                                    <div>
                                        <strong>
                                            소방·구급
                                        </strong>

                                        <span>
                                            화재, 구조, 응급환자
                                        </span>
                                    </div>

                                    <b>
                                        119
                                    </b>
                                </a>

                                <a
                                    className="home-contact-row"
                                    href="tel:112"
                                >
                                    <div>
                                        <strong>
                                            경찰
                                        </strong>

                                        <span>
                                            범죄, 사고 신고
                                        </span>
                                    </div>

                                    <b>
                                        112
                                    </b>
                                </a>

                                <a
                                    className="home-contact-row"
                                    href="tel:1339"
                                >
                                    <div>
                                        <strong>
                                            질병관리청
                                        </strong>

                                        <span>
                                            감염병 및 의료 상담
                                        </span>
                                    </div>

                                    <b>
                                        1339
                                    </b>
                                </a>
                            </section>

                            <section className="home-support-panel">
                                <Headphones size={29} />

                                <div>
                                    <span>
                                        서비스 이용이 궁금한가요?
                                    </span>

                                    <strong>
                                        문의게시판에서 관리자 답변을 확인하세요.
                                    </strong>
                                </div>

                                <Link to="/qna">
                                    문의하기

                                    <ChevronRight
                                        size={17}
                                    />
                                </Link>
                            </section>
                        </aside>
                    </div>
                </div>
            </section>

            <section className="home-quick-section">
                <div className="home-container">
                    <div className="home-section-header">
                        <span>
                            QUICK MENU
                        </span>

                        <h2>
                            빠른 메뉴 서비스
                        </h2>

                        <p>
                            필요한 서비스를 선택해 바로 이동할 수 있습니다.
                        </p>
                    </div>

                    <div className="home-quick-grid">
                        {quickMenus.map((menu) => {
                            const Icon = menu.icon;

                            return (
                                <button
                                    key={menu.title}
                                    type="button"
                                    className="home-quick-menu"
                                    onClick={() =>
                                        moveToMenu(menu)
                                    }
                                >
                                    <span
                                        className={
                                            "home-quick-icon "
                                            + menu.className
                                        }
                                    >
                                        <Icon size={27} />
                                    </span>

                                    <strong>
                                        {menu.title}
                                    </strong>

                                    <small>
                                        {menu.description}
                                    </small>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="home-category-section">
                <div className="home-container">
                    <div className="home-section-header home-section-header-row">
                        <div>
                            <span>
                                SAFETY GUIDE
                            </span>

                            <h2>
                                재난 유형별 행동요령
                            </h2>

                            <p>
                                재난 유형을 선택해 관련 정보와 행동요령을 확인하세요.
                            </p>
                        </div>

                        <Link
                            to="/disasterCategory/list"
                            className="home-outline-link"
                        >
                            모든 재난 유형 보기

                            <ChevronRight
                                size={17}
                            />
                        </Link>
                    </div>

                    <div className="home-category-grid">
                        {loading ? (
                            <div className="home-category-message">
                                재난 유형을 불러오는 중입니다.
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="home-category-message">
                                등록된 재난 유형이 없습니다.
                            </div>
                        ) : (
                            categories.map(
                                (category) => {
                                    const CategoryIcon =
                                        getCategoryIcon(
                                            category.catName
                                        );

                                    return (
                                        <Link
                                            key={category.catid}
                                            className="home-category-card"
                                            to={`/disasterInfo/list/${category.catid}`}
                                        >
                                            <span className="home-category-icon">
                                                <CategoryIcon
                                                    size={28}
                                                />
                                            </span>

                                            <strong>
                                                {category.catName}
                                            </strong>

                                            <ChevronRight
                                                className="home-category-arrow"
                                                size={18}
                                            />
                                        </Link>
                                    );
                                }
                            )
                        )}
                    </div>
                </div>
            </section>

            <section className="home-recent-section">
                <div className="home-container">
                    <div className="home-recent-grid">
                        <section className="home-recent-panel">
                            <div className="home-panel-header">
                                <div>
                                    <span className="home-panel-label">
                                        COMMUNITY
                                    </span>

                                    <h2>
                                        최근 시민 제보
                                    </h2>
                                </div>

                                <Link
                                    to="/community/list"
                                    className="home-more-link"
                                >
                                    전체보기

                                    <ChevronRight
                                        size={17}
                                    />
                                </Link>
                            </div>

                            <div className="home-recent-list">
                                {loading ? (
                                    <div className="home-empty-state">
                                        제보 내용을 불러오는 중입니다.
                                    </div>
                                ) : communityPosts.length === 0 ? (
                                    <div className="home-empty-state">
                                        등록된 제보가 없습니다.
                                    </div>
                                ) : (
                                    communityPosts.map(
                                        (post) => (
                                            <Link
                                                key={post.no}
                                                className="home-recent-item"
                                                to={`/community/view?no=${post.no}&inc=1`}
                                            >
                                                <div className="home-recent-number">
                                                    {post.no}
                                                </div>

                                                <div className="home-recent-text">
                                                    <strong>
                                                        {post.title}
                                                    </strong>

                                                    <span>
                                                        {
                                                            post.writer
                                                            || "작성자"
                                                        }

                                                        {" · "}

                                                        {
                                                            formatDate(
                                                                post.writeDate
                                                            )
                                                        }
                                                    </span>
                                                </div>

                                                <ChevronRight
                                                    size={18}
                                                />
                                            </Link>
                                        )
                                    )
                                )}
                            </div>
                        </section>

                        <section className="home-recent-panel">
                            <div className="home-panel-header">
                                <div>
                                    <span className="home-panel-label">
                                        EDUCATION
                                    </span>

                                    <h2>
                                        최신 안전교육
                                    </h2>
                                </div>

                                <Link
                                    to="/edu"
                                    className="home-more-link"
                                >
                                    전체보기

                                    <ChevronRight
                                        size={17}
                                    />
                                </Link>
                            </div>

                            <div className="home-recent-list">
                                {loading ? (
                                    <div className="home-empty-state">
                                        교육 가이드를 불러오는 중입니다.
                                    </div>
                                ) : educationGuides.length === 0 ? (
                                    <div className="home-empty-state">
                                        공개된 교육 가이드가 없습니다.
                                    </div>
                                ) : (
                                    educationGuides.map(
                                        (guide) => (
                                            <Link
                                                key={guide.no}
                                                className="home-recent-item"
                                                to={`/edu/${guide.no}`}
                                            >
                                                <span className="home-guide-category">
                                                    {
                                                        guide.category
                                                        || "기타"
                                                    }
                                                </span>

                                                <div className="home-recent-text">
                                                    <strong>
                                                        {guide.title}
                                                    </strong>

                                                    <span>
                                                        {
                                                            guide.writer
                                                            || "작성자"
                                                        }

                                                        {" · "}

                                                        {
                                                            formatDate(
                                                                guide.regDate
                                                            )
                                                        }
                                                    </span>
                                                </div>

                                                <ChevronRight
                                                    size={18}
                                                />
                                            </Link>
                                        )
                                    )
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </section>

            <section className="home-onestop-section">
                <div className="home-container">
                    <div className="home-section-header">
                        <span>
                            ONE-STOP SERVICE
                        </span>

                        <h2>
                            안전 서비스 한눈에 보기
                        </h2>
                    </div>

                    <div className="home-onestop-grid">
                        {bottomServices.map(
                            (service) => {
                                const Icon =
                                    service.icon;

                                return (
                                    <button
                                        key={service.title}
                                        type="button"
                                        className="home-onestop-card"
                                        onClick={() =>
                                            moveToMenu(
                                                service
                                            )
                                        }
                                    >
                                        <span>
                                            <Icon
                                                size={23}
                                            />
                                        </span>

                                        <div>
                                            <strong>
                                                {
                                                    service.title
                                                }
                                            </strong>

                                            <small>
                                                {
                                                    service.description
                                                }
                                            </small>
                                        </div>

                                        <ChevronRight
                                            size={19}
                                        />
                                    </button>
                                );
                            }
                        )}
                    </div>
                </div>
            </section>

            <footer className="home-footer">
                <div className="home-footer-links">
                    <div className="home-container">
                        <Link to="/qna">
                            개인정보처리방침
                        </Link>

                        <Link to="/edu">
                            이용안내
                        </Link>

                        <Link to="/checklists">
                            안전점검
                        </Link>

                        <Link to="/community/list">
                            재난 제보
                        </Link>

                        <Link to="/qna">
                            Q&amp;A
                        </Link>
                    </div>
                </div>

                <div className="home-footer-main">
                    <div className="home-container">
                        <div className="home-footer-brand">
                            <div className="home-footer-logo">
                                <ShieldCheck
                                    size={31}
                                />

                                <strong>
                                    안전온
                                </strong>
                            </div>

                            <p>
                                재난정보와 행동요령, 안전교육을 제공하는 재난안전 통합 서비스입니다.
                            </p>

                            <p>
                                문의사항은 문의게시판을 이용해 주세요.
                            </p>
                        </div>

                        <div className="home-footer-copyright">
                            <span>
                                안전온
                            </span>

                            <p>
                                © 2026 Safety On. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}

export default Home;