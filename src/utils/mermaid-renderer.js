import { renderGraphvizWasm } from './wasm/wasm-accelerator.js';

/**
 * Mermaid & WebAssembly Graphviz renderer manager for DiagramAtlas
 * Provides theme initialization, pre-parse syntax validation,
 * and dual-engine rendering (Mermaid + Native Graphviz WebAssembly).
 */

let currentTheme = 'dark';
let renderSequence = 0;
let mermaidPromise;

async function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((module) => module.default);
  }
  return mermaidPromise;
}

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

  if (theme === 'nord') {
    return {
      darkMode: true,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13.5px',
      primaryColor: '#2e3440',
      primaryTextColor: '#eceff4',
      primaryBorderColor: '#88c0d0',
      lineColor: '#81a1c1',
      secondaryColor: '#3b4252',
      secondaryTextColor: '#e5e9f0',
      secondaryBorderColor: '#5e81ac',
      tertiaryColor: '#434c5e',
      tertiaryTextColor: '#d8dee9',
      tertiaryBorderColor: '#88c0d0',
      nodeBorder: '#88c0d0',
      mainBkg: '#2e3440',
      nodeTextColor: '#eceff4',
      clusterBkg: '#3b425266',
      clusterBorder: '#88c0d088',
      defaultLinkColor: '#81a1c1',
      titleColor: '#88c0d0',
      edgeLabelBackground: '#2e3440ee',
      actorBkg: '#2e3440',
      actorBorder: '#88c0d0',
      actorTextColor: '#eceff4',
      actorLineColor: '#5e81ac',
      signalColor: '#88c0d0',
      signalTextColor: '#eceff4',
      git0: '#88c0d0',
      git1: '#81a1c1',
      git2: '#a3be8c',
      git3: '#ebcb8b',
      git4: '#d08770',
      git5: '#b48ead',
      pie1: '#88c0d0',
      pie2: '#81a1c1',
      pie3: '#a3be8c',
      pie4: '#ebcb8b',
      pie5: '#b48ead',
      pie6: '#bf616a',
    };
  }

  if (theme === 'tokyo-night') {
    return {
      darkMode: true,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13.5px',
      primaryColor: '#1a1b26',
      primaryTextColor: '#c0caf5',
      primaryBorderColor: '#7aa2f7',
      lineColor: '#bb9af7',
      secondaryColor: '#24283b',
      secondaryTextColor: '#a9b1d6',
      secondaryBorderColor: '#bb9af7',
      tertiaryColor: '#1f2335',
      tertiaryTextColor: '#7dcfff',
      tertiaryBorderColor: '#7aa2f7',
      nodeBorder: '#7aa2f7',
      mainBkg: '#1a1b26',
      nodeTextColor: '#c0caf5',
      clusterBkg: '#24283b66',
      clusterBorder: '#7aa2f788',
      defaultLinkColor: '#bb9af7',
      titleColor: '#7aa2f7',
      edgeLabelBackground: '#1a1b26ee',
      actorBkg: '#1a1b26',
      actorBorder: '#7aa2f7',
      actorTextColor: '#c0caf5',
      actorLineColor: '#565f89',
      signalColor: '#7aa2f7',
      signalTextColor: '#c0caf5',
      git0: '#7aa2f7',
      git1: '#bb9af7',
      git2: '#7dcfff',
      git3: '#9ece6a',
      git4: '#e0af68',
      git5: '#f7768e',
      pie1: '#7aa2f7',
      pie2: '#bb9af7',
      pie3: '#7dcfff',
      pie4: '#9ece6a',
      pie5: '#e0af68',
      pie6: '#f7768e',
    };
  }

  if (theme === 'cyberpunk') {
    return {
      darkMode: true,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13.5px',
      primaryColor: '#0d0e15',
      primaryTextColor: '#fcee0a',
      primaryBorderColor: '#00f0ff',
      lineColor: '#00f0ff',
      secondaryColor: '#181926',
      secondaryTextColor: '#00f0ff',
      secondaryBorderColor: '#ff003c',
      tertiaryColor: '#22122b',
      tertiaryTextColor: '#ff003c',
      tertiaryBorderColor: '#fcee0a',
      nodeBorder: '#00f0ff',
      mainBkg: '#0d0e15',
      nodeTextColor: '#fcee0a',
      clusterBkg: '#18192688',
      clusterBorder: '#00f0ff88',
      defaultLinkColor: '#00f0ff',
      titleColor: '#fcee0a',
      edgeLabelBackground: '#0d0e15ee',
      actorBkg: '#0d0e15',
      actorBorder: '#ff003c',
      actorTextColor: '#fcee0a',
      actorLineColor: '#7122fa',
      signalColor: '#00f0ff',
      signalTextColor: '#fcee0a',
      git0: '#00f0ff',
      git1: '#fcee0a',
      git2: '#ff003c',
      git3: '#7122fa',
      git4: '#05ffa1',
      git5: '#ffbe0b',
      pie1: '#00f0ff',
      pie2: '#fcee0a',
      pie3: '#ff003c',
      pie4: '#05ffa1',
      pie5: '#7122fa',
      pie6: '#ffbe0b',
    };
  }

  if (theme === 'catppuccin') {
    return {
      darkMode: true,
      background: 'transparent',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '13.5px',
      primaryColor: '#1e1e2e',
      primaryTextColor: '#cdd6f4',
      primaryBorderColor: '#cba6f7',
      lineColor: '#89b4fa',
      secondaryColor: '#313244',
      secondaryTextColor: '#bac2de',
      secondaryBorderColor: '#f5c2e7',
      tertiaryColor: '#181825',
      tertiaryTextColor: '#a6e3a1',
      tertiaryBorderColor: '#fab387',
      nodeBorder: '#cba6f7',
      mainBkg: '#1e1e2e',
      nodeTextColor: '#cdd6f4',
      clusterBkg: '#31324466',
      clusterBorder: '#cba6f788',
      defaultLinkColor: '#89b4fa',
      titleColor: '#cba6f7',
      edgeLabelBackground: '#1e1e2eee',
      actorBkg: '#1e1e2e',
      actorBorder: '#cba6f7',
      actorTextColor: '#cdd6f4',
      actorLineColor: '#585b70',
      signalColor: '#89b4fa',
      signalTextColor: '#cdd6f4',
      git0: '#cba6f7',
      git1: '#89b4fa',
      git2: '#a6e3a1',
      git3: '#f9e2af',
      git4: '#fab387',
      git5: '#f38ba8',
      pie1: '#cba6f7',
      pie2: '#89b4fa',
      pie3: '#a6e3a1',
      pie4: '#f9e2af',
      pie5: '#fab387',
      pie6: '#f38ba8',
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

export async function initMermaid(theme = 'dark') {
  currentTheme = theme;
  const mermaid = await getMermaid();
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
  return initMermaid(theme);
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
    const mermaid = await getMermaid();
    await initMermaid(currentTheme);
    const parseResult = await mermaid.parse(code, { suppressErrors: true });
    if (parseResult === false) {
      return { success: false, error: 'Invalid Mermaid syntax.' };
    }
  } catch (parseErr) {
    const errorMsg = parseErr?.message || parseErr?.str || String(parseErr);
    return { success: false, error: cleanErrorMessage(errorMsg) };
  }


  try {
    const mermaid = await getMermaid();
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
    // Defensive cleanup: remove temporary element left behind by Mermaid in document on error
    const tempEl = typeof document !== 'undefined' ? (document.getElementById(`dmermaid-render-${seq}`) || document.getElementById(`mermaid-render-${seq}`)) : null;
    if (tempEl && tempEl.parentNode) {
      tempEl.parentNode.removeChild(tempEl);
    }
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
