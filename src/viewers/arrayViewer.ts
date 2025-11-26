import { Viewer } from './types';

export const arrayViewer: Viewer = {
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

    .info-grid {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 8px 16px;
      margin-bottom: 24px;
    }

    .info-grid dt {
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
      text-transform: uppercase;
    }

    .info-grid dd {
      margin: 0;
      font-family: var(--vscode-editor-font-family);
      font-size: 14px;
    }

    section h2 {
      margin: 0 0 12px 0;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
      letter-spacing: 0.5px;
    }

    .preview {
      background: var(--vscode-textCodeBlock-background);
      padding: 12px 16px;
      border-radius: 4px;
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
      overflow: auto;
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
    <dl class="info-grid">
      <dt>Shape</dt>
      <dd id="shape"></dd>
      <dt>Dtype</dt>
      <dd id="dtype"></dd>
      <dt>Size</dt>
      <dd id="size"></dd>
    </dl>

    <section>
      <h2>Preview (first 20 elements)</h2>
      <div class="preview" id="preview"></div>
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
          
          var data = message.payload;
          document.getElementById('shape').textContent = '[' + data.shape.join(', ') + ']';
          document.getElementById('dtype').textContent = data.dtype;
          document.getElementById('size').textContent = formatNumber(data.size) + ' elements';
          
          var previewStr = data.preview.map(function(v) {
            if (typeof v === 'number') {
              return Number.isInteger(v) ? v : v.toPrecision(6);
            }
            return String(v);
          }).join(', ');
          document.getElementById('preview').textContent = previewStr;
        }
      }
    });
  </script>
</body>
</html>
    `;
  }
};

