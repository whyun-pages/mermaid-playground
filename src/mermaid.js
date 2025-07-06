import mermaid from 'mermaid';
import { Utils } from './util';
export class Mermaid {
  /**
   * @param {import('./main').MermaidPlayground} pg
   */
  constructor({ pg }) {
    this.currentTheme = 'default';
    this.scale = 1;
    this.renderTimeout = null;
    /**
     * @type {import('./main').MermaidPlayground}
     */
    this.pg = pg;
    // this.editor = this.pg.editor.editor;
    this.init();
    this.loadTheme();
    this.addEventListeners();
  }
  init() {
    Utils.initMermaid();
  }
  addEventListeners() {
    // 主题切换按钮
    const themeToggle = document.getElementById('theme-toggle');
    const themeDropdown = document.getElementById('theme-dropdown');
    const resetBtn = document.getElementById('btn-reset');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const maximizeBtn = document.getElementById('btn-maximize');
    const renderSection = document.querySelector('.render-section');
    const maxBtnTitle = maximizeBtn.querySelector('span');

    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      Utils.toggleDropdown(themeDropdown);
    });

    // 模板切换按钮
    const templateToggle = document.getElementById('template-toggle');
    const templateDropdown = document.getElementById('template-dropdown');
    const templateSelector = document.querySelector('.template-selector');

    templateToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      Utils.toggleDropdown(templateDropdown);
      templateSelector.classList.toggle('active');
    });

    // 导出按钮
    const exportBtn = document.getElementById('export-btn');
    const exportDropdown = document.getElementById('export-dropdown');

    exportBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      Utils.toggleDropdown(exportDropdown);
    });
    // 主题选择
    themeDropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('dropdown-item')) {
        const theme = e.target.dataset.theme;
        this.changeTheme(theme);
        Utils.hideDropdown(themeDropdown);
      }
    });

    // 导出选择
    exportDropdown.addEventListener('click', (e) => {
      if (e.target.classList.contains('dropdown-item')) {
        const format = e.target.dataset.format;
        this.exportDiagram(format);
        Utils.hideDropdown(exportDropdown);
      }
    });

    // 模板选择
    templateDropdown.addEventListener('click', (e) => {
      if (e.target.closest('.template-item')) {
        const templateItem = e.target.closest('.template-item');
        const template = templateItem.dataset.template;
        this.loadTemplate(template);
        Utils.hideDropdown(templateDropdown);
        templateSelector.classList.remove('active');
      }
    });
    resetBtn.addEventListener('click', () => {
      if (this.svg) {
        this.scale = 1;
        this.svg.style.transform = 'scale(1)';
      }
    });
    zoomOutBtn.addEventListener('click', () => {
      if (this.svg) {
        this.scale -= 0.1;
        this.svg.style.transform = `scale(${this.scale})`;
      }
    });
    zoomInBtn.addEventListener('click', () => {
      if (this.svg) {
        this.scale += 0.1;
        this.svg.style.transform = `scale(${this.scale})`;
      }
    });
    maximizeBtn.addEventListener('click', () => {
      if (document.fullscreenElement) {
        Utils.exitFullscreen();
        maximizeBtn.title = '最大化';
        maxBtnTitle.innerHTML = '&#8599;';
      } else {
        Utils.requestFullscreen(renderSection);
        maximizeBtn.title = '退出最大化';
        maxBtnTitle.innerText = '↙';
      }
    });
  }
  changeTheme(theme = 'default') {
    this.currentTheme = theme;

    // 只更新 Mermaid 主题
    mermaid.initialize({
      theme: theme,
    });

    // 保存主题设置
    localStorage.setItem('mermaid-theme', theme);

    // 重新渲染图表
    // this.renderMermaid();
    this.debounceRender();
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('mermaid-theme');
    if (savedTheme) {
      this.changeTheme(savedTheme);
    }
  }
  get svg() {
    return document.getElementById('svg-container').querySelector('svg');
  }
  async renderMermaid() {
    const renderArea = document.getElementById('svg-container');
    const code = this.pg.editor.editor.getValue().trim();

    if (!code) {
      renderArea.innerHTML =
        '<div class="placeholder">在左侧输入 Mermaid 代码，这里将显示渲染结果</div>';
      return;
    }

    try {
      // 显示加载状态
      renderArea.innerHTML =
        '<div class="placeholder"><div class="loading"></div> 正在渲染...</div>';

      // 使用动态ID避免缓存问题
      const diagramId = 'mermaid-diagram-' + Date.now();

      // 渲染 Mermaid 图表
      const { svg } = await mermaid.render(diagramId, code);

      renderArea.innerHTML = svg;
      console.log('svg', svg);
    } catch (error) {
      console.error('Mermaid 渲染错误:', error);
      renderArea.innerHTML = `
                <div class="placeholder" style="color: var(--error-color);">
                    <div>❌ 渲染失败</div>
                    <div style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</div>
                </div>
            `;
    }
  }

  debounceRender() {
    if (this.renderTimeout) {
      clearTimeout(this.renderTimeout);
    }
    this.renderTimeout = setTimeout(() => {
      this.renderMermaid();
    }, 0);
  }

  async svgToCanvas(svg) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    // 获取 SVG 的 viewBox 或宽高
    const viewBox = svgElement.getAttribute('viewBox');
    let width = 800;
    let height = 600;

    if (viewBox) {
      const [, , w, h] = viewBox.split(' ').map(Number);
      width = w + 40; // 添加边距
      height = h + 40;
    } else {
      const svgWidth = svgElement.getAttribute('width');
      const svgHeight = svgElement.getAttribute('height');
      if (svgWidth && svgHeight) {
        width = Math.max(800, parseInt(svgWidth) + 40);
        height = Math.max(600, parseInt(svgHeight) + 40);
      }
    }

    // 创建 Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    // 设置白色背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 创建图片
    const img = new Image();

    // 使用 data URL
    const svgDataUrl =
      'data:image/svg+xml;base64,' + btoa(Utils.urlEncode2Latin1(svg));

    await new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = reject;
      img.src = svgDataUrl;
    });
    return canvas;
  }
  loadTemplate(template) {
    const templates = {
      flowchart: `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
    E --> F[完成]`,
      sequence: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 发送请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 响应请求`,
      class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
      state: `stateDiagram-v2
    [*] --> 待机
    待机 --> 运行: 启动
    运行 --> 暂停: 暂停
    暂停 --> 运行: 恢复
    运行 --> 停止: 停止
    停止 --> [*]`,
      gantt: `gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 设计阶段
    需求分析    :done, des1, 2024-01-01, 2024-01-07
    系统设计    :active, des2, 2024-01-08, 2024-01-15
    section 开发阶段
    编码实现    :dev1, 2024-01-16, 2024-01-30
    测试调试    :dev2, 2024-01-31, 2024-02-15`,
    };

    const templateCode = templates[template];
    if (templateCode) {
      this.pg.editor.editor.setValue(templateCode);
      this.renderMermaid();
    }
  }
  async exportDiagram(format) {
    const code = this.pg.editor.editor.getValue().trim();

    if (!code) {
      alert('请先输入 Mermaid 代码');
      return;
    }

    try {
      let dataUrl;
      let filename;

      if (format === 'svg') {
        const { svg } = await mermaid.render('export-diagram', code);
        dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        filename = 'mermaid-diagram.svg';
      } else if (format === 'png') {
        const { svg } = await mermaid.render('export-diagram', code);
        const canvas = await this.svgToCanvas(svg);
        dataUrl = canvas.toDataURL('image/png');

        filename = 'mermaid-diagram.png';
      } else if (format === 'copy') {
        const { svg } = await mermaid.render('export-diagram', code);
        // 复制SVG到剪贴板
        await navigator.clipboard.writeText(svg);
        alert('SVG 已复制到剪贴板！');
        return;
      } else if (format === 'copy-png') {
        const { svg } = await mermaid.render('export-diagram', code);
        // 解析 SVG 获取尺寸信息
        const canvas = await this.svgToCanvas(svg);
        // 转为Blob并写入剪贴板
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new window.ClipboardItem({ 'image/png': blob }),
            ]);
            alert('PNG图片已复制到剪贴板！');
          } catch (err) {
            alert('复制PNG失败：' + err.message);
          }
        }, 'image/png');
        return;
      }

      if (format === 'svg' || format === 'png') {
        // 下载文件
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('导出错误:', error);
      alert('导出失败: ' + error.message);
    }
  }
}
