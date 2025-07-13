import { Monaco } from './monaco';
import { Mermaid } from './mermaid';
import { DataOperation } from './data-operation';
import { Settings } from './settings';

export class MermaidPlayground {
  constructor() {
    this.settings = new Settings();
    this.mermaid = new Mermaid({ pg: this });
    this.editor = new Monaco({
      onChange: () => {
        this.mermaid.renderMermaid();
      },
    });
    this.dataOperation = new DataOperation({
      editor: this.editor,
      mermaid: this.mermaid,
      settings: this.settings,
    });

    this.init();
  }

  init() {
    this.initEventListeners();
  }

  initEventListeners() {
    // 点击外部关闭下拉菜单
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown').forEach((dropdown) => {
        dropdown.classList.add('hidden');
      });
      document
        .querySelectorAll('.template-selector')
        .forEach((templateSelector) => {
          templateSelector.classList.remove('active');
        });

    });
  }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  window.__mp = new MermaidPlayground();
});
