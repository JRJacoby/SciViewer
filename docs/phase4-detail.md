# Phase 4: Webview UI (Detailed)

## Goal

Build an interactive tree UI that displays HDF5 structure with collapsible groups and expandable dataset details.

---

## UI Design

```
┌─────────────────────────────────────────────────────────────┐
│ SciViewer                                            [↻]    │
├─────────────────────────────────────────────────────────────┤
│ ▼ / (group)                                    2 attrs      │
│   ▼ experiment1 (group)                        1 attr       │
│       floats (dataset) [100, 50] float64                    │
│       integers (dataset) [1000] int64                       │
│     ▶ subgroup (group)                                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Selected: /experiment1/floats                               │
│ Shape: [100, 50]  Dtype: float64                            │
│ Attributes: none                                            │
│ Preview (first 20 values):                                  │
│ [-0.706, -0.019, 0.761, -2.031, -0.144, ...]               │
└─────────────────────────────────────────────────────────────┘
```

Two panels:
1. **Tree panel** (top): Collapsible hierarchy
2. **Detail panel** (bottom): Shows selected dataset info

---

## Step 4.1: Refactor HTML Structure

Move from inline HTML string to template with proper structure:

```html
<body>
  <header>
    <h1>SciViewer</h1>
    <button id="refresh" title="Refresh">↻</button>
  </header>
  
  <main>
    <section id="tree-panel">
      <div id="tree"></div>
    </section>
    
    <section id="detail-panel" class="hidden">
      <h2 id="detail-path"></h2>
      <div id="detail-meta"></div>
      <div id="detail-attrs"></div>
      <div id="detail-preview"></div>
    </section>
  </main>
  
  <div id="loading" class="hidden">Loading...</div>
  <div id="error" class="hidden"></div>
</body>
```

---

## Step 4.2: Tree Rendering Logic

JavaScript function to recursively render tree:

```javascript
function renderNode(node, depth = 0) {
  const div = document.createElement('div');
  div.className = 'tree-node';
  div.style.paddingLeft = `${depth * 16}px`;
  
  if (node.type === 'group') {
    const arrow = node.children?.length ? '▶' : '';
    div.innerHTML = `
      <span class="arrow">${arrow}</span>
      <span class="icon">📁</span>
      <span class="name">${node.name}</span>
      <span class="badge">${Object.keys(node.attrs).length} attrs</span>
    `;
    div.classList.add('group');
    
    const childContainer = document.createElement('div');
    childContainer.className = 'children collapsed';
    node.children?.forEach(child => {
      childContainer.appendChild(renderNode(child, depth + 1));
    });
    
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      div.querySelector('.arrow').textContent = 
        childContainer.classList.toggle('collapsed') ? '▶' : '▼';
    });
    
    const wrapper = document.createElement('div');
    wrapper.appendChild(div);
    wrapper.appendChild(childContainer);
    return wrapper;
    
  } else {
    div.innerHTML = `
      <span class="icon">📊</span>
      <span class="name">${node.name}</span>
      <span class="meta">[${node.shape.join(', ')}] ${node.dtype}</span>
    `;
    div.classList.add('dataset');
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      showDetail(node);
    });
    return div;
  }
}
```

---

## Step 4.3: Detail Panel

Show dataset details when clicked:

```javascript
function showDetail(node) {
  document.getElementById('detail-panel').classList.remove('hidden');
  document.getElementById('detail-path').textContent = node.path;
  
  document.getElementById('detail-meta').innerHTML = `
    <div><strong>Shape:</strong> [${node.shape.join(', ')}]</div>
    <div><strong>Dtype:</strong> ${node.dtype}</div>
  `;
  
  const attrs = Object.entries(node.attrs);
  document.getElementById('detail-attrs').innerHTML = attrs.length
    ? `<div><strong>Attributes:</strong></div>
       <ul>${attrs.map(([k,v]) => `<li>${k}: ${JSON.stringify(v)}</li>`).join('')}</ul>`
    : '<div class="muted">No attributes</div>';
  
  const preview = Array.isArray(node.preview) 
    ? node.preview.map(v => typeof v === 'number' ? v.toPrecision(4) : v).join(', ')
    : String(node.preview);
  document.getElementById('detail-preview').innerHTML = `
    <div><strong>Preview:</strong></div>
    <code>${preview}</code>
  `;
}
```

---

## Step 4.4: CSS Styling with VS Code Theme Variables

```css
:root {
  --indent: 16px;
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
}

.tree-node:hover {
  background: var(--vscode-list-hoverBackground);
}

.tree-node .arrow {
  width: 12px;
  font-size: 10px;
  color: var(--vscode-foreground);
}

.tree-node .icon {
  font-size: 14px;
}

.tree-node .name {
  flex: 1;
}

.tree-node .meta {
  color: var(--vscode-descriptionForeground);
  font-size: 0.9em;
}

.tree-node .badge {
  color: var(--vscode-descriptionForeground);
  font-size: 0.8em;
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
}

#detail-panel h2 {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-family: var(--vscode-editor-font-family);
  color: var(--vscode-textLink-foreground);
}

#detail-panel code {
  display: block;
  background: var(--vscode-textCodeBlock-background);
  padding: 8px;
  border-radius: 3px;
  font-family: var(--vscode-editor-font-family);
  font-size: var(--vscode-editor-font-size);
  white-space: pre-wrap;
  word-break: break-all;
}

.hidden { display: none !important; }
.muted { color: var(--vscode-descriptionForeground); }

#loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--vscode-descriptionForeground);
}

#error {
  padding: 16px;
  color: var(--vscode-errorForeground);
  background: var(--vscode-inputValidation-errorBackground);
  border-radius: 4px;
  margin: 16px;
}
```

---

## Step 4.5: Loading and Error States

Show loading spinner initially, handle errors:

```javascript
window.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  if (type === 'data') {
    document.getElementById('loading').classList.add('hidden');
    
    if (payload.error) {
      document.getElementById('error').textContent = payload.error;
      document.getElementById('error').classList.remove('hidden');
    } else {
      document.getElementById('tree').appendChild(renderNode(payload));
      // Auto-expand root
      document.querySelector('.tree-node.group')?.click();
    }
  }
});
```

---

## Step 4.6: Separate Media Files (Optional)

For maintainability, consider moving CSS/JS to separate files in `media/`:

```
media/
├── webview.css
└── webview.js
```

Load them in the webview with proper URIs:

```typescript
const scriptUri = webview.asWebviewUri(
  vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.js')
);
const styleUri = webview.asWebviewUri(
  vscode.Uri.joinPath(context.extensionUri, 'media', 'webview.css')
);
```

For simplicity in Phase 4, keep everything inline. Refactor to separate files in Phase 5 if desired.

---

## Step 4.7: Test with Various Files

1. `test.h5` - Simple structure
2. `complex.h5` - Nested groups, various dtypes, attributes
3. Edge cases:
   - Empty groups
   - Scalar datasets
   - Large arrays (verify preview truncation)
   - Files with many attributes

---

## Checkpoint

After Phase 4, you have:
- Interactive tree with expand/collapse
- Click datasets to see shape, dtype, attrs, preview
- VS Code theme integration (works in light/dark themes)
- Loading and error states
- Clean, professional appearance

Next: Phase 5 (refresh button, packaging)

