import { formatMermaidCode } from '../utils/mermaid-formatter.js';
import { testMermaidSyntax } from '../utils/ai-syntax-fixer.js';
import { isGraphvizDot } from '../utils/mermaid-renderer.js';

export class EditorController {
  constructor(options) {
    this.textarea = options.textarea;
    this.lineNumbersEl = options.lineNumbersEl;
    this.statusDot = options.statusDot;
    this.statusText = options.statusText;
    this.statsEl = options.statsEl;
    this.typeBadgeEl = options.typeBadgeEl;
    this.autoFormatToggle = options.autoFormatToggle || null;
    this.onChange = options.onChange || (() => {});
    this.autoFormatDelay = options.autoFormatDelay ?? 800;
    this.autoFormatEnabled = this.readAutoFormatPreference();

    this.debounceTimer = null;
    this.autoFormatTimer = null;
    this.history = [];
    this.historyIndex = -1;

    this.init();
  }

  init() {
    this.updateLineNumbers();
    this.updateStats();
    this.updateTypeBadge();
    if (this.autoFormatToggle) {
      this.autoFormatToggle.checked = this.autoFormatEnabled;
      this.autoFormatToggle.addEventListener('change', () => {
        this.setAutoFormatEnabled(this.autoFormatToggle.checked);
      });
    }

    // Sync scroll
    this.textarea.addEventListener('scroll', () => {
      this.lineNumbersEl.scrollTop = this.textarea.scrollTop;
    });

    // Input events
    this.textarea.addEventListener('input', () => {
      this.updateLineNumbers();
      this.updateStats();
      this.updateTypeBadge();
      this.handleInputDebounced();
    });

    // Cursor position tracking
    const updateCursor = () => this.updateStats();
    this.textarea.addEventListener('click', updateCursor);
    this.textarea.addEventListener('keyup', updateCursor);

    // Key handling (Tab indentation & shortcuts)
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const val = this.textarea.value;

        if (e.shiftKey) {
          // Unindent
          const lineStart = val.lastIndexOf('\n', start - 1) + 1;
          if (val.slice(lineStart, lineStart + 2) === '  ') {
            this.textarea.value = val.slice(0, lineStart) + val.slice(lineStart + 2);
            this.textarea.selectionStart = Math.max(lineStart, start - 2);
            this.textarea.selectionEnd = Math.max(lineStart, end - 2);
          }
        } else {
          // Indent 2 spaces
          this.textarea.value = val.substring(0, start) + '  ' + val.substring(end);
          this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
        }

        this.updateLineNumbers();
        this.updateStats();
        this.handleInputDebounced();
      }
    });
  }

  handleInputDebounced() {
    if (this.statusDot) {
      this.statusDot.className = 'status-dot rendering';
    }
    if (this.statusText) {
      this.statusText.textContent = 'Editing…';
    }

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.onChange(this.getValue());
    }, 200);

    clearTimeout(this.autoFormatTimer);
    if (this.autoFormatEnabled) {
      this.autoFormatTimer = setTimeout(() => this.autoFormatIfValid(), this.autoFormatDelay);
    }
  }

  readAutoFormatPreference() {
    try {
      return window.localStorage.getItem('nodeflow:auto-format') === 'true';
    } catch {
      return false;
    }
  }

  setAutoFormatEnabled(enabled) {
    this.autoFormatEnabled = Boolean(enabled);
    try {
      window.localStorage.setItem('nodeflow:auto-format', String(this.autoFormatEnabled));
    } catch {
      // The editor still works when browser storage is unavailable.
    }
    if (this.autoFormatToggle) this.autoFormatToggle.checked = this.autoFormatEnabled;
    if (!this.autoFormatEnabled) clearTimeout(this.autoFormatTimer);
  }

  async autoFormatIfValid() {
    if (!this.autoFormatEnabled) return { formatted: false, reason: 'disabled' };

    const original = this.getValue();
    if (!original.trim() || isGraphvizDot(original)) return { formatted: false, reason: 'unsupported-format' };

    const validation = await testMermaidSyntax(original);
    if (!validation.valid || original !== this.getValue() || !this.autoFormatEnabled) {
      return { formatted: false, reason: validation.error ? 'invalid-syntax' : 'stale-input' };
    }

    const formatted = formatMermaidCode(original);
    if (formatted === original) return { formatted: false, reason: 'already-formatted' };

    const formattedValidation = await testMermaidSyntax(formatted);
    if (!formattedValidation.valid || original !== this.getValue() || !this.autoFormatEnabled) {
      return { formatted: false, reason: 'format-rejected' };
    }

    const start = this.textarea.selectionStart || 0;
    const end = this.textarea.selectionEnd || start;
    this.textarea.value = formatted;
    this.textarea.selectionStart = mapCursor(original, formatted, start);
    this.textarea.selectionEnd = mapCursor(original, formatted, end);
    this.updateLineNumbers();
    this.updateStats();
    this.updateTypeBadge();
    this.onChange(formatted);
    return { formatted: true };
  }

  getValue() {
    return this.textarea.value;
  }

  setValue(code) {
    this.textarea.value = code;
    this.updateLineNumbers();
    this.updateStats();
    this.updateTypeBadge();
    this.onChange(code);
  }

  insertSnippet(text) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const val = this.textarea.value;

    this.textarea.value = val.substring(0, start) + text + val.substring(end);
    this.textarea.selectionStart = this.textarea.selectionEnd = start + text.length;
    this.textarea.focus();

    this.updateLineNumbers();
    this.updateStats();
    this.handleInputDebounced();
  }

  async formatCode() {
    const raw = this.textarea.value;
    if (!raw.trim() || isGraphvizDot(raw)) {
      this.setStatus('error', 'Formatter supports Mermaid diagrams');
      return { formatted: false, reason: 'unsupported-format' };
    }

    const validation = await testMermaidSyntax(raw);
    if (!validation.valid || raw !== this.getValue()) {
      this.setStatus('error', validation.error || 'Syntax changed; try formatting again');
      return { formatted: false, reason: 'invalid-syntax', error: validation.error };
    }

    const formatted = formatMermaidCode(raw);
    const formattedValidation = await testMermaidSyntax(formatted);
    if (!formattedValidation.valid || raw !== this.getValue()) {
      this.setStatus('error', formattedValidation.error || 'Formatted output failed validation');
      return { formatted: false, reason: 'format-rejected', error: formattedValidation.error };
    }

    this.setValue(formatted);
    this.setStatus('', formatted === raw ? 'Already formatted' : 'Formatted and syntax checked');
    return { formatted: formatted !== raw, code: formatted };
  }

  updateTypeBadge() {
    if (!this.typeBadgeEl) return;
    const code = this.textarea.value;
    const clean = code.replace(/---[\s\S]*?---/, '').trim();
    const firstLine = clean.split('\n')[0] || '';

    let type = 'Diagram';
    if (/^(strict\s+)?digraph\b/i.test(firstLine) || (/^(strict\s+)?graph\b/i.test(firstLine) && /[{;]/.test(clean))) {
      type = '⚡ Graphviz (Wasm)';
    } else if (/^flowchart/i.test(firstLine)) {
      if (/<<include>>|<<extend>>|actor\b/i.test(clean)) type = 'UML Use Case';
      else if (/fork|join|decision|condition/i.test(clean) || /\[\*\]/.test(clean)) type = 'UML Activity';
      else if (/component\b|lollipop|interface/i.test(clean)) type = 'UML Component';
      else if (/node\b|artifact\b|deployment/i.test(clean)) type = 'UML Deployment';
      else type = 'Flowchart';
    } else if (/^graph/i.test(firstLine)) type = 'Graph';
    else if (/^sequenceDiagram/i.test(firstLine)) type = 'UML Sequence';
    else if (/^classDiagram/i.test(firstLine)) {
      if (/<<metaclass>>|<<stereotype>>/i.test(clean)) type = 'UML Profile';
      else if (/:\s*[A-Z]\w*\s*\{/i.test(clean)) type = 'UML Object';
      else type = 'UML Class';
    } else if (/^stateDiagram/i.test(firstLine)) type = 'UML State Machine';
    else if (/^erDiagram/i.test(firstLine)) type = 'ER Schema';
    else if (/^gitGraph/i.test(firstLine)) type = 'Git Graph';
    else if (/^gantt/i.test(firstLine)) type = 'Gantt Roadmap';
    else if (/^mindmap/i.test(firstLine)) type = 'Mindmap';
    else if (/^journey/i.test(firstLine)) type = 'User Journey';
    else if (/^kanban/i.test(firstLine)) type = 'Kanban Board';
    else if (/^quadrantChart/i.test(firstLine)) type = 'Quadrant Matrix';
    else if (/^timeline/i.test(firstLine)) type = 'Timeline Roadmap';
    else if (/^sankey/i.test(firstLine)) type = 'Sankey Funnel';
    else if (/^block/i.test(firstLine)) type = 'Block Architecture';
    else if (/^xychart/i.test(firstLine)) type = 'XY Metric Chart';
    else if (/^C4/i.test(firstLine)) type = 'C4 Architecture';
    else if (/^pie/i.test(firstLine)) type = 'Pie Chart';
    else if (/^architecture/i.test(firstLine)) type = 'Architecture';

    this.typeBadgeEl.textContent = type;
  }

  updateLineNumbers() {
    const lines = this.textarea.value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
      numbers += `${i}\n`;
    }
    this.lineNumbersEl.textContent = numbers;
  }

  updateStats() {
    const code = this.textarea.value;
    const lines = code.split('\n').length;
    const chars = code.length;

    // Calculate cursor position
    const pos = this.textarea.selectionStart || 0;
    const textBefore = code.substring(0, pos);
    const lineIndex = textBefore.split('\n').length;
    const colIndex = pos - textBefore.lastIndexOf('\n');

    if (this.statsEl) {
      this.statsEl.textContent = `Ln ${lineIndex}, Col ${colIndex} | ${lines} lines, ${chars} chars`;
    }
  }

  setStatus(state, message) {
    if (this.statusDot) {
      this.statusDot.className = `status-dot ${state}`;
    }
    if (this.statusText) {
      this.statusText.textContent = message;
    }
  }
}

function mapCursor(before, after, position) {
  let prefix = 0;
  while (prefix < before.length && prefix < after.length && before[prefix] === after[prefix]) prefix++;

  let suffix = 0;
  while (
    suffix < before.length - prefix &&
    suffix < after.length - prefix &&
    before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
  ) suffix++;

  if (position <= prefix) return position;
  if (position >= before.length - suffix) return Math.max(prefix, Math.min(after.length, position + after.length - before.length));
  return Math.min(after.length - suffix, prefix + Math.min(position - prefix, after.length - prefix - suffix));
}
