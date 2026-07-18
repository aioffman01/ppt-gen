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
      </nav>


      {/* Alert Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

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
                        <div className="font-actions">
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

                      <a 
                        href={`${BACKEND_BASE}${tmpl.url}`} 
                        download={tmpl.originalName} 
                        className="action-btn"
                        style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold' }}
                      >
                        📥 파일 다운로드
                      </a>
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

                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button 
                          className="action-btn" 
                          onClick={() => handleCopy(item.content, '마크다운 본문이 클립보드에 복사되었습니다!')}
                          style={{ flex: 1, fontWeight: 'bold' }}
                        >
                          📋 본문 복사
                        </button>
                        <a 
                          href={`${BACKEND_BASE}${item.url}`} 
                          download={item.filename} 
                          className="action-btn"
                          style={{ flex: 1, textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          📥 파일 받기
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
                      <span className="link-url" onClick={() => handleCopy(ref.content, '사이트 주소가 클립보드에 복사되었습니다!')} title="URL 주소 복사">
                        📋 주소 복사
                      </span>
                      {ref.description && <p className="link-desc" style={{ marginTop: '10px' }}>{ref.description}</p>}
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
