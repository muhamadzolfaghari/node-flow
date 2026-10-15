import mermaid from 'mermaid';
import { renderGraphvizWasm } from './wasm/wasm-accelerator.js';

/**
 * Mermaid & WebAssembly Graphviz renderer manager for DiagramAtlas
 * Provides theme initialization, pre-parse syntax validation,
 * and dual-engine rendering (Mermaid + Native Graphviz WebAssembly).
 */

let currentTheme = 'dark';
let renderSequence = 0;

/**
 * Check if the diagram source is Graphviz DOT syntax
 * @param {string} code
 * @returns {boolean}
 */
export function isGraphvizDot(code) {
  if (!code || typeof code !== 'string') return false;
  const clean = code.replace(/---[\s\S]*?---/, '').trim();
  const firstLine = clean.split('\n')[0] || '';
  // Match standard Graphviz digraph, graph, strict digraph, strict graph
  return /^\s*(strict\s+)?(di)?graph\b/i.test(firstLine) && /[{;]/.test(clean);
}

export function getThemeVariables(theme = 'dark') {
  if (theme === 'default') {
    return {
      darkMode: false,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13px',
      primaryColor: '#ffffff',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#3b82f6',
      lineColor: '#2563eb',
      secondaryColor: '#f8fafc',
      secondaryTextColor: '#1e293b',
      secondaryBorderColor: '#6366f1',
      tertiaryColor: '#f1f5f9',
      tertiaryTextColor: '#334155',
      tertiaryBorderColor: '#94a3b8',
      nodeBorder: '#3b82f6',
      mainBkg: '#ffffff',
      nodeTextColor: '#0f172a',
      clusterBkg: '#f8fafcdd',
      clusterBorder: '#cbd5e1',
      defaultLinkColor: '#2563eb',
      titleColor: '#0f172a',
      edgeLabelBackground: '#ffffff',
      actorBkg: '#ffffff',
      actorBorder: '#4f46e5',
      actorTextColor: '#0f172a',
      actorLineColor: '#94a3b8',
      signalColor: '#2563eb',
      signalTextColor: '#0f172a',
      git0: '#4f46e5',
      git1: '#0284c7',
      git2: '#059669',
      git3: '#d97706',
      git4: '#db2777',
      git5: '#7c3aed',
      pie1: '#3b82f6',
      pie2: '#10b981',
      pie3: '#f59e0b',
      pie4: '#ec4899',
      pie5: '#8b5cf6',
      pie6: '#06b6d4',
    };
  }

  if (theme === 'forest') {
    return {
      darkMode: true,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13px',
      primaryColor: '#064e3b',
      primaryTextColor: '#ecfdf5',
      primaryBorderColor: '#10b981',
      lineColor: '#34d399',
      secondaryColor: '#022c22',
      secondaryTextColor: '#a7f3d0',
      secondaryBorderColor: '#059669',
      tertiaryColor: '#047857',
      nodeBorder: '#10b981',
      mainBkg: '#064e3b',
      nodeTextColor: '#ecfdf5',
      clusterBkg: '#022c2288',
      clusterBorder: '#059669',
      defaultLinkColor: '#34d399',
      titleColor: '#a7f3d0',
      edgeLabelBackground: '#022c22ee',
      actorBkg: '#064e3b',
      actorBorder: '#10b981',
      actorTextColor: '#ecfdf5',
      actorLineColor: '#059669',
      signalColor: '#34d399',
      signalTextColor: '#ecfdf5',
      git0: '#10b981',
      git1: '#06b6d4',
      git2: '#34d399',
      git3: '#a3e635',
      pie1: '#10b981',
      pie2: '#06b6d4',
      pie3: '#14b8a6',
      pie4: '#84cc16',
    };
  }

  if (theme === 'neutral') {
    return {
      darkMode: false,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13px',
      primaryColor: '#f4f4f5',
      primaryTextColor: '#18181b',
      primaryBorderColor: '#71717a',
      lineColor: '#52525b',
      secondaryColor: '#ffffff',
      secondaryTextColor: '#27272a',
      secondaryBorderColor: '#a1a1aa',
      nodeBorder: '#71717a',
      mainBkg: '#f4f4f5',
      nodeTextColor: '#18181b',
      clusterBkg: '#e4e4e788',
      clusterBorder: '#a1a1aa',
      defaultLinkColor: '#52525b',
      titleColor: '#18181b',
      edgeLabelBackground: '#ffffff',
    };
  }

  // Dark (Enterprise Studio Dark with vibrant neon accents)
  return {
    darkMode: true,
    background: 'transparent',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: '13.5px',
    primaryColor: '#0c1e33',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#38bdf8',
    lineColor: '#38bdf8',
    secondaryColor: '#1a1638',
    secondaryTextColor: '#f1f5f9',
    secondaryBorderColor: '#818cf8',
    tertiaryColor: '#08241b',
    tertiaryTextColor: '#a7f3d0',
    tertiaryBorderColor: '#34d399',
    nodeBorder: '#38bdf8',
    mainBkg: '#0c1e33',
    nodeTextColor: '#f8fafc',
    clusterBkg: '#0f172a55',
    clusterBorder: '#38bdf866',
    defaultLinkColor: '#38bdf8',
    titleColor: '#f8fafc',
    edgeLabelBackground: '#0b0f17ee',
    actorBkg: '#0c1e33',
    actorBorder: '#818cf8',
    actorTextColor: '#f8fafc',
    actorLineColor: '#475569',
    signalColor: '#38bdf8',
    signalTextColor: '#f8fafc',
    labelBoxBkgColor: '#0f172a',
    labelBoxBorderColor: '#38bdf8',
    labelTextColor: '#f8fafc',
    loopTextColor: '#cbd5e1',
    noteBorderColor: '#fbbf24',
    noteBkgColor: '#261908',
    noteTextColor: '#fef3c7',
    activationBorderColor: '#38bdf8',
    activationBkgColor: '#0369a1',
    git0: '#6366f1',
    git1: '#06b6d4',
    git2: '#10b981',
    git3: '#f59e0b',
    git4: '#ec4899',
    git5: '#8b5cf6',
    git6: '#3b82f6',
    git7: '#14b8a6',
    pie1: '#38bdf8',
    pie2: '#10b981',
    pie3: '#f59e0b',
    pie4: '#ec4899',
    pie5: '#8b5cf6',
    pie6: '#06b6d4',
    pie7: '#f97316',
    pie8: '#14b8a6',
    pie9: '#6366f1',
    pie10: '#e11d48',
    pie11: '#84cc16',
    pie12: '#a855f7',
  };
}

export function initMermaid(theme = 'dark') {
  currentTheme = theme;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: currentTheme === 'default' ? 'default' : currentTheme === 'forest' ? 'forest' : currentTheme === 'neutral' ? 'neutral' : 'dark',
    themeVariables: getThemeVariables(currentTheme),
    suppressErrorRendering: true,
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'natural',
      nodeSpacing: 50,
      rankSpacing: 70,
    },
    gantt: {
      useWidth: 2400,
      barHeight: 28,
      barGap: 8,
      topPadding: 56,
      leftPadding: 200,
      gridLineStartPadding: 45,
    },
    sequence: {
      useMaxWidth: false,
      boxMargin: 10,
      noteMargin: 10,
      messageMargin: 35,
    },
    class: {
      useMaxWidth: false,
    },
    state: {
      useMaxWidth: false,
    },
    er: {
      useMaxWidth: false,
    },
  });
}

