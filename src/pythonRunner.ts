import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

export interface H5Data {
  name: string;
  path: string;
  type: 'group' | 'dataset';
  attrs: Record<string, unknown>;
  children?: H5Data[];
  shape?: number[];
  dtype?: string;
  preview?: unknown;
}

export interface H5Error {
  error: string;
}

export type H5Result = H5Data | H5Error;

export async function runH5Reader(
  extensionPath: string,
  filePath: string
): Promise<H5Result> {
  const scriptPath = path.join(extensionPath, 'python', 'h5_reader.py');
  const pythonPath = getPythonPath();

  return new Promise((resolve) => {
    const proc = spawn(pythonPath, [scriptPath, filePath]);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });

    proc.on('close', (code) => {
      if (code !== 0 && !stdout) {
        let errorMsg = stderr || `Process exited with code ${code}`;
        if (stderr.includes('No module named')) {
          errorMsg += '\n\nTip: Configure sciViewer.pythonPath to point to a Python with required packages installed.';
        }
        resolve({ error: errorMsg });
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({ error: `Failed to parse JSON: ${stdout}` });
      }
    });

    proc.on('error', (err) => {
      resolve({ error: `Failed to spawn Python: ${err.message}\n\nTip: Configure sciViewer.pythonPath in settings.` });
    });
  });
}

function getPythonPath(): string {
  const config = vscode.workspace.getConfiguration('sciViewer');
  const customPath = config.get<string>('pythonPath');
  if (customPath) {
    return customPath;
  }
  return process.platform === 'win32' ? 'python' : 'python3';
}
