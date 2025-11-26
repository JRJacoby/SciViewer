import { Viewer } from './types';

export const tableViewer: Viewer = {
  getHtml(): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
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
      overflow: auto;
      padding: 16px;
    }

    section {
      margin-bottom: 24px;
    }

    section h2 {
      margin: 0 0 12px 0;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      letter-spacing: 0.5px;
    }

    .summary-grid {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
    }

    .summary-item .label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      text-transform: uppercase;
    }

    .summary-item .value {
      font-size: 18px;
      font-weight: 600;
      font-family: var(--vscode-editor-font-family);
    }

    .schema-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 200px;
      overflow: auto;
    }

    .schema-item {
      display: flex;
      gap: 16px;
      padding: 4px 8px;
      background: var(--vscode-textCodeBlock-background);
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
    }

    .schema-item .col-name {
      min-width: 200px;
      color: var(--vscode-textLink-foreground);
    }

    .schema-item .col-type {
      color: var(--vscode-descriptionForeground);
    }

    .preview-table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
    }

    .preview-table th,
    .preview-table td {
      padding: 6px 12px;
      text-align: left;
      border: 1px solid var(--vscode-panel-border);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .preview-table th {
      background: var(--vscode-sideBar-background);
      font-weight: 600;
      position: sticky;
      top: 0;
    }

    .preview-table tr:hover td {
      background: var(--vscode-list-hoverBackground);
    }

    .table-container {
      overflow: auto;
      max-height: 400px;
    }

    .hidden { display: none !important; }

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
    <button id="refresh" title="Refresh">↻</button>
  </header>

  <main class="hidden">
    <section id="summary-section">
      <h2>Summary</h2>
      <div class="summary-grid" id="summary"></div>
    </section>

    <section id="schema-section">
      <h2>Schema</h2>
      <div class="schema-list" id="schema"></div>
    </section>

    <section id="preview-section">
      <h2>Preview (first 10 rows)</h2>
      <div class="table-container">
        <table class="preview-table" id="preview"></table>
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

    function formatNumber(num) {
      return num.toLocaleString();
    }

    function escapeHtml(str) {
      if (typeof str !== 'string') return String(str);
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function renderSummary(summary) {
      const el = document.getElementById('summary');
      el.innerHTML = [
        { label: 'Rows', value: formatNumber(summary.rows) },
        { label: 'Columns', value: formatNumber(summary.columns) },
        { label: 'Row Groups', value: formatNumber(summary.row_groups) },
        { label: 'Size', value: summary.size_mb + ' MB' },
        { label: 'Compression', value: summary.compression },
      ].map(item => 
        '<div class="summary-item">' +
          '<span class="label">' + item.label + '</span>' +
          '<span class="value">' + item.value + '</span>' +
        '</div>'
      ).join('');
    }

    function renderSchema(schema) {
      const el = document.getElementById('schema');
      el.innerHTML = schema.map(col =>
        '<div class="schema-item">' +
          '<span class="col-name">' + escapeHtml(col.name) + '</span>' +
          '<span class="col-type">' + escapeHtml(col.dtype) + '</span>' +
        '</div>'
      ).join('');
    }

    function renderPreview(schema, preview) {
      const el = document.getElementById('preview');
      
      const columns = schema.map(s => s.name);
      
      const thead = '<thead><tr>' + 
        columns.map(col => '<th>' + escapeHtml(col) + '</th>').join('') + 
        '</tr></thead>';
      
      const tbody = '<tbody>' + 
        preview.map(row => 
          '<tr>' + columns.map(col => {
            let val = row[col];
            if (val === null || val === undefined) {
              val = '<span style="color: var(--vscode-descriptionForeground)">null</span>';
            } else {
              val = escapeHtml(val);
            }
            return '<td title="' + escapeHtml(String(row[col])) + '">' + val + '</td>';
          }).join('') + '</tr>'
        ).join('') + 
        '</tbody>';
      
      el.innerHTML = thead + tbody;
    }

    document.getElementById('refresh').addEventListener('click', function() {
      vscode.postMessage({ type: 'refresh' });
    });

    window.addEventListener('message', function(event) {
      var message = event.data;

      if (message.type === 'loading') {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');
        document.querySelector('main').classList.add('hidden');
      }

      if (message.type === 'data') {
        document.getElementById('loading').classList.add('hidden');

        if (message.payload.error) {
          document.getElementById('error').textContent = message.payload.error;
          document.getElementById('error').classList.remove('hidden');
          document.querySelector('main').classList.add('hidden');
        } else {
          document.getElementById('error').classList.add('hidden');
          document.querySelector('main').classList.remove('hidden');
          
          renderSummary(message.payload.summary);
          renderSchema(message.payload.schema);
          renderPreview(message.payload.schema, message.payload.preview);
        }
      }
    });
  </script>
</body>
</html>
    `;
  }
};

