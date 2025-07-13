import { Utils, defaultMermaidCode } from './util';
import mermaid from 'mermaid';
import { getTemplate } from './templates';
const DEFAULT_NAME = '未命名';
export class DataOperation {
  constructor({ editor, mermaid, settings }) {
    /**
     * @type {import('./monaco').Monaco}
     */
    this.editor = editor;
    /**
     * @type {import('./mermaid').Mermaid}
     */
    this.mermaid = mermaid;
    /**
     * @type {import('./settings').Settings}
     */
    this.settings = settings;
    this.savedCodes = new Map();
    this.id = 0;
    Utils.initMermaid();
    this.addEventListeners();
    this.loadAll();
  }
  addEventListeners() {
    // 新建按钮
    const newBtn = document.getElementById('new-btn');
    newBtn.addEventListener('click', () => {
      this.showTemplateModal();
    });

    // 模板选择模态框
    this.initTemplateModal();
    // 初始化历史记录模态框
    this.initHistoryModal();
    // 保存按钮
    const saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener('click', () => {
      this.upsert();
    });

    // 历史按钮
    const historyToggle = document.getElementById('history-toggle');
    historyToggle.addEventListener('click', () => {
      this.showHistoryModal();
    });

    // 双击名称编辑
    const nameElement = document.querySelector('.name');
    if (nameElement) {
      nameElement.addEventListener('click', () => {
        this.editName();
      });
    }
    const navName = document.querySelector('.nav-name');
    const input = document.querySelector('.name-input');
    const handleSubmit = () => {
      navName.classList.remove('editing');
      const newName = input.value.trim();
      this.name = newName;
      this.setNameDom();
      this.upsert();
    };

    const handleBlur = () => {
      handleSubmit();
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        navName.classList.remove('editing');
      }
    };

    input.addEventListener('blur', handleBlur);
    input.addEventListener('keypress', handleKeyPress);
  }

  async loadAll() {
    const db = await this.settings.getDB();
    const data = await db.getAll();
    if (data.length > 0) {
      this.savedCodes = new Map(data.map((item) => [item.id, item]));
      this.id = data[0].id;
      this.name = data[0].name;
      this.editor.editor.setValue(data[0].code);
    } else {
      this.savedCodes = new Map();
      this.name = DEFAULT_NAME;
      this.editor.editor.setValue(defaultMermaidCode);
    }
    this.setNameDom();
  }
  createNew() {
    this.id = 0;
    // 清空编辑器内容
    this.editor.setValue('');

    // // 重置缩放
    // this.scale = 1;

    // 清空渲染区域
    const renderArea = document.getElementById('svg-container');
    renderArea.innerHTML =
      '<div class="placeholder">在左侧输入 Mermaid 代码，这里将显示渲染结果</div>';

    // 重置主题为默认
    this.mermaid.changeTheme('default');
    this.name = DEFAULT_NAME;
    this.setNameDom();

    console.log('已创建新项目');
  }

  setNameDom() {
    const nameElement = document.querySelector('.name');
    nameElement.textContent = `${this.name}`;
    const input = document.querySelector('.name-input');
    input.value = this.name;
  }

  editName() {
    const navName = document.querySelector('.nav-name');
    navName.classList.add('editing');

    const input = document.querySelector('.name-input');
    input.focus();
  }

  async upsert() {
    const code = this.editor.editor.getValue().trim();
    if (!code) {
      alert('请先输入代码再保存');
      return;
    }

    const name = document.querySelector('.name').innerText;
    if (!this.id) {
      try {
        await this.saveCode(name.trim(), code);
        alert('新建代码成功！');
      } catch (error) {
        alert('保存失败：' + error.message);
      }
    } else {
      try {
        await this.updateCode(name.trim(), code);
        alert('代码已更新！');
      } catch (error) {
        alert('更新失败：' + error.message);
      }
    }
  }

  async saveCode(name, code) {
    const db = await this.settings.getDB();
    const data = await db.add({
      name: name,
      code: code,
    });
    console.log('saveCode data', data);
    this.savedCodes.set(data.id, data);
  }

  async updateCode(name, code) {
    const db = await this.settings.getDB();
    await db.update(this.id, {
      name: name,
      code: code,
    });
  }

  loadSavedCode(id) {
    const savedCode = this.savedCodes.get(Number(id));
    if (savedCode) {
      this.editor.editor.setValue(savedCode.code);
      this.name = savedCode.name;
      this.setNameDom();
    }
  }

  async deleteSavedCode(id) {
    this.savedCodes = this.savedCodes.filter((code) => code.id !== id);
    // localStorage.setItem('saved-codes', JSON.stringify(this.savedCodes));
    const db = await this.settings.getDB();
    await db.delete(id);
    // this.updateHistoryDropdown();
    document.querySelector('.history-item[data-id="' + id + '"]').remove();
  }

  // 初始化模板选择模态框
  initTemplateModal() {
    const modal = document.getElementById('new-template-modal');
    const closeBtn = document.getElementById('close-template-modal');
    const templateCards = modal.querySelectorAll('.template-card');

    // 关闭模态框
    closeBtn.addEventListener('click', () => {
      this.hideTemplateModal();
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideTemplateModal();
      }
    });

    // 模板卡片点击事件
    templateCards.forEach((card) => {
      card.addEventListener('click', () => {
        const templateId = card.dataset.template;
        this.createFromTemplate(templateId);
      });
    });

    // 渲染模板预览图
    this.renderTemplatePreviews();
  }

  // 显示模板选择模态框
  showTemplateModal() {
    const modal = document.getElementById('new-template-modal');
    modal.classList.remove('hidden');
  }

  // 隐藏模板选择模态框
  hideTemplateModal() {
    const modal = document.getElementById('new-template-modal');
    modal.classList.add('hidden');
  }

  // 根据模板创建新项目
  createFromTemplate(templateId) {
    const template = getTemplate(templateId);
    if (!template) {
      console.error('模板不存在:', templateId);
      return;
    }

    // 创建新项目
    this.id = 0;
    this.name = DEFAULT_NAME;

    // 设置编辑器内容
    this.editor.setValue(template.code || '');

    // 清空渲染区域
    const renderArea = document.getElementById('svg-container');
    if (renderArea) {
      renderArea.innerHTML = template.code
        ? '<div class="placeholder">正在渲染...</div>'
        : '<div class="placeholder">在左侧输入 Mermaid 代码，这里将显示渲染结果</div>';
    }

    // 重置主题为默认
    this.mermaid.changeTheme('default');
    this.setNameDom();

    // 隐藏模态框
    this.hideTemplateModal();

    console.log('已从模板创建新项目:', template.name);
  }

  // 初始化历史记录模态框
  initHistoryModal() {
    const modal = document.getElementById('history-modal');
    const closeBtn = document.getElementById('close-history-modal');

    // 关闭模态框
    closeBtn.addEventListener('click', () => {
      this.hideHistoryModal();
    });

    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideHistoryModal();
      }
    });
  }

  // 显示历史记录模态框
  showHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.remove('hidden');
    this.updateHistoryGrid();
  }

  // 隐藏历史记录模态框
  hideHistoryModal() {
    const modal = document.getElementById('history-modal');
    modal.classList.add('hidden');
  }

  // 更新历史记录网格
  async updateHistoryGrid() {
    const historyGrid = document.getElementById('history-grid');

    if (this.savedCodes.size === 0) {
      historyGrid.innerHTML =
        '<div class="history-empty"><div class="empty-text">暂无保存的代码</div></div>';
      return;
    }

    historyGrid.innerHTML = [...this.savedCodes.values()]
      .reverse()
      .map(
        (code) => `
            <div class="history-card" data-id="${code.id}">
                <div class="history-preview">
                    <div style="color: var(--text-secondary); font-size: 0.75rem;">预览生成中...</div>
                </div>
                <div class="history-name">${code.name}</div>
                <div class="history-meta">ID: ${code.id}</div>
            </div>
        `,
      )
      .join('');

    // 为每个历史卡片添加点击事件和渲染预览
    historyGrid.querySelectorAll('.history-card').forEach(async (card) => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.id);
        this.loadSavedCode(id);
        this.hideHistoryModal();
      });

      const code = this.savedCodes.get(Number(card.dataset.id));
      if (code && code.id) {
        try {
          const { svg } = await mermaid.render(
            `history-preview-${code.id}`,
            code.code,
          );
          card.querySelector('.history-preview').innerHTML = svg;
        } catch (error) {
          console.error('render history card error', error);
          card.querySelector('.history-preview').innerHTML =
            '<div style="color: var(--text-secondary); font-size: 0.75rem;">预览生成失败</div>';
        }
      }
    });
  }

  // 渲染模板预览图
  async renderTemplatePreviews() {
    const templates = [
      { id: 'flowchart', previewId: 'flowchart-preview' },
      { id: 'sequence', previewId: 'sequence-preview' },
      { id: 'class', previewId: 'class-preview' },
      { id: 'state', previewId: 'state-preview' },
      { id: 'gantt', previewId: 'gantt-preview' },
    ];

    for (const template of templates) {
      const templateData = getTemplate(template.id);
      if (templateData && templateData.code) {
        try {
          const previewElement = document.getElementById(template.previewId);
          if (previewElement) {
            const { svg } = await mermaid.render(
              `template-preview-${template.id}`,
              templateData.code,
            );
            previewElement.innerHTML = svg;
          }
        } catch (error) {
          console.error(`渲染模板预览失败 ${template.id}:`, error);
          const previewElement = document.getElementById(template.previewId);
          if (previewElement) {
            previewElement.innerHTML =
              '<div style="color: var(--text-secondary); font-size: 0.75rem;">预览生成失败</div>';
          }
        }
      }
    }
  }
}
