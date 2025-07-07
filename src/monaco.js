import * as monaco from 'monaco-editor';
// 默认的 Mermaid 示例代码

export class Monaco {
  constructor({ onChange }) {
    this.initMonacoEditor();
    this.onChange = onChange;
  }
  initMonacoEditor() {
    // 配置 Monaco 编辑器
    // 1. 注册 mermaid 语言
    monaco.languages.register({ id: 'mermaid' });

    // 2. 定义完整的 Mermaid 语法高亮规则
    monaco.languages.setMonarchTokensProvider('mermaid', {
      defaultToken: '',
      ignoreCase: false,
      tokenizer: {
        root: [
          // 图表类型
          [
            /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|quadrantChart|requirement|gitgraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)\b/,
            'keyword',
          ],
          // 方向
          [/(TD|TB|BT|RL|LR)\b/, 'keyword'],
          // 条件分支
          [/\|[^|]+\|/, 'type.condition'],
          // 节点类型（区分不同括号）
          [/[A-Za-z_][\w-]*/, 'type.node'], // 节点名
          // 中括号、花括号、圆括号高亮
          [/\[\[|\]\]/, 'bracket.double'],
          [/\[|\]/, 'bracket.square'],
          [/\{/, 'bracket.curly.open'],
          [/\}/, 'bracket.curly.close'],
          [/\(\(/, 'bracket.paren.double.open'],
          [/\)\)/, 'bracket.paren.double.close'],
          [/\(/, 'bracket.paren.open'],
          [/\)/, 'bracket.paren.close'],
          // 箭头
          [/-->|-.->|==>|--x|-.x|==x|--o|-.o|==o|--|==|\.\./, 'operator'],
          // 注释
          [/%%[^\n]*/, 'comment'],
          [/\/\/[^\n]*/, 'comment'],
          // 关键字
          [
            /(subgraph|end|classDef|style|linkStyle|click|section|title|dateFormat)\b/,
            'keyword',
          ],
          // 字符串
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
          // 数字
          [/\d+/, 'number'],
          // 标识符
          [/[A-Za-z_][\w-]*/, 'identifier'],
          // 分隔符
          [/[;,]/, 'delimiter'],
          // 空白
          [/\s+/, 'white'],
        ],
      },
    });

    monaco.editor.defineTheme('mermaid-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000ff', fontStyle: 'bold' },
        { token: 'operator', foreground: 'ff6600', fontStyle: 'bold' },
        { token: 'type.node', foreground: '1e90ff', fontStyle: 'bold' },
        { token: 'type.condition', foreground: 'b400b4', fontStyle: 'bold' },
        { token: 'bracket.double', foreground: '00bfff', fontStyle: 'bold' },
        { token: 'bracket.square', foreground: '008800', fontStyle: 'bold' },
        {
          token: 'bracket.curly.open',
          foreground: 'b8860b',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.curly.close',
          foreground: 'b8860b',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.double.open',
          foreground: '800080',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.double.close',
          foreground: '800080',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.open',
          foreground: '4682b4',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.close',
          foreground: '4682b4',
          fontStyle: 'bold',
        },
        {
          token: 'type.doublebracket',
          foreground: '008b8b',
          fontStyle: 'bold',
        },
        { token: 'type.doubleparen', foreground: '800080', fontStyle: 'bold' },
        { token: 'type.brace', foreground: 'b8860b', fontStyle: 'bold' },
        { token: 'type.bracket', foreground: '008800', fontStyle: 'bold' },
        { token: 'type.paren', foreground: '4682b4', fontStyle: 'bold' },
        { token: 'string', foreground: '008800' },
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'number', foreground: '0000ff' },
        { token: 'identifier', foreground: '000000' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'white', foreground: '000000' },
      ],
      colors: {
        'editor.background': '#f8fafc',
        'editor.foreground': '#1e293b',
      },
    });

    monaco.editor.defineTheme('mermaid-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'operator', foreground: 'ffb86c', fontStyle: 'bold' },
        { token: 'type.node', foreground: '00eaff', fontStyle: 'bold' },
        { token: 'type.condition', foreground: 'ff79c6', fontStyle: 'bold' },
        { token: 'bracket.double', foreground: '00eaff', fontStyle: 'bold' },
        { token: 'bracket.square', foreground: '50fa7b', fontStyle: 'bold' },
        {
          token: 'bracket.curly.open',
          foreground: 'ffd700',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.curly.close',
          foreground: 'ffd700',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.double.open',
          foreground: 'c586c0',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.double.close',
          foreground: 'c586c0',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.open',
          foreground: '82aaff',
          fontStyle: 'bold',
        },
        {
          token: 'bracket.paren.close',
          foreground: '82aaff',
          fontStyle: 'bold',
        },
        {
          token: 'type.doublebracket',
          foreground: '00ced1',
          fontStyle: 'bold',
        },
        { token: 'type.doubleparen', foreground: 'c586c0', fontStyle: 'bold' },
        { token: 'type.brace', foreground: 'ffd700', fontStyle: 'bold' },
        { token: 'type.bracket', foreground: '50fa7b', fontStyle: 'bold' },
        { token: 'type.paren', foreground: '82aaff', fontStyle: 'bold' },
        { token: 'string', foreground: 'ce9178' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'identifier', foreground: 'd4d4d4' },
        { token: 'delimiter', foreground: 'd4d4d4' },
        { token: 'white', foreground: 'd4d4d4' },
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#f1f5f9',
      },
    });

    // 创建编辑器实例
    this.editor = monaco.editor.create(document.getElementById('editor'), {
      value: '',
      language: 'mermaid',
      theme: 'mermaid-light',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
      },
      wordWrap: 'on',
    });

    // 监听编辑器内容变化
    this.editor.onDidChangeModelContent(() => {
      this.onChange();
    });

    // 初始渲染
    // this.renderMermaid();
  }
}
