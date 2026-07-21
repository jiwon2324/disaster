import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Flame, Waves, CloudLightning, Thermometer, Trees, Car, Radiation, ShieldCheck, HelpCircle, Wind, Plus, Edit, Trash2, X } from 'lucide-react';
import './DisasterCategory.css';

const getCategoryIcon = (catName = '') => {
  if (catName.includes('화재') || catName.includes('폭발') || catName.includes('피해')) return <Flame size={22} />;
  if (catName.includes('지진') || catName.includes('해일')) return <Waves size={22} />;
  if (catName.includes('태풍') || catName.includes('호우')) return <CloudLightning size={22} />;
  if (catName.includes('폭염') || catName.includes('한파')) return <Thermometer size={22} />;
  if (catName.includes('산사태') || catName.includes('붕괴')) return <Trees size={22} />;
  if (catName.includes('교통') || catName.includes('사고')) return <Car size={22} />;
  if (catName.includes('감염병')) return <Radiation size={22} />;
  if (catName.includes('대피소')) return <ShieldCheck size={22} />;
  if (catName.includes('미세먼지')) return <Wind size={22} />;
  return <HelpCircle size={22} />;
};

export default function DisasterCategory({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkIsAdmin = () => {
    const loginData = localStorage.getItem("login");
    if (!loginData) return false;
    try {
      const parsed = JSON.parse(loginData);
      const role = parsed.role || parsed.roles || parsed.grade || "";
      const name = parsed.name || parsed.username || "";
      return (
        role === "ROLE_ADMIN" || 
        role === "ADMIN" || 
        role === "관리자" || 
        name === "관리자" || 
        parsed.isAdmin === true
      );
    } catch {
      return false;
    }
  };

  const isAdmin = checkIsAdmin();

  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCatId, setCurrentCatId] = useState(null);
  const [catNameInput, setCatNameInput] = useState('');

  const navigate = useNavigate();

  const fetchCategories = () => {
    axios.get('http://localhost/disasterCategory/list.do', { withCredentials: true })
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('카테고리 불러오기 실패:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCardClick = (catid, catName) => {
    setSelectedCatId(catid);
    if (onSelectCategory) {
      onSelectCategory(catid, catName);
    } else {
      navigate(`/disasterInfo/list/${catid}`);
    }
  };

  const handleOpenAddModal = (e) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("관리자 권한이 필요합니다.");
      return;
    }
    setIsEditMode(false);
    setCurrentCatId(null);
    setCatNameInput('');
    setShowModal(true);
  };

  const handleOpenEditModal = (e, catid) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("관리자 권한이 필요합니다.");
      return;
    }
    setIsEditMode(true);
    setCurrentCatId(catid);

    axios.get(`http://localhost/disasterCategory/get.do?catid=${catid}`, { withCredentials: true })
      .then((res) => {
        setCatNameInput(res.data.catName);
        setShowModal(true);
      })
      .catch((err) => {
        console.error('카테고리 단건 조회 실패:', err);
        alert('카테고리 정보를 불러오지 못했습니다.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("관리자만 이용 가능한 기능입니다.");
      return;
    }
    if (!catNameInput.trim()) {
      alert('카테고리명을 입력해주세요.');
      return;
    }

    if (isEditMode) {
      axios.post('http://localhost/disasterCategory/update.do', {
        catid: currentCatId,
        catName: catNameInput
      }, { withCredentials: true })
        .then(() => {
          alert('카테고리가 정상적으로 수정되었습니다.');
          setShowModal(false);
          fetchCategories();
        })
        .catch((err) => {
          console.error('카테고리 수정 실패:', err);
          alert(err.response?.data || '수정에 실패했습니다.');
        });
    } else {
      axios.post('http://localhost/disasterCategory/add.do', {
        catName: catNameInput
      }, { withCredentials: true })
        .then(() => {
          alert('카테고리가 정상적으로 추가되었습니다.');
          setShowModal(false);
          fetchCategories();
        })
        .catch((err) => {
          console.error('카테고리 추가 실패:', err);
          alert(err.response?.data || '추가에 실패했습니다.');
        });
    }
  };

  const handleDelete = (e, catid, catName) => {
    e.stopPropagation();
    if (!isAdmin) {
      alert("관리자만 삭제할 수 있습니다.");
      return;
    }
    if (!window.confirm(`"${catName}" 카테고리를 정말 삭제하시겠습니까?`)) return;

    axios.post(`http://localhost/disasterCategory/delete.do?catid=${catid}`, null, { withCredentials: true })
      .then(() => {
        alert('카테고리가 정상적으로 삭제되었습니다.');
        fetchCategories();
      })
      .catch((err) => {
        console.error('카테고리 삭제 실패:', err);
        alert(err.response?.data || '삭제에 실패했습니다.');
      });
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm border-light">
        {/* Header */}
        <div className="card-header bg-white border-0 pt-4 pb-0 text-center">
          <div className="d-flex justify-content-between align-items-center position-relative px-3">
            <div className="w-100 text-center">
              <h2 className="fw-bold text-primary mb-1">
                <i className="bi bi-grid-fill me-2"></i>재난 정보 카테고리
              </h2>
              <p className="text-muted small mb-0">
                {isAdmin ? '시스템에 등록된 재난 카테고리를 추가, 수정, 삭제합니다.' : '원하는 카테고리를 선택하여 실시간 데이터를 확인하세요.'}
              </p>
            </div>
            {isAdmin && (
              <button 
                onClick={handleOpenAddModal}
                className="btn btn-primary btn-sm position-absolute end-0 me-3 fw-bold d-flex align-items-center gap-1"
              >
                <Plus size={16} /> 카테고리 추가
              </button>
            )}
          </div>
          <hr className="text-secondary opacity-25 mt-3 mb-0" />
        </div>

        {/* Body */}
        <div className="card-body p-4">
          {loading ? (
            <div className="text-center py-5 text-muted">카테고리를 불러오는 중입니다...</div>
          ) : (
            <div className="category-grid">
              {categories.map((cat) => (
                <div
                  key={cat.catid}
                  className={`category-card ${selectedCatId === cat.catid ? 'active' : ''}`}
                  onClick={() => handleCardClick(cat.catid, cat.catName)}
                >
                  <div className="icon-box">
                    {getCategoryIcon(cat.catName)}
                  </div>
                  <div className="card-name">{cat.catName}</div>
                  <span className="card-tag">
                    {isAdmin ? `ID: ${cat.catid}` : '#재난 리스트'}
                  </span>

                  {isAdmin && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                      <button 
                        onClick={(e) => handleOpenEditModal(e, cat.catid)} 
                        style={{ flex: 1, padding: '6px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}
                      >
                        <Edit size={14} /> 수정
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, cat.catid, cat.catName)} 
                        style={{ flex: 1, padding: '6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '600' }}
                      >
                        <Trash2 size={14} /> 삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="card-footer bg-white border-0 pb-4 text-center text-muted small">
          실시간 재난 정보와 안전 지침을 확인하세요.
        </div>
      </div>

      {/* 모달 */}
      {showModal && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
              {isEditMode ? '카테고리 수정' : '새 카테고리 추가'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>카테고리명</label>
                <input 
                  type="text" 
                  value={catNameInput} 
                  onChange={(e) => setCatNameInput(e.target.value)} 
                  placeholder="예: 지진, 화재, 태풍" 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  취소
                </button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  {isEditMode ? '수정 완료' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}