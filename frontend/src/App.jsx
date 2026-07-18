import React, { useState, useEffect } from 'react';
import './App.css';
import client from './api/client';

const BACKEND_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('fonts');
  
  // Data states
  const [fonts, setFonts] = useState([]);
  const [references, setReferences] = useState([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Font Form state (multi-file)
  const [fontFiles, setFontFiles] = useState([]);
  const [singleFontTitle, setSingleFontTitle] = useState('');

  // Template states
  const [templates, setTemplates] = useState([]);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateFile, setTemplateFile] = useState(null);
  const [templateDescription, setTemplateDescription] = useState('');

  // Design MD states
  const [designMds, setDesignMds] = useState([]);
  const [designMdTitle, setDesignMdTitle] = useState('');
  const [designMdDescription, setDesignMdDescription] = useState('');
  const [designMdContent, setDesignMdContent] = useState('');

  // Cart states
  const [cartFonts, setCartFonts] = useState([]);
  const [cartTemplates, setCartTemplates] = useState([]);
  const [cartDesignMds, setCartDesignMds] = useState([]);
  const [cartReferences, setCartReferences] = useState([]);

  // Project states
  const [projects, setProjects] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');

  // General Reference Form state
  const [refType, setRefType] = useState('link');
  const [refTitle, setRefTitle] = useState('');
  const [refContent, setRefContent] = useState('');
  const [refDescription, setRefDescription] = useState('');

  // Custom preview text for fonts
  const [previewText, setPreviewText] = useState('눈누에서 이쁜 한글 폰트를 다운로드해서 테스트해보세요!');

  // Fetch initial data
  useEffect(() => {
    fetchFonts();
    fetchReferences();
    fetchTemplates();
    fetchDesignMds();
    fetchProjects();
  }, []);




  // Inject font faces dynamically into head
  useEffect(() => {
    const existingStyles = document.querySelectorAll('style[data-dynamic-font]');
    existingStyles.forEach(style => style.remove());

    fonts.forEach(font => {
      const fontUrl = `${BACKEND_BASE}${font.url}`;
      const style = document.createElement('style');
      style.setAttribute('data-dynamic-font', font.id);
      style.textContent = `
        @font-face {
          font-family: 'custom-${font.id}';
          src: url('${fontUrl}');
        }
      `;
      document.head.appendChild(style);
    });
  }, [fonts]);

  const fetchFonts = async () => {
    try {
      const data = await client.get('/fonts');
      setFonts(data);
    } catch (err) {
      console.error('폰트 목록 로드 실패:', err);
      setError(err.message || '폰트 목록을 가져오는 데 실패했습니다.');
    }
  };

  const fetchReferences = async () => {
    try {
      const data = await client.get('/references');
      setReferences(data);
    } catch (err) {
      console.error('참고 자료 목록 로드 실패:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await client.get('/templates');
      setTemplates(data);
    } catch (err) {
      console.error('템플릿 목록 로드 실패:', err);
    }
  };

  const handleTemplateUpload = async (e) => {
    e.preventDefault();
    if (!templateTitle.trim() || !templateFile) {
      setError('템플릿 이름과 파일을 선택해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', templateTitle);
    if (templateDescription.trim()) {
      formData.append('description', templateDescription);
    }
    formData.append('file', templateFile);

    try {
      await client.post('/templates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('템플릿이 성공적으로 등록되었습니다.');
      setTemplateTitle('');
      setTemplateDescription('');
      setTemplateFile(null);
      const fileInput = document.getElementById('template-file-input');
      if (fileInput) fileInput.value = '';

      fetchTemplates();
    } catch (err) {
      setError(err.message || '템플릿 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      alert(err.message || '템플릿 삭제 실패');
    }
  };

  const fetchDesignMds = async () => {
    try {
      const data = await client.get('/design-md');
      setDesignMds(data);
    } catch (err) {
      console.error('디자인 MD 목록 로드 실패:', err);
    }
  };

  const handleDesignMDUpload = async (e) => {
    e.preventDefault();
    if (!designMdTitle.trim() || !designMdContent.trim()) {
      setError('제목과 마크다운 내용을 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.post('/design-md', {
        title: designMdTitle,
        description: designMdDescription || null,
        content: designMdContent,
      });

      setSuccess('디자인 마크다운 파일이 성공적으로 저장되었습니다.');
      setDesignMdTitle('');
      setDesignMdDescription('');
      setDesignMdContent('');
      fetchDesignMds();
    } catch (err) {
      setError(err.message || '디자인 MD 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDesignMD = async (id) => {
    if (!confirm('정말로 이 디자인 마크다운 문서를 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/design-md/${id}`);
      fetchDesignMds();
    } catch (err) {
      alert(err.message || '삭제 실패');
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await client.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error('프로젝트 목록 로드 실패:', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectTitle.trim()) {
      setError('프로젝트 제목을 입력해 주세요.');
      return;
    }
    if (cartFonts.length === 0 && cartTemplates.length === 0 && cartDesignMds.length === 0 && cartReferences.length === 0) {
      setError('장바구니가 비어 있습니다. 항목을 담은 뒤 프로젝트를 생성해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.post('/projects', {
        title: projectTitle,
        font_ids: cartFonts.map(f => f.id),
        template_ids: cartTemplates.map(t => t.id),
        design_md_ids: cartDesignMds.map(d => d.id),
        reference_ids: cartReferences.map(r => r.id),
      });

      setSuccess(`'${projectTitle}' 프로젝트 패키지가 성공적으로 빌드되었습니다!`);
      setProjectTitle('');
      setCartFonts([]);
      setCartTemplates([]);
      setCartDesignMds([]);
      setCartReferences([]);
      fetchProjects();
    } catch (err) {
      setError(err.message || '프로젝트 빌드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('정말로 이 프로젝트와 생성된 물리 폴더를 영구 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.message || '프로젝트 삭제 실패');
    }
  };

  const addToCart = (type, item) => {
    if (type === 'font') {
      if (cartFonts.find(f => f.id === item.id)) return;
      setCartFonts([...cartFonts, item]);
    } else if (type === 'template') {
      if (cartTemplates.find(t => t.id === item.id)) return;
      setCartTemplates([...cartTemplates, item]);
    } else if (type === 'design_md') {
      if (cartDesignMds.find(d => d.id === item.id)) return;
      setCartDesignMds([...cartDesignMds, item]);
    } else if (type === 'reference') {
      if (cartReferences.find(r => r.id === item.id)) return;
      setCartReferences([...cartReferences, item]);
    }
    setSuccess(`'${item.title}'이(가) 장바구니에 담겼습니다.`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const removeFromCart = (type, id) => {
    if (type === 'font') {
      setCartFonts(cartFonts.filter(f => f.id !== id));
    } else if (type === 'template') {
      setCartTemplates(cartTemplates.filter(t => t.id !== id));
    } else if (type === 'design_md') {
      setCartDesignMds(cartDesignMds.filter(d => d.id !== id));
    } else if (type === 'reference') {
      setCartReferences(cartReferences.filter(r => r.id !== id));
    }
  };




  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map(file => {
      const originalName = file.name;
      const dotIdx = originalName.lastIndexOf('.');
      const title = dotIdx !== -1 ? originalName.substring(0, dotIdx) : originalName;
      const cleanTitle = title.replace(/[^a-zA-Z0-9가-힣\s_-]/g, '').trim() || 'Unnamed Font';
      return { file, title: cleanTitle };
    });
    
    // If a single file is selected and singleFontTitle is pre-filled, apply it
    if (mapped.length === 1 && singleFontTitle.trim()) {
      mapped[0].title = singleFontTitle;
    }
    setFontFiles(mapped);
  };

  const handleTitleChange = (index, value) => {
    const updated = [...fontFiles];
    updated[index].title = value;
    setFontFiles(updated);
    // Sync singleFontTitle if it's the only file
    if (updated.length === 1) {
      setSingleFontTitle(value);
    }
  };

  const handleRemoveFile = (index) => {
    const updated = fontFiles.filter((_, i) => i !== index);
    setFontFiles(updated);
    if (updated.length === 0) {
      const fileInput = document.getElementById('font-file-input');
      if (fileInput) fileInput.value = '';
      setSingleFontTitle('');
    } else if (updated.length === 1) {
      setSingleFontTitle(updated[0].title);
    }
  };

  const handleFontUpload = async (e) => {
    e.preventDefault();
    if (fontFiles.length === 0) {
      setError('업로드할 폰트 파일을 하나 이상 선택해 주세요.');
      return;
    }

    if (fontFiles.some(f => !f.title.trim())) {
      setError('모든 폰트의 이름을 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const uploadPromises = fontFiles.map(async (font) => {
        const formData = new FormData();
        formData.append('title', font.title);
        formData.append('file', font.file);
        return client.post('/fonts', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      });
      await Promise.all(uploadPromises);
      setSuccess(`${fontFiles.length}개의 폰트가 성공적으로 등록되었습니다.`);
      setFontFiles([]);
      setSingleFontTitle('');


      const fileInput = document.getElementById('font-file-input');
      if (fileInput) fileInput.value = '';

      
      fetchFonts();
    } catch (err) {
      setError(err.message || '폰트 파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteFont = async (id) => {
    if (!confirm('정말로 이 폰트를 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/fonts/${id}`);
      fetchFonts();
    } catch (err) {
      alert(err.message || '폰트 삭제 실패');
    }
  };

  const handleAddReference = async (e) => {
    e.preventDefault();
    if (!refTitle.trim() || !refContent.trim()) {
      setError('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await client.post('/references', {
        type: refType,
        title: refTitle,
        content: refContent,
        description: refDescription || null,
      });

      setSuccess('자료가 성공적으로 등록되었습니다.');
      setRefTitle('');
      setRefContent('');
      setRefDescription('');
      fetchReferences();
    } catch (err) {
      setError(err.message || '참고 자료 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReference = async (id) => {
    if (!confirm('정말로 이 자료를 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/references/${id}`);
      fetchReferences();
    } catch (err) {
      alert(err.message || '자료 삭제 실패');
    }
  };

  const handleCopy = (text, message = '클립보드에 복사되었습니다!') => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="logo-area">
          <span className="accent-dot"></span>
          <h1>PPT Reference Vault</h1>
        </div>
        <p className="subtitle">PPT 제작에 필요한 폰트, 색상 팔레트 및 참고 리소스를 한 곳에서 관리하세요.</p>
        
        <div className="quick-links" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://noonnu.cc" target="_blank" rel="noopener noreferrer" className="noonnu-btn">
            눈누(Noonnu)에서 이쁜 폰트 찾기 ↗
          </a>
          <a href="https://www.canva.com/s/template" target="_blank" rel="noopener noreferrer" className="noonnu-btn" style={{ background: 'rgba(192, 130, 97, 0.15)', borderColor: 'rgba(192, 130, 97, 0.3)', color: 'var(--accent)' }}>
            Canva에서 PPT 템플릿 탐색 ↗
          </a>
          <a href="https://getdesign.md/" target="_blank" rel="noopener noreferrer" className="noonnu-btn" style={{ background: 'rgba(79, 111, 82, 0.15)', borderColor: 'rgba(79, 111, 82, 0.3)', color: 'var(--primary)' }}>
            getdesign.md 탐색 ↗
          </a>
        </div>


      </header>

      {/* Tabs */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'fonts' ? 'active' : ''}`}
          onClick={() => { setActiveTab('fonts'); setError(''); setSuccess(''); }}
        >
          📂 폰트 관리
        </button>
        <button 
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => { setActiveTab('templates'); setError(''); setSuccess(''); }}
        >
          📄 템플릿 관리
        </button>
        <button 
          className={`tab-btn ${activeTab === 'design_md' ? 'active' : ''}`}
          onClick={() => { setActiveTab('design_md'); setError(''); setSuccess(''); }}
        >
          📝 디자인md 관리
        </button>
        <button 
          className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => { setActiveTab('links'); setError(''); setSuccess(''); }}
        >
          🔗 참고 사이트
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => { setActiveTab('projects'); setError(''); setSuccess(''); }}
        >
          💼 프로젝트 보관함
        </button>
      </nav>



      {/* Alert Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Shopping Cart (장바구니) */}
      {(cartFonts.length > 0 || cartTemplates.length > 0 || cartDesignMds.length > 0 || cartReferences.length > 0) && (
        <div className="card cart-card" style={{ marginBottom: '25px', background: 'rgba(245, 247, 245, 0.9)', border: '2px solid var(--accent-light)', backdropFilter: 'blur(10px)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                🛒 장바구니 리소스 빌더
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                선택한 리소스를 모아 하나의 프로젝트 디렉토리 패키지로 합칩니다. (디렉토리 참조를 통한 PPT 생성 지원)
              </p>
            </div>
            
            {/* Project Title and Confirm Form */}
            <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="프로젝트 제목 입력 (예: 서비스소개서_최종)" 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                style={{ width: '260px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: '#fff', fontSize: '0.9rem' }}
                required
              />
              <button type="submit" className="submit-btn" style={{ padding: '8px 16px', margin: 0 }}>
                확인 (프로젝트 생성)
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '15px', background: 'rgba(255,255,255,0.6)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            {cartFonts.length > 0 && (
              <div style={{ flex: 1, minWidth: '150px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>📂 폰트 ({cartFonts.length})</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {cartFonts.map(f => (
                    <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem', background: 'var(--primary-light)', color: 'var(--primary-dark)', borderRadius: '12px', fontWeight: 'bold' }}>
                      {f.title}
                      <button type="button" onClick={() => removeFromCart('font', f.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', padding: 0, marginLeft: '2px' }}>❌</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cartTemplates.length > 0 && (
              <div style={{ flex: 1, minWidth: '150px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>📄 템플릿 ({cartTemplates.length})</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {cartTemplates.map(t => (
                    <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem', background: 'rgba(192, 130, 97, 0.15)', color: 'var(--accent)', borderRadius: '12px', fontWeight: 'bold' }}>
                      {t.title}
                      <button type="button" onClick={() => removeFromCart('template', t.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', padding: 0, marginLeft: '2px' }}>❌</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cartDesignMds.length > 0 && (
              <div style={{ flex: 1, minWidth: '150px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>📝 디자인md ({cartDesignMds.length})</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {cartDesignMds.map(d => (
                    <span key={d.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem', background: 'rgba(79, 111, 82, 0.15)', color: 'var(--primary)', borderRadius: '12px', fontWeight: 'bold' }}>
                      {d.title}
                      <button type="button" onClick={() => removeFromCart('design_md', d.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', padding: 0, marginLeft: '2px' }}>❌</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {cartReferences.length > 0 && (
              <div style={{ flex: 1, minWidth: '150px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>🔗 사이트 링크 ({cartReferences.length})</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {cartReferences.map(r => (
                    <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem', background: 'var(--border-color)', color: 'var(--text-muted)', borderRadius: '12px', fontWeight: 'bold' }}>
                      {r.title}
                      <button type="button" onClick={() => removeFromCart('reference', r.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem', padding: 0, marginLeft: '2px' }}>❌</button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="main-content">

        
        {/* FONTS TAB */}
        {activeTab === 'fonts' && (
          <div className="tab-pane">
            <div className="grid-2col">
              
              {/* Left: Registration Form */}
              <div className="card">
                <h2>새 폰트 일괄 등록</h2>
                <p className="card-desc">눈누 등에서 다운로드받은 폰트 파일(.ttf, .otf, .woff 등)을 여러 개 선택해 일괄 등록합니다.</p>
                <form onSubmit={handleFontUpload} className="form-layout">
                  {fontFiles.length <= 1 && (
                    <div className="form-group">
                      <label>폰트 이름</label>
                      <input 
                        type="text" 
                        placeholder="예: 나눔고딕 Bold, Pretendard"
                        value={fontFiles.length === 1 ? fontFiles[0].title : singleFontTitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (fontFiles.length === 1) {
                            handleTitleChange(0, val);
                          } else {
                            setSingleFontTitle(val);
                          }
                        }}
                        required
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>폰트 파일 선택 {fontFiles.length <= 1 ? '' : '(다중 선택됨)'}</label>
                    <input 
                      id="font-file-input"
                      type="file" 
                      accept=".ttf,.otf,.woff,.woff2"
                      multiple
                      onChange={handleFileChange}
                      required
                    />
                  </div>
                  {fontFiles.length > 1 && (
                    <div className="selected-fonts-list" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>선택된 파일 및 폰트 이름 설정:</label>
                      {fontFiles.map((font, idx) => (
                        <div key={idx} className="selected-font-item" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--primary-light)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                            📄 {font.file.name}
                          </span>
                          <input 
                            type="text" 
                            placeholder="폰트 명칭 입력" 
                            value={font.title} 
                            onChange={(e) => handleTitleChange(idx, e.target.value)} 
                            style={{ width: '130px', padding: '4px 8px', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                            required
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveFile(idx)} 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            ❌
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '등록 중...' : '폰트 등록하기'}
                  </button>
                </form>


              </div>

              {/* Right: Live Preview Input */}
              <div className="card">
                <h2>글꼴 실시간 테스트</h2>
                <p className="card-desc">입력하는 텍스트가 아래 등록된 모든 폰트에 실시간 적용됩니다.</p>
                <div className="form-group" style={{marginTop: '15px'}}>
                  <textarea 
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    rows="3"
                    placeholder="테스트할 문구를 입력해 보세요."
                  />
                </div>
              </div>

            </div>

            {/* Font List */}
            <div className="list-section">
              <h2>등록된 폰트 ({fonts.length})</h2>
              {fonts.length === 0 ? (
                <div className="empty-state">등록된 폰트가 없습니다. 눈누에서 이쁜 폰트를 내려받아 등록해 보세요!</div>
              ) : (
                <div className="font-grid">
                  {fonts.map(font => (
                    <div className="font-card" key={font.id}>
                      <div className="font-card-header">
                        <div>
                          <h3>{font.title}</h3>
                          <span className="font-filename">{font.originalName}</span>
                        </div>
                        <div className="font-actions" style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            className="action-btn copy-btn"
                            onClick={() => addToCart('font', font)}
                            title="장바구니 담기"
                            style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }}
                          >
                            🛒 담기
                          </button>
                          <button 
                            className="action-btn copy-btn"
                            onClick={() => handleCopy(`font-family: 'custom-${font.id}';`, 'CSS font-family 속성이 복사되었습니다!')}
                            title="CSS font-family 복사"
                          >
                            📋 CSS 복사
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteFont(font.id)}
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </div>

                      </div>
                      <div className="font-preview-area" style={{ fontFamily: `'custom-${font.id}', sans-serif` }}>
                        {previewText || '테스트 문구를 입력해 주세요.'}
                      </div>
                      <div className="font-css-helper">
                        <code>font-family: 'custom-{font.id}';</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="tab-pane">
            <div className="grid-2col">
              
              {/* Left: Template Registration Form */}
              <div className="card">
                <h2>새 템플릿 등록</h2>
                <p className="card-desc">Canva 등에서 참고하여 다운로드받은 PPT 템플릿 파일(.pptx, .potx 등)을 등록합니다.</p>
                <form onSubmit={handleTemplateUpload} className="form-layout">
                  <div className="form-group">
                    <label>템플릿 이름</label>
                    <input 
                      type="text" 
                      placeholder="예: 깔끔한 기획서 양식, 서비스 제안서"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>템플릿 파일 (.pptx, .potx, .ppt, .pdf)</label>
                    <input 
                      id="template-file-input"
                      type="file" 
                      accept=".pptx,.potx,.ppt,.pdf"
                      onChange={(e) => setTemplateFile(e.target.files[0])}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>설명 (선택)</label>
                    <textarea 
                      placeholder="예: 파랑/네이비 톤 테마의 미니멀 스타일 제안서 서식"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      rows="3"
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '등록 중...' : '템플릿 등록하기'}
                  </button>
                </form>
              </div>

              {/* Right: Canva Quick-Link Info Card */}
              <div className="card">
                <h2>추천 템플릿 리소스</h2>
                <p className="card-desc">다양한 무료 프레젠테이션 디자인 서식을 둘러보고 참고해 보세요.</p>
                <div className="recommend-links">
                  <div className="rec-link-item">
                    <h4><a href="https://www.canva.com/s/template" target="_blank" rel="noopener noreferrer">Canva 템플릿 ↗</a></h4>
                    <p>수천 개의 모던하고 완성도 높은 프레젠테이션 템플릿 디자인 모음</p>
                  </div>
                  <div className="rec-link-item" style={{ marginTop: '10px' }}>
                    <h4><a href="https://coolors.co" target="_blank" rel="noopener noreferrer">Coolors ↗</a></h4>
                    <p>템플릿 제작 시 색상 조합(Color Palette)을 구성할 때 활용하기 좋은 도구</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Template List */}
            <div className="list-section">
              <h2>등록된 템플릿 ({templates.length})</h2>
              {templates.length === 0 ? (
                <div className="empty-state">등록된 템플릿이 없습니다. Canva 등에서 유용한 템플릿을 구해서 등록해 보세요!</div>
              ) : (
                <div className="link-grid">
                  {templates.map(tmpl => (
                    <div className="link-card" key={tmpl.id}>
                      <div className="link-card-header">
                        <span className="link-title" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                          📄 {tmpl.title}
                        </span>
                        <button className="delete-btn-simple" onClick={() => handleDeleteTemplate(tmpl.id)}>🗑️</button>
                      </div>
                      <div style={{ margin: '8px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        파일명: {tmpl.originalName}
                      </div>
                      
                      {tmpl.description && (
                        <p className="link-desc" style={{ background: 'var(--primary-light)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                          {tmpl.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button 
                          className="action-btn" 
                          onClick={() => addToCart('template', tmpl)}
                          style={{ flex: 1, fontWeight: 'bold', background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }}
                        >
                          🛒 담기
                        </button>
                        <a 
                          href={`${BACKEND_BASE}${tmpl.url}`} 
                          download={tmpl.originalName} 
                          className="action-btn"
                          style={{ flex: 1, display: 'inline-block', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold' }}
                        >
                          📥 다운로드
                        </a>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DESIGN MD TAB */}
        {activeTab === 'design_md' && (
          <div className="tab-pane">
            <div className="grid-2col">
              
              {/* Left: Design MD Registration Form */}
              <div className="card">
                <h2>새 디자인 마크다운 작성</h2>
                <p className="card-desc">직접 마크다운 텍스트를 작성하여 텍스트 파일(.md)로 생성 및 관리합니다.</p>
                <form onSubmit={handleDesignMDUpload} className="form-layout">
                  <div className="form-group">
                    <label>문서 제목</label>
                    <input 
                      type="text" 
                      placeholder="예: PPT 구조 설계 가이드"
                      value={designMdTitle}
                      onChange={(e) => setDesignMdTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>문서 설명 (선택)</label>
                    <input 
                      type="text" 
                      placeholder="예: 슬라이드 기획안의 뼈대를 위한 마크다운 템플릿"
                      value={designMdDescription}
                      onChange={(e) => setDesignMdDescription(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>마크다운 본문 내용</label>
                    <textarea 
                      placeholder="# 타이틀&#10;&#10;- 리스트 1&#10;- 리스트 2&#10;&#10;여기에 마크다운 문법으로 작성을 진행해 주세요."
                      value={designMdContent}
                      onChange={(e) => setDesignMdContent(e.target.value)}
                      rows="8"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '저장 중...' : '마크다운 파일 생성하기'}
                  </button>
                </form>
              </div>

              {/* Right: getdesign.md Reference Info Card */}
              <div className="card">
                <h2>디자인 마크다운 정보</h2>
                <p className="card-desc">슬라이드 디자인 설계 및 마크다운 작성법에 대해 유용한 정보입니다.</p>
                <div className="recommend-links">
                  <div className="rec-link-item">
                    <h4><a href="https://getdesign.md/" target="_blank" rel="noopener noreferrer">getdesign.md ↗</a></h4>
                    <p>마크다운을 시각적인 디자인 슬라이드로 변환해 주는 디자인 가이드 사이트</p>
                  </div>
                  <div className="rec-link-item" style={{ marginTop: '10px' }}>
                    <h4>마크다운 기본 팁</h4>
                    <p>`#`은 큰 제목, `##`는 중간 제목을 뜻하며 `-` 또는 `*`로 글머리 기호를 생성할 수 있습니다.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Design MD List */}
            <div className="list-section">
              <h2>등록된 디자인 마크다운 ({designMds.length})</h2>
              {designMds.length === 0 ? (
                <div className="empty-state">생성된 마크다운 문서가 없습니다. getdesign.md를 참고하여 슬라이드 기획 마크다운을 작성해 보세요!</div>
              ) : (
                <div className="link-grid">
                  {designMds.map(item => (
                    <div className="link-card" key={item.id}>
                      <div className="link-card-header">
                        <span className="link-title" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                          📝 {item.title}
                        </span>
                        <button className="delete-btn-simple" onClick={() => handleDeleteDesignMD(item.id)}>🗑️</button>
                      </div>
                      <div style={{ margin: '8px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        생성된 파일명: {item.filename}
                      </div>

                      {item.description && (
                        <p className="link-desc" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                          {item.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <button 
                          className="action-btn" 
                          onClick={() => addToCart('design_md', item)}
                          style={{ flex: 1, minWidth: '70px', fontWeight: 'bold', background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' }}
                        >
                          🛒 담기
                        </button>
                        <button 
                          className="action-btn" 
                          onClick={() => handleCopy(item.content, '마크다운 본문이 클립보드에 복사되었습니다!')}
                          style={{ flex: 1, minWidth: '70px', fontWeight: 'bold' }}
                        >
                          📋 복사
                        </button>
                        <a 
                          href={`${BACKEND_BASE}${item.url}`} 
                          download={item.filename} 
                          className="action-btn"
                          style={{ flex: 1, minWidth: '70px', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          📥 받기
                        </a>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}





        {/* LINKS TAB */}
        {activeTab === 'links' && (
          <div className="tab-pane">
            <div className="grid-2col">
              <div className="card">
                <h2>참고 사이트 등록</h2>
                <p className="card-desc">PPT 기획, 무료 템플릿, 아이콘 다운로드 등 참고할 사이트를 등록합니다.</p>
                <form onSubmit={handleAddReference} className="form-layout">
                  <input type="hidden" value="link" />
                  <div className="form-group">
                    <label>사이트 이름</label>
                    <input 
                      type="text" 
                      placeholder="예: 플래티콘 (아이콘 다운로드)"
                      value={refTitle}
                      onChange={(e) => {
                        setRefType('link');
                        setRefTitle(e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>URL 주소</label>
                    <input 
                      type="url" 
                      placeholder="https://example.com"
                      value={refContent}
                      onChange={(e) => {
                        setRefType('link');
                        setRefContent(e.target.value);
                      }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>설명 (선택)</label>
                    <textarea 
                      placeholder="예: PPT에 쓰기 좋은 SVG 무료 아이콘 리소스 사이트"
                      value={refDescription}
                      onChange={(e) => {
                        setRefType('link');
                        setRefDescription(e.target.value);
                      }}
                      rows="2"
                    />
                  </div>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    등록하기
                  </button>
                </form>
              </div>

              <div className="card">
                <h2>추천 사이트</h2>
                <div className="recommend-links">
                  <div className="rec-link-item">
                    <h4><a href="https://noonnu.cc" target="_blank" rel="noopener noreferrer">눈누 ↗</a></h4>
                    <p>상업적 이용 가능한 무료 한글 폰트를 모아놓은 최고의 폰트 플랫폼</p>
                  </div>
                  <div className="rec-link-item">
                    <h4><a href="https://www.flaticon.com" target="_blank" rel="noopener noreferrer">Flaticon ↗</a></h4>
                    <p>무료 벡터 아이콘 및 스티커 다운로드 사이트 (PPT 가독성을 높일 때 유용)</p>
                  </div>
                  <div className="rec-link-item">
                    <h4><a href="https://coolors.co" target="_blank" rel="noopener noreferrer">Coolors ↗</a></h4>
                    <p>자동으로 세련된 5색 조합을 추천해주는 대표적인 색상 제너레이터</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links List */}
            <div className="list-section">
              <h2>참고 사이트 리스트 ({references.filter(r => r.type === 'link').length})</h2>
              {references.filter(r => r.type === 'link').length === 0 ? (
                <div className="empty-state">저장된 참고 사이트가 없습니다. 유용한 기획 사이트나 템플릿 사이트를 등록해 보세요!</div>
              ) : (
                <div className="link-grid">
                  {references.filter(r => r.type === 'link').map(ref => (
                    <div className="link-card" key={ref.id}>
                      <div className="link-card-header">
                        <a href={ref.content} target="_blank" rel="noopener noreferrer" className="link-title">
                          {ref.title} ↗
                        </a>
                        <button className="delete-btn-simple" onClick={() => handleDeleteReference(ref.id)}>🗑️</button>
                      </div>
                      {/* SITE URL VISIBLE */}
                      <div className="link-url-display" style={{ margin: '4px 0 8px', fontSize: '0.85rem' }}>
                        URL: <a href={ref.content} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>{ref.content}</a>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button 
                          className="action-btn" 
                          onClick={() => addToCart('reference', ref)}
                          style={{ flex: 1, fontWeight: 'bold', background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff', fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          🛒 담기
                        </button>
                        <button 
                          className="action-btn" 
                          onClick={() => handleCopy(ref.content, '사이트 주소가 클립보드에 복사되었습니다!')}
                          style={{ flex: 1, fontWeight: 'bold', fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          📋 주소 복사
                        </button>
                      </div>
                      {ref.description && <p className="link-desc" style={{ marginTop: '10px' }}>{ref.description}</p>}

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="tab-pane">
            <div className="card" style={{ marginBottom: '25px' }}>
              <h2>💼 프로젝트 보관함 안내</h2>
              <p className="card-desc">
                장바구니에 담아 빌드한 프로젝트별 패키지 디렉토리 목록입니다. 
                각 디렉토리 하위에는 선택하셨던 폰트, 템플릿, 디자인md 및 메타데이터 정보가 모여 있습니다.
                <strong>이 디렉토리 경로를 참조하여 외부 스크립트나 AI 도구로 PPT를 자동 생성하실 수 있습니다.</strong>
              </p>
            </div>

            <div className="list-section">
              <h2>생성된 프로젝트 패키지 ({projects.length})</h2>
              {projects.length === 0 ? (
                <div className="empty-state">생성된 프로젝트가 없습니다. 폰트, 템플릿, 디자인md 탭에서 마음에 드는 리소스를 장바구니에 담아 프로젝트를 생성해 보세요!</div>
              ) : (
                <div className="link-grid">
                  {projects.map(proj => (
                    <div className="link-card" key={proj.id} style={{ borderLeft: '4px solid var(--accent)' }}>
                      <div className="link-card-header">
                        <span className="link-title" style={{ fontSize: '1.15rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                          💼 {proj.title}
                        </span>
                        <button className="delete-btn-simple" onClick={() => handleDeleteProject(proj.id)}>🗑️</button>
                      </div>
                      
                      <div style={{ marginTop: '12px', fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '6px' }}>
                          <strong style={{ color: 'var(--primary)' }}>디렉토리명:</strong>
                          <code style={{ marginLeft: '6px', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>{proj.folder_name}</code>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong style={{ color: 'var(--primary)' }}>절대 경로:</strong>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                            <input 
                              type="text" 
                              readOnly 
                              value={proj.folder_path} 
                              style={{ flex: 1, padding: '4px 8px', fontSize: '0.78rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <button 
                              onClick={() => handleCopy(proj.folder_path, '프로젝트 절대 경로가 클립보드에 복사되었습니다!')} 
                              style={{ padding: '4px 8px', fontSize: '0.78rem', cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px' }}
                            >
                              경로 복사
                            </button>
                          </div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          생성 시각: {new Date(proj.registered_at).toLocaleString()}
                        </div>
                      </div>

                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <a 
                          href={`${BACKEND_BASE}/PROJECTS/${proj.folder_name}/project_metadata.json`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="action-btn"
                          style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                          📋 메타데이터 보기
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>


      <footer className="app-footer-bottom">
        <p>© 2026 PPT Reference Vault. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App;
