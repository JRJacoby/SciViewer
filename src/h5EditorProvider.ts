import * as vscode from 'vscode';
import { runH5Reader } from './pythonRunner';

export class H5EditorProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'sciViewer.h5';

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new H5EditorProvider(context);
    return vscode.window.registerCustomEditorProvider(
      H5EditorProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    );
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  async openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose: () => {} };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    webviewPanel.webview.options = { enableScripts: true };
    webviewPanel.webview.html = this.getHtmlContent();

    const result = await runH5Reader(
      this.context.extensionPath,
      document.uri.fsPath
    );
    webviewPanel.webview.postMessage({ type: 'data', payload: result });
  }

  private getHtmlContent(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --indent: 16px;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
      flex-shrink: 0;
    }

    header h1 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    header button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      padding: 4px 8px;
      cursor: pointer;
      border-radius: 3px;
      font-size: 14px;
    }

    header button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #tree-panel {
      flex: 1;
      overflow: auto;
      padding: 8px;
    }

    .tree-node {
      padding: 4px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 3px;
      user-select: none;
    }

    .tree-node:hover {
      background: var(--vscode-list-hoverBackground);
    }

    .tree-node.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }

    .tree-node .arrow {
      width: 14px;
      font-size: 10px;
      color: var(--vscode-foreground);
      text-align: center;
      flex-shrink: 0;
    }

    .tree-node .icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .tree-node .name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tree-node .meta {
      color: var(--vscode-descriptionForeground);
      font-size: 0.85em;
      flex-shrink: 0;
    }

    .tree-node .badge {
      color: var(--vscode-descriptionForeground);
      font-size: 0.75em;
      background: var(--vscode-badge-background);
      padding: 1px 5px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .children {
      overflow: hidden;
    }

    .children.collapsed {
      display: none;
    }

    #detail-panel {
      border-top: 1px solid var(--vscode-panel-border);
      padding: 12px 16px;
      max-height: 40%;
      overflow: auto;
      background: var(--vscode-sideBar-background);
      flex-shrink: 0;
    }

    #detail-panel h2 {
      margin: 0 0 12px 0;
      font-size: 13px;
      font-family: var(--vscode-editor-font-family);
      color: var(--vscode-textLink-foreground);
      word-break: break-all;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4px 12px;
      margin-bottom: 12px;
    }

    .detail-grid dt {
      color: var(--vscode-descriptionForeground);
      font-size: 0.9em;
    }

    .detail-grid dd {
      margin: 0;
      font-family: var(--vscode-editor-font-family);
    }

    #detail-preview {
      margin-top: 12px;
    }

    #detail-preview h3 {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      font-weight: normal;
    }

    #detail-preview code {
      display: block;
      background: var(--vscode-textCodeBlock-background);
      padding: 8px 12px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 150px;
      overflow: auto;
    }

    #detail-attrs {
      margin-top: 12px;
    }

    #detail-attrs h3 {
      margin: 0 0 6px 0;
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      font-weight: normal;
    }

    #detail-attrs ul {
      margin: 0;
      padding-left: 20px;
      font-size: 0.9em;
    }

    #detail-attrs li {
      margin: 2px 0;
    }

    .hidden { display: none !important; }
    .muted { color: var(--vscode-descriptionForeground); }

    #loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--vscode-descriptionForeground);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--vscode-descriptionForeground);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    #error {
      padding: 16px;
      color: var(--vscode-errorForeground);
      background: var(--vscode-inputValidation-errorBackground);
      border-radius: 4px;
      margin: 16px;
      white-space: pre-wrap;
      font-family: var(--vscode-editor-font-family);
    }
  </style>
