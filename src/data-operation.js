import { Utils, defaultMermaidCode } from './util';
import mermaid from 'mermaid';

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
      this.showSaveDialog();
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
  }

  async loadAll() {
    const db = await this.settings.getDB();
    const data = await db.getAll();
    if (data.length > 0) {
      this.savedCodes = new Map(data.map((item) => [item.id, item]));
      this.id = data[0].id;
      const firstCode = data[0].code;
      this.name = data[0].name;
      this.editor.editor.setValue(firstCode.code);
    } else {
      this.savedCodes = new Map();
      this.name = '未命名';
      this.editor.editor.setValue(defaultMermaidCode);
    }
  }
  createNew() {
    this.id = 0;
    // 清空编辑器内容
    this.editor.editor.setValue('');

    // // 重置缩放
    // this.scale = 1;

    // 清空渲染区域
    const renderArea = document.getElementById('svg-container');
    renderArea.innerHTML =
      '<div class="placeholder">在左侧输入 Mermaid 代码，这里将显示渲染结果</div>';

    // 重置主题为默认
    this.mermaid.changeTheme('default');

    // 更新用户名为"未命名"
    const nameElement = document.querySelector('.nav-user .name');
    if (nameElement) {
      nameElement.textContent = '未命名';
    }

    console.log('已创建新项目');
  }

  // setNameDom(name) {
  //   this.name = name;
  //   // localStorage.setItem('name', name);
  //   const nameElement = document.querySelector('.name');
  //   if (nameElement) {
  //     nameElement.textContent = `${name}`;
  //   }
  // }

  initName() {
    const nameElement = document.querySelector('.name');
    if (nameElement) {
      nameElement.textContent = `${this.name}`;
    }
  }

  editName() {
    const nameElement = document.querySelector('.name');
    if (!nameElement) return;

    // const currentText = nameElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.name;
    input.style.cssText = `
            font-size: var(--font-size-sm);
            color: var(--text-secondary);
            font-weight: 500;
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-sm);
            padding: 2px 6px;
            background: var(--background-color);
            outline: none;
        `;

    nameElement.textContent = '';
    nameElement.appendChild(input);
    input.focus();
    // input.select();

    const handleSubmit = () => {
      const newName = input.value.trim();
      this.name = newName;
      nameElement.textContent = `${this.name}`;
      if (!this.id) {
        this.saveCode(this.name, this.editor.editor.getValue());
      }
    };

    const handleBlur = () => {
      handleSubmit();
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        nameElement.textContent = `${this.name}`;
      }
    };

    input.addEventListener('blur', handleBlur);
    input.addEventListener('keypress', handleKeyPress);
  }

  async showSaveDialog() {
    const code = this.editor.editor.getValue().trim();
    if (!code) {
      alert('请先输入代码再保存');
      return;
    }

    const name = document.querySelector('.name').innerText;
    if (name && name.trim()) {
      try {
        await this.saveCode(name.trim(), code);
        alert('代码已保存！');
      } catch (error) {
        alert('保存失败：' + error.message);
      }
    }
  }

  async saveCode(name, code) {
    const db = await this.settings.getDB();
    const data = await db.add({
      name: name,
      code: code,
    });
    console.log(data);
    this.savedCodes.set(data.id, data);
    // const timestamp = Date.now();
    // const newCode = {
    //   id: timestamp,
    //   name: name,
    //   code: code,
    //   timestamp: timestamp,
    //   preview: null, // 稍后会生成预览
    // };

    // this.savedCodes.unshift(newCode); // 添加到开头
    // localStorage.setItem('saved-codes', JSON.stringify(this.savedCodes));
    // this.updateHistoryDropdown();

    // 异步生成预览

    // newCode.preview = document.querySelector('.render-area').innerHTML;
    // localStorage.setItem('saved-codes', JSON.stringify(this.savedCodes));
    // this.updateHistoryDropdown();
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
      if (code) {
        const { svg } = await mermaid.render(code.id, code.code);
        item.querySelector('.history-preview').innerHTML = svg;
      }
    });
  }
}
