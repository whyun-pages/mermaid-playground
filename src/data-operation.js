import { Utils, defaultMermaidCode } from './util';
import mermaid from 'mermaid';

export class DataOperation {
  constructor({ editor, mermaid, settings }) {
    this.editor = editor;
    this.mermaid = mermaid;
    this.settings = settings;
    this.savedCodes = new Map();
    Utils.initMermaid();
    this.addEventListeners();
    this.loadAll();
  }
  addEventListeners() {
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
      const firstCode = this.savedCodes.values().next().value;
      this.name = firstCode.name;
      this.editor.editor.setValue(firstCode.code);
    } else {
      this.savedCodes = new Map();
      this.name = '未命名';
      this.editor.editor.setValue(defaultMermaidCode);
    }
  }

  setName(name) {
    this.name = name;
    // localStorage.setItem('name', name);
    const nameElement = document.querySelector('.name');
    if (nameElement) {
      nameElement.textContent = `${name}`;
    }
  }

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
      if (newName) {
        this.setName(newName);
      }
      nameElement.textContent = `${this.name}`;
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

  showSaveDialog() {
    const code = this.editor.editor.getValue().trim();
    if (!code) {
      alert('请先输入代码再保存');
      return;
    }

    const name = document.querySelector('.name').innerText;
    if (name && name.trim()) {
      this.saveCode(name.trim(), code);
      alert('代码已保存！');
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
