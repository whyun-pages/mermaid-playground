import mermaid from 'mermaid';
export const defaultMermaidCode = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
    E --> F[完成]`;
export class Utils {
  static #isMermaidInitialized = false;
  static initMermaid() {
    if (this.#isMermaidInitialized) {
      return;
    }
    this.#isMermaidInitialized = true;
    const defaultConfig = {
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35,
        mirrorActors: true,
        bottomMarginAdj: 1,
        rightAngles: false,
        showSequenceNumbers: false,
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        rightPadding: 20,
        topPadding: 50,
        bottomPadding: 20,
        titleTopMargin: 25,
        barHeight: 20,
        barGap: 4,
        gridLineStartPadding: 35,
        fontSize: 11,
        fontFamily: '"Open-Sans", "sans-serif"',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d',
      },
    };
    // 初始化 Mermaid
    mermaid.initialize(defaultConfig);
  }
  static getSiblings(element) {
    const parent = element.parentNode;
    return Array.from(parent.children).filter((child) => child !== element);
  }
  /**
   * @param {HTMLElement} dropdown
   */
  static toggleDropdown(dropdown) {
    const isHidden = dropdown.classList.contains('hidden');

    // 隐藏所有下拉菜单
    // Utils.getSiblings(dropdown).forEach((d) => d.classList.add('hidden'));

    // 显示当前下拉菜单
    if (isHidden) {
      dropdown.classList.remove('hidden');
    } else {
      dropdown.classList.add('hidden');
    }
  }

  static hideDropdown(dropdown) {
    dropdown.classList.add('hidden');
  }
  static urlEncode2Latin1(str) {
    return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode('0x' + p1),
    );
  }
  // 处理不同浏览器的兼容性
  static requestFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      // Safari
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      // Firefox
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      // IE/Edge
      element.msRequestFullscreen();
    }
  }

  static exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}
