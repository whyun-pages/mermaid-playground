import * as monaco from 'monaco-editor';
import mermaid from 'mermaid';
const defaultConfig = {
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Arial, sans-serif',
    fontSize: 16,
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
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
        useMaxWidth: true,
        rightAngles: false,
        showSequenceNumbers: false
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
        topPadding: 50,
        leftPadding: 75,
        gridLineStartPadding: 35,
        fontSize: 11,
        fontFamily: '"Open-Sans", "sans-serif"',
        numberSectionStyles: 4,
        axisFormat: '%Y-%m-%d'
    }
}
// 初始化 Mermaid
mermaid.initialize(defaultConfig);

// 默认的 Mermaid 示例代码
const defaultMermaidCode = `graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作1]
    B -->|否| D[执行操作2]
    C --> E[结束]
    D --> E
    E --> F[完成]`;

class MermaidPlayground {
    constructor() {
        this.editor = null;
        this.currentTheme = 'default';
        this.renderTimeout = null;
        this.init();
    }

    init() {
        this.initMonacoEditor();
        this.initEventListeners();
        this.loadTheme();
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
                    [/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|quadrantChart|requirement|gitgraph|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)\b/, 'keyword'],
                    // 方向
                    [/(TD|TB|BT|RL|LR)\b/, 'keyword'],
                    // 条件分支
                    [/\|[^|]+\|/, 'type.condition'],
                    // 节点类型（区分不同括号）
                    [/[A-Za-z_][\w-]*/,'type.node'], // 节点名
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
                    [/(subgraph|end|classDef|style|linkStyle|click|section|title|dateFormat)\b/, 'keyword'],
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
                    [/\s+/, 'white']
                ]
            }
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
                { token: 'bracket.curly.open', foreground: 'b8860b', fontStyle: 'bold' },
                { token: 'bracket.curly.close', foreground: 'b8860b', fontStyle: 'bold' },
                { token: 'bracket.paren.double.open', foreground: '800080', fontStyle: 'bold' },
                { token: 'bracket.paren.double.close', foreground: '800080', fontStyle: 'bold' },
                { token: 'bracket.paren.open', foreground: '4682b4', fontStyle: 'bold' },
                { token: 'bracket.paren.close', foreground: '4682b4', fontStyle: 'bold' },
                { token: 'type.doublebracket', foreground: '008b8b', fontStyle: 'bold' },
                { token: 'type.doubleparen', foreground: '800080', fontStyle: 'bold' },
                { token: 'type.brace', foreground: 'b8860b', fontStyle: 'bold' },
                { token: 'type.bracket', foreground: '008800', fontStyle: 'bold' },
                { token: 'type.paren', foreground: '4682b4', fontStyle: 'bold' },
                { token: 'string', foreground: '008800' },
                { token: 'comment', foreground: '008000', fontStyle: 'italic' },
                { token: 'number', foreground: '0000ff' },
                { token: 'identifier', foreground: '000000' },
                { token: 'delimiter', foreground: '000000' },
                { token: 'white', foreground: '000000' }
            ],
            colors: {
                'editor.background': '#f8fafc',
                'editor.foreground': '#1e293b'
            }
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
                { token: 'bracket.curly.open', foreground: 'ffd700', fontStyle: 'bold' },
                { token: 'bracket.curly.close', foreground: 'ffd700', fontStyle: 'bold' },
                { token: 'bracket.paren.double.open', foreground: 'c586c0', fontStyle: 'bold' },
                { token: 'bracket.paren.double.close', foreground: 'c586c0', fontStyle: 'bold' },
                { token: 'bracket.paren.open', foreground: '82aaff', fontStyle: 'bold' },
                { token: 'bracket.paren.close', foreground: '82aaff', fontStyle: 'bold' },
                { token: 'type.doublebracket', foreground: '00ced1', fontStyle: 'bold' },
                { token: 'type.doubleparen', foreground: 'c586c0', fontStyle: 'bold' },
                { token: 'type.brace', foreground: 'ffd700', fontStyle: 'bold' },
                { token: 'type.bracket', foreground: '50fa7b', fontStyle: 'bold' },
                { token: 'type.paren', foreground: '82aaff', fontStyle: 'bold' },
                { token: 'string', foreground: 'ce9178' },
                { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
                { token: 'number', foreground: 'b5cea8' },
                { token: 'identifier', foreground: 'd4d4d4' },
                { token: 'delimiter', foreground: 'd4d4d4' },
                { token: 'white', foreground: 'd4d4d4' }
            ],
            colors: {
                'editor.background': '#1e293b',
                'editor.foreground': '#f1f5f9'
            }
        });

        // 创建编辑器实例
        this.editor = monaco.editor.create(document.getElementById('editor'), {
            value: defaultMermaidCode,
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
                horizontal: 'visible'
            },
            wordWrap: 'on'
        });

        // 监听编辑器内容变化
        this.editor.onDidChangeModelContent(() => {
            this.debounceRender();
        });

        // 初始渲染
        // this.renderMermaid();
    }

    initEventListeners() {
        // 主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        const themeDropdown = document.getElementById('theme-dropdown');
        
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(themeDropdown);
        });

        // 导出按钮
        const exportBtn = document.getElementById('export-btn');
        const exportDropdown = document.getElementById('export-dropdown');
        
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(exportDropdown);
        });

        // 主题选择
        themeDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const theme = e.target.dataset.theme;
                this.changeTheme(theme);
                this.hideDropdown(themeDropdown);
            }
        });

        // 导出选择
        exportDropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                const format = e.target.dataset.format;
                this.exportDiagram(format);
                this.hideDropdown(exportDropdown);
            }
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', () => {
            this.hideDropdown(themeDropdown);
            this.hideDropdown(exportDropdown);
        });
    }

    toggleDropdown(dropdown) {
        const isHidden = dropdown.classList.contains('hidden');
        
        // 隐藏所有下拉菜单
        document.querySelectorAll('.dropdown').forEach(d => d.classList.add('hidden'));
        
        // 显示当前下拉菜单
        if (isHidden) {
            dropdown.classList.remove('hidden');
        }
    }

    hideDropdown(dropdown) {
        dropdown.classList.add('hidden');
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        
        // 只更新 Mermaid 主题
        mermaid.initialize({
            theme: theme,
        });

        // 保存主题设置
        localStorage.setItem('mermaid-theme', theme);

        // 重新渲染图表
        this.renderMermaid();
        // this.debounceRender();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('mermaid-theme');
        if (savedTheme) {
            this.changeTheme(savedTheme);
        }
    }

    debounceRender() {
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        this.renderTimeout = setTimeout(() => {
            this.renderMermaid();
        }, 500);
    }

    async renderMermaid() {
        const renderArea = document.getElementById('render-area');
        const code = this.editor.getValue().trim();

        if (!code) {
            renderArea.innerHTML = '<div class="placeholder">在左侧输入 Mermaid 代码，这里将显示渲染结果</div>';
            return;
        }

        try {
            // 显示加载状态
            renderArea.innerHTML = '<div class="placeholder"><div class="loading"></div> 正在渲染...</div>';

            // 使用动态ID避免缓存问题
            const diagramId = `mermaid-diagram`;
            
            // 渲染 Mermaid 图表
            const { svg } = await mermaid.render(diagramId, code);
            
            renderArea.innerHTML = svg;
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
    urlEncode2Latin1(str) {
        return encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode('0x' + p1));
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
            height =  h + 40;
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
        const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(this.urlEncode2Latin1(svg));
        
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

    async exportDiagram(format) {
        const code = this.editor.getValue().trim();
        
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
                            new window.ClipboardItem({ 'image/png': blob })
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

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    new MermaidPlayground();
}); 