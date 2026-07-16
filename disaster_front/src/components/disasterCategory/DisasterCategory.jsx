import { useEffect, useState } from 'react';
import axios from 'axios';
import './DisasterCategory.css';

const DisasterCategory = () => {
    const [list, setList] = useState([]); // 데이터를 담을 상태

    useEffect(() => {
        // 백엔드 컨트롤러 주소 (컨트롤러에 @CrossOrigin 설정 필수)
        axios.get('http://localhost:8080/disaster/list') 
            .then(res => {
                setList(res.data);
            })
            .catch(err => {
                console.error("데이터 로딩 실패:", err);
            });
    }, []);

    // 💡 DB 데이터의 catID에 따라 아이콘을 매핑합니다.
    const getIconClass = (catID) => {
        const icons = { 1: 'bi-fire', 2: 'bi-house-slash', 3: 'bi-cloud-lightning-rain', 
                        4: 'bi-thermometer-sun', 5: 'bi-tree', 6: 'bi-car-front-fill', 
                        7: 'bi-virus', 8: 'bi-hospital' };
        return icons[catID] || 'bi-grid-fill';
    };

    return (
        <div className="container mt-5">
            <div className="header-section">
                <h2 className="display-6 fw-bold">재난 정보 카테고리</h2>
                <p className="text-muted">원하는 카테고리를 선택하여 실시간 분석 데이터를 확인하세요.</p>
            </div>
        
            <div className="disaster-grid">
                {list.length > 0 ? (
                    list.map((vo) => (
                        <a key={vo.catID} href={`/disasterList/list.do?catID=${vo.catID}`} className="disaster-card">
                            <div className="icon-box">
                                <i className={`bi ${getIconClass(vo.catID)}`}></i>
                            </div>
                            <h3>{vo.categoryName}</h3>
                            <span className="card-tag">#재난 리스트</span>
                        </a>
                    ))
                ) : (
                    <p>현재 표시할 카테고리 정보가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default DisasterCategory;