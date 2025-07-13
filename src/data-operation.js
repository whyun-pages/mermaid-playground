import { Utils, defaultMermaidCode } from './util';
import mermaid from 'mermaid';
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
      this.createNew();
    });
    // 保存按钮
    const saveBtn = document.getElementById('save-btn');
    saveBtn.addEventListener('click', () => {
      this.upsert();
    });

    // 历史按钮
    const historyToggle = document.getElementById('history-toggle');
    const historyDropdown = document.getElementById('history-dropdown');
    const historySelector = document.querySelector('.history-selector');

    historyToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      Utils.toggleDropdown(historyDropdown);
      historySelector.classList.toggle('active');
      if (historySelector.classList.contains('active')) {
        this.updateHistoryDropdown();
      }
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
      //   this.mermaid.renderMermaid();
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

  async updateHistoryDropdown() {
    const historyDropdown = document.getElementById('history-dropdown');
    const dropdownContent = historyDropdown.querySelector('.dropdown-content');

    if (this.savedCodes.size === 0) {
      dropdownContent.innerHTML =
        '<div class="history-empty"><div class="empty-text">暂无保存的代码</div></div>';
      return;
    }

    dropdownContent.innerHTML = [...this.savedCodes.values()]
      .reverse()
      .map(
        (code) => `
            <div class="history-item" data-id="${code.id}">
                <div class="history-name">${code.name}</div>
                <div class="history-preview">
                    ${code.preview || '<div style="color: var(--text-secondary); font-size: 0.75rem;">预览生成中...</div>'}
                </div>
            </div>
        `,
      )
      .join('');

    dropdownContent.querySelectorAll('.history-item').forEach(async (item) => {
      item.addEventListener('click', () => {
        // 为每个历史项添加点击事件
        const id = item.dataset.id;
        this.loadSavedCode(id);
        Utils.hideDropdown(historyDropdown);
      });
      const code = this.savedCodes.get(Number(item.dataset.id));
      if (code && code.id) {
        try {
          const { svg } = await mermaid.render(
            'history-preview-' + code.id,
            code.code,
          );
          item.querySelector('.history-preview').innerHTML = svg;
        } catch (error) {
          console.error('render history item error', error);
        }
      }
    });
  }
}