export function setMermaidTheme(theme) {
  currentTheme = theme;
  initMermaid(theme);
}

export function getMermaidTheme() {
  return currentTheme;
}

/**
 * Validates and renders mermaid or native Graphviz source code into the target container.
 * If syntax is invalid, returns { success: false, error } without clearing the existing SVG!
 */
export async function renderMermaid(container, code) {
  const seq = ++renderSequence;

  if (!code || !code.trim()) {
    return { success: false, error: 'Empty diagram source' };
  }

  // 1. Native Graphviz WebAssembly Path
  if (isGraphvizDot(code)) {
    try {
      const svg = await renderGraphvizWasm(code);
      if (seq !== renderSequence) {
        return { success: false, aborted: true };
      }
      container.classList.remove('is-gantt');
      container.innerHTML = svg;
      return {
        success: true,
        svg,
        isGraphviz: true,
        engine: 'Graphviz C Engine (WebAssembly)',
      };
    } catch (gvErr) {
      const errorMsg = gvErr?.message || String(gvErr);
      return { success: false, error: cleanErrorMessage(errorMsg), isGraphviz: true };
    }
  }

  // 2. Standard Mermaid Path
  // Pre-validate syntax to prevent crashing or displaying default Mermaid error SVG
  try {
    const parseResult = await mermaid.parse(code, { suppressErrors: true });
    if (parseResult === false) {
      return { success: false, error: 'Invalid Mermaid syntax.' };
    }
  } catch (parseErr) {
    const errorMsg = parseErr?.message || parseErr?.str || String(parseErr);
    return { success: false, error: cleanErrorMessage(errorMsg) };
  }


  try {
    const id = `mermaid-render-${seq}`;
    const result = await mermaid.render(id, code);

    // If a newer render was triggered while this one was running, discard output
    if (seq !== renderSequence) {
      return { success: false, aborted: true };
    }

    // Determine if diagram is gantt for layout width handling
    const isGantt = /^\s*gantt\b/m.test(code);
    container.classList.toggle('is-gantt', isGantt);

    // Insert new SVG
    container.innerHTML = result.svg;
    if (typeof result.bindFunctions === 'function') {
      result.bindFunctions(container);
    }

    return {
      success: true,
      svg: result.svg,
      isGantt,
    };
  } catch (renderErr) {
    const errorMsg = renderErr?.message || renderErr?.str || String(renderErr);
    return { success: false, error: cleanErrorMessage(errorMsg) };
  }
}

function cleanErrorMessage(msg) {
  // Strip out HTML tags or internal stack trace artifacts if present
  let clean = msg.replace(/<[^>]*>/g, '').trim();
  if (clean.includes('Parse error on line')) {
    clean = clean.split('\n')[0];
  }
  return clean || 'Mermaid syntax error detected.';
}