</head>
<body>
  <header>
    <h1>SciViewer</h1>
  </header>

  <main class="hidden">
    <section id="tree-panel">
      <div id="tree"></div>
    </section>

    <section id="detail-panel" class="hidden">
      <h2 id="detail-path"></h2>
      <div class="detail-grid">
        <dt>Shape</dt>
        <dd id="detail-shape"></dd>
        <dt>Dtype</dt>
        <dd id="detail-dtype"></dd>
      </div>
      <div id="detail-attrs"></div>
      <div id="detail-preview">
        <h3>Preview</h3>
        <code id="detail-data"></code>
      </div>
    </section>
  </main>

  <div id="loading">
    <div class="spinner"></div>
    <span>Loading...</span>
  </div>

  <div id="error" class="hidden"></div>

  <script>
    const vscode = acquireVsCodeApi();
    let selectedNode = null;

    function renderNode(node, depth = 0) {
      const isGroup = node.type === 'group';
      const hasChildren = isGroup && node.children && node.children.length > 0;

      const wrapper = document.createElement('div');
      wrapper.className = 'node-wrapper';

      const div = document.createElement('div');
      div.className = 'tree-node' + (isGroup ? ' group' : ' dataset');
      div.style.paddingLeft = (depth * 16 + 8) + 'px';

      if (isGroup) {
        const attrCount = Object.keys(node.attrs || {}).length;
        div.innerHTML = 
          '<span class="arrow">' + (hasChildren ? '▶' : '') + '</span>' +
          '<span class="icon">📁</span>' +
          '<span class="name">' + escapeHtml(node.name) + '</span>' +
          (attrCount > 0 ? '<span class="badge">' + attrCount + ' attr' + (attrCount > 1 ? 's' : '') + '</span>' : '');

        if (hasChildren) {
          const childContainer = document.createElement('div');
          childContainer.className = 'children collapsed';
          node.children.forEach(function(child) {
            childContainer.appendChild(renderNode(child, depth + 1));
          });
          wrapper.appendChild(div);
          wrapper.appendChild(childContainer);

          div.addEventListener('click', function(e) {
            e.stopPropagation();
            const arrow = div.querySelector('.arrow');
            const isCollapsed = childContainer.classList.toggle('collapsed');
            arrow.textContent = isCollapsed ? '▶' : '▼';
          });
        } else {
          wrapper.appendChild(div);
        }
      } else {
        const shapeStr = node.shape && node.shape.length > 0 
          ? '[' + node.shape.join(', ') + ']' 
          : 'scalar';
        div.innerHTML = 
          '<span class="arrow"></span>' +
          '<span class="icon">📊</span>' +
          '<span class="name">' + escapeHtml(node.name) + '</span>' +
          '<span class="meta">' + shapeStr + ' ' + escapeHtml(node.dtype || '') + '</span>';

        div.addEventListener('click', function(e) {
          e.stopPropagation();
          selectDataset(div, node);
        });

        wrapper.appendChild(div);
      }

      return wrapper;
    }

    function selectDataset(element, node) {
      if (selectedNode) {
        selectedNode.classList.remove('selected');
      }
      selectedNode = element;
      element.classList.add('selected');

      document.getElementById('detail-panel').classList.remove('hidden');
      document.getElementById('detail-path').textContent = node.path;
      
      const shapeStr = node.shape && node.shape.length > 0 
        ? '[' + node.shape.join(', ') + ']' 
        : 'scalar';
      document.getElementById('detail-shape').textContent = shapeStr;
      document.getElementById('detail-dtype').textContent = node.dtype || 'unknown';

      const attrs = Object.entries(node.attrs || {});
      const attrsEl = document.getElementById('detail-attrs');
      if (attrs.length > 0) {
        attrsEl.innerHTML = '<h3>Attributes</h3><ul>' + 
          attrs.map(function(pair) {
            return '<li><strong>' + escapeHtml(pair[0]) + ':</strong> ' + escapeHtml(JSON.stringify(pair[1])) + '</li>';
          }).join('') + '</ul>';
        attrsEl.classList.remove('hidden');
      } else {
        attrsEl.innerHTML = '';
        attrsEl.classList.add('hidden');
      }

      let preview;
      if (Array.isArray(node.preview)) {
        preview = node.preview.map(function(v) {
          if (typeof v === 'number') {
            return Number.isInteger(v) ? v : v.toPrecision(6);
          }
          return JSON.stringify(v);
        }).join(', ');
      } else if (node.preview !== undefined) {
        preview = String(node.preview);
      } else {
        preview = '(no preview available)';
      }
      document.getElementById('detail-data').textContent = preview;
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') return str;
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    window.addEventListener('message', function(event) {
      var message = event.data;

      if (message.type === 'data') {
        document.getElementById('loading').classList.add('hidden');

        if (message.payload.error) {
          document.getElementById('error').textContent = message.payload.error;
          document.getElementById('error').classList.remove('hidden');
        } else {
          document.querySelector('main').classList.remove('hidden');
          var tree = document.getElementById('tree');
          tree.innerHTML = '';
          tree.appendChild(renderNode(message.payload));
          
          // Auto-expand root
          var firstGroup = document.querySelector('.tree-node.group');
          if (firstGroup) {
            firstGroup.click();
          }
        }
      }
    });
  </script>
</body>
</html>
    `;
  }
}
