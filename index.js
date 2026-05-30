/**
 * 版本发布中心前端渲染控制
 * 负责获取 release 列表、转换 markdown、匹配文件图标及本地化日期
 */

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('releases-container');

  // 不同文件后缀对应的内联 SVG 图标
  const ICONS = {
    zip: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    apple: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.88-1.06 3.06-2.6 3.06-4.94a3 3 0 0 0-3-3 3 3 0 0 0-3 3c0 2.34 1.18 3.88 3.06 4.94zM12 13V3m-4 5h8"/></svg>`,
    extension: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
  };

  /**
   * 根据文件名后缀匹配对应图标
   * @param {string} filename 
   * @returns {string} SVG 字符串
   */
  function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) {
      return ICONS.zip;
    } else if (['dmg', 'pkg'].includes(ext)) {
      return ICONS.apple;
    } else if (['crx', 'crx3'].includes(ext)) {
      return ICONS.extension;
    }
    return ICONS.file;
  }

  /**
   * 格式化 ISO 日期为本地日期字符串
   * @param {string} dateString 
   * @returns {string} 格式化日期
   */
  function formatLocalDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  }

  // 异步获取并渲染版本列表
  async function fetchReleases() {
    try {
      const response = await fetch('./data/releases.json?t=' + Date.now());
      if (!response.ok) {
        throw new Error(`HTTP 状态码异常: ${response.status}`);
      }
      
      const releases = await response.json();
      container.innerHTML = '';

      if (!releases || releases.length === 0) {
        renderEmptyState();
        return;
      }

      releases.forEach((release, index) => {
        const card = document.createElement('article');
        card.className = 'release-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
          <div class="card-header">
            <div class="version-info">
              <span class="tag-badge">${escapeHTML(release.tag_name)}</span>
              <h2 class="release-title">${escapeHTML(release.name || release.tag_name)}</h2>
            </div>
            <span class="release-time">发布于：${formatLocalDate(release.published_at)}</span>
          </div>
          
          <div class="release-body">
            ${renderMarkdown(release.body)}
          </div>
          
          <div class="assets-container">
            <div class="assets-title">下载资产 (${release.assets.length})</div>
            <div class="assets-list">
              ${release.assets.map(asset => `
                <a href="${escapeHTML(asset.download_url)}" class="asset-button" title="下载 ${escapeHTML(asset.name)}">
                  <div class="asset-icon">
                    ${getFileIcon(asset.name)}
                  </div>
                  <div class="asset-meta">
                    <span class="asset-name">${escapeHTML(asset.name)}</span>
                    <span class="asset-size">点击直接下载</span>
                  </div>
                </a>
              `).join('')}
            </div>
          </div>
        `;
        container.appendChild(card);
      });

    } catch (error) {
      console.error('获取 Release 列表失败:', error);
      renderErrorState(error.message);
    }
  }

  /**
   * 安全转换 markdown 为 HTML
   * @param {string} markdownText 
   */
  function renderMarkdown(markdownText) {
    if (!markdownText) return '<p>无更新日志说明。</p>';
    if (typeof marked !== 'undefined') {
      try {
        return marked.parse(markdownText);
      } catch (err) {
        console.error('Marked 解析失败:', err);
      }
    }
    return `<p>${escapeHTML(markdownText).replace(/\n/g, '<br>')}</p>`;
  }

  // HTML 字符转义，防范 XSS
  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // 渲染空状态界面
  function renderEmptyState() {
    container.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.6;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3>暂无已同步的版本数据</h3>
        <p style="margin-top: 10px; font-size: 0.95rem;">请先在私有仓库中手动运行 GitHub Action 触发数据同步。</p>
      </div>
    `;
  }

  // 渲染加载失败界面
  function renderErrorState(message) {
    container.innerHTML = `
      <div class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <h3 style="font-weight: 600;">数据加载失败</h3>
        <p style="margin: 10px 0 20px 0; font-size: 0.95rem; opacity: 0.85;">${message || '请确保在 HTTP 服务器环境中运行，由于浏览器安全限制，无法直接双击本地 html 文件加载数据。'}</p>
        <button id="retry-btn" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff; padding: 10px 24px; border-radius: 12px; cursor: pointer; font-family: var(--font-sans); font-weight: 500; transition: var(--transition-smooth);">重试</button>
      </div>
    `;

    document.getElementById('retry-btn')?.addEventListener('click', () => {
      container.innerHTML = `
        <div class="release-card skeleton-card"></div>
        <div class="release-card skeleton-card"></div>
      `;
      fetchReleases();
    });
  }

  fetchReleases();
});
