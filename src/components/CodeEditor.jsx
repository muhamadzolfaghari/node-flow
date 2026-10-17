import { useEffect, useRef, useState, useMemo, useCallback, useImperativeHandle, forwardRef } from "react";
import { basicSetup } from "codemirror";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import {
  StreamLanguage,
  syntaxHighlighting,
  HighlightStyle,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sql } from "@codemirror/lang-sql";
import { yaml } from "@codemirror/lang-yaml";
import { xml } from "@codemirror/lang-xml";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { autocompletion, snippetCompletion } from "@codemirror/autocomplete";
import { linter, lintGutter } from "@codemirror/lint";
import { undo, redo } from "@codemirror/commands";
import { openSearchPanel, search, searchKeymap } from "@codemirror/search";
import { getFormat } from "../lib/formats.js";
import { testMermaidSyntax, parseErrorDetails } from "../utils/universal-fixer.js";
import { formatMermaidCode } from "../utils/mermaid-formatter.js";
import { CLOUD_STENCILS } from "../lib/indexeddb-storage.js";
import { scanNodeDeclarations } from "../lib/visual-editing.js";
import { useEditorDiagnostics } from "../hooks/useEditorDiagnostics.js";
import { EditorDiagnosticsBanner } from "./editor/EditorDiagnosticsBanner.jsx";

// Diagram types list for tokenizer & completions
const diagramHeaders = [
  "flowchart", "graph", "sequenceDiagram", "classDiagram", "stateDiagram-v2", "stateDiagram",
  "erDiagram", "mindmap", "gantt", "pie", "xychart-beta", "xychart", "C4Context", "C4Container",
  "C4Component", "C4Dynamic", "C4Deployment", "gitGraph", "journey", "timeline", "sankey-beta",
  "sankey", "quadrantChart", "kanban", "block-beta", "block", "requirementDiagram", "packet-beta",
  "packet", "architecture-beta", "architecture", "zenuml", "digraph", "strict digraph", "d2"
];

// Structural and diagram keywords
const keywords = [
  ...diagramHeaders,
  "subgraph", "end", "direction", "TB", "TD", "BT", "RL", "LR",
  "participant", "actor", "boundary", "control", "entity", "database", "collections",
  "create", "destroy", "box", "autonumber", "activate", "deactivate", "alt", "else", "opt",
  "loop", "par", "and", "critical", "break", "rect", "note", "over", "right of", "left of", "as",
  "class", "interface", "enum", "state", "fork", "join", "choice", "abstract",
  "title", "accTitle", "accDescr", "section", "dateFormat", "axisFormat", "todayMarker",
  "excludes", "includes", "commit", "branch", "checkout", "merge", "tag", "order", "id",
  "cherry-pick", "type", "msg", "NORMAL", "REVERSE", "HIGHLIGHT",
  "group", "service", "in", "junction", "icon", "disk", "server", "cloud", "internet", "router", "gateway",
  "Person", "Person_Ext", "System", "System_Ext", "SystemDb", "SystemDb_Ext", "SystemQueue",
  "Container", "ContainerDb", "ContainerQueue", "Component", "ComponentDb",
  "Boundary", "Enterprise_Boundary", "System_Boundary", "Container_Boundary",
  "Rel", "BiRel", "Rel_Back", "Rel_Neighbor", "Rel_D", "Rel_U", "Rel_L", "Rel_R", "UpdateLayoutConfig",
  "requirement", "functionalRequirement", "interfaceRequirement", "performanceRequirement",
  "designConstraint", "physicalRequirement", "element", "satisfies", "traces", "contains",
  "copies", "derives", "verifies", "refines", "docRef", "risk", "verifymethod", "text",
  "style", "classDef", "linkStyle", "interpolate", "click"
];

// Rich Total Syntax Tokenizer for Mermaid, PlantUML, DOT, D2 & Architecture
const diagramLanguage = StreamLanguage.define({
  token(stream) {
    // 1. Directives and frontmatter (--- ... --- or %%{init: ...}%%)
    if (stream.match(/^---[\s\S]*?---/) || stream.match(/^%%\{.*?\}%%/)) return "meta";

    // 2. Comments (%%, //, #, ')
    if (stream.match(/^%%.*$/) || stream.match(/^\/\/.*$/) || stream.match(/^#.*$/) || stream.match(/^'.*$/)) {
      return "comment";
    }

    // 3. Quoted strings ("...", '...', `...`)
    if (stream.match(/^"[^"]*"/) || stream.match(/^'[^']*'/) || stream.match(/^`[^`]*`/)) {
      return "string";
    }

    // 4. Arrow and edge operators (flowchart, sequence, state, class, er, plantuml, d2)
    if (
      stream.match(/^(?:-->|-->>|->>|-\)|--\)|-\.->|-.-|==>|===|~~~|--o|--x|o--o|x--x|<-->|<--|->|--|<\|--|\*--|o--|\.\.\|>|\.\.|\|\|--o\{|\}\|--\|\{|\|o--o\||\|o--o\{|\|\|--\|\||\}\|--\|\{|\}o--o\{|<-|&)/)
    ) {
      return "operator";
    }

    // 5. Arrow inline text label |label|
    if (stream.match(/^\|[^|\n]+\|/)) {
      return "string";
    }

    // 6. Packet bytefield bit ranges (e.g. 0-15:, 16-31:)
    if (stream.match(/^\b\d+(?:-\d+)?:\b/)) {
      return "number";
    }

    // 7. Hex color codes (#1e293b, #38bdf8)
    if (stream.match(/^#[0-9a-fA-F]{3,8}\b/)) {
      return "number";
    }

    // 8. Numbers and units (e.g. 100, 20px, 1.5, 3d, 2w)
    if (stream.match(/^\b\d+(?:\.\d+)?(?:px|em|pt|ms|s|%|d|w)?\b/)) {
      return "number";
    }

    // 9. Node shape brackets and delimiters (all 14 flowchart shapes + C4)
    if (stream.match(/^(?:\[\[|\]\]|\[\(|\)\]|\(\(\(|\)\)\)|\(\(|\)\)|\{\{|\}\}|\[\/|\/\]|\[\\|\\\]|\[|\]|\(|\)|\{|\}|>)/)) {
      return "bracket";
    }

    // 10. CSS style properties inside style/classDef
    if (stream.match(/^(?:fill|stroke|stroke-width|stroke-dasharray|color|font-size|opacity|rx|ry|stroke-dashoffset):/)) {
      return "propertyName";
    }

    // 11. Types in ER & Class diagrams
    if (stream.match(/^\b(?:string|int|integer|boolean|bool|datetime|date|timestamp|uuid|float|double|PK|FK|UK)\b/i)) {
      return "typeName";
    }

    // 12. Diagram keywords
    for (const kw of keywords) {
      if (stream.match(new RegExp(`^\\b${kw}\\b`))) {
        return "keyword";
      }
    }

    stream.next();
    return null;
  },
});

function language(doc) {
  if (!doc) return diagramLanguage;
  const name = (doc.name || "").toLowerCase();
  switch (getFormat(doc.format || "mermaid").language) {
    case "sql":
      return sql();
    case "xml":
      return xml();
    case "markdown":
      return markdown();
    case "yaml":
      return name.endsWith(".json") ? json() : yaml();
    case "javascript":
      return name.endsWith(".py")
        ? python()
        : javascript({ typescript: true, jsx: true });
    default:
      return diagramLanguage;
  }
}

// Modern IDE Dark Theme for Editor & Diagnostics
const theme = EditorView.theme(
  {
    "&": { backgroundColor: "var(--editor-bg)", color: "var(--editor-fg)", fontSize: "12px", height: "100%" },
    ".cm-content": {
      fontFamily: "JetBrains Mono, monospace",
      padding: "16px 0",
      caretColor: "var(--primary)",
    },
    ".cm-line": { padding: "0 16px", lineHeight: "22px" },
    ".cm-gutters": {
      backgroundColor: "var(--editor-bg)",
      color: "var(--editor-gutter-fg)",
      border: "none",
      borderRight: "1px solid var(--editor-line)",
      minWidth: "44px",
    },
    ".cm-activeLineGutter": { backgroundColor: "var(--editor-line)", color: "var(--primary)" },
    ".cm-activeLine": { backgroundColor: "var(--editor-active-line)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "var(--editor-selection)",
    },
    ".cm-cursor": { borderLeftColor: "var(--primary)" },
    ".cm-panels": { backgroundColor: "var(--popover)", color: "var(--editor-fg)" },
    ".cm-tooltip": {
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "6px",
      color: "var(--popover-foreground)",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
    },
    // CodeMirror Lint Diagnostic Styles
    ".cm-lintRange-error": {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 2.5 l2 -2 l2 2 l2 -2' fill='none' stroke='%23f43f5e' stroke-width='1.2'/%3E%3C/svg%3E")`,
      backgroundPosition: "left bottom",
      backgroundRepeat: "repeat-x",
      paddingBottom: "1px",
      backgroundColor: "rgba(244, 63, 94, 0.12)",
      borderRadius: "2px",
    },
    ".cm-lintRange-warning": {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 2.5 l2 -2 l2 2 l2 -2' fill='none' stroke='%23f59e0b' stroke-width='1.2'/%3E%3C/svg%3E")`,
      backgroundPosition: "left bottom",
      backgroundRepeat: "repeat-x",
      paddingBottom: "1px",
      backgroundColor: "rgba(245, 158, 11, 0.12)",
      borderRadius: "2px",
    },
    ".cm-lint-marker": {
      display: "inline-block",
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      cursor: "pointer",
      transition: "transform 0.2s ease",
    },
    ".cm-lint-marker-error": {
      backgroundColor: "#f43f5e",
      boxShadow: "0 0 8px #f43f5e",
    },
    ".cm-lint-marker-warning": {
      backgroundColor: "#f59e0b",
      boxShadow: "0 0 8px #f59e0b",
    },
    ".cm-diagnostic": {
      padding: "8px 12px",
      fontSize: "12px",
      lineHeight: "18px",
    },
    ".cm-diagnostic-error": {
      borderLeft: "3px solid #f43f5e",
    },
    ".cm-diagnosticAction": {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      borderRadius: "4px",
      padding: "2px 8px",
      fontWeight: "600",
      fontSize: "11px",
      marginLeft: "8px",
      cursor: "pointer",
      border: "none",
      transition: "all 0.15s ease",
    },
    ".cm-diagnosticAction:hover": {
      backgroundColor: "#1d4ed8",
      transform: "scale(1.02)",
    },
  },
  { dark: true },
);

// High-Contrast Vibrant Syntax Token Colors
const highlight = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--syn-keyword)", fontWeight: "600" },
  { tag: tags.string, color: "var(--syn-string)" },
  { tag: tags.comment, color: "var(--syn-comment)", fontStyle: "italic" },
  { tag: tags.number, color: "var(--syn-number)" },
  { tag: tags.operator, color: "var(--syn-operator)", fontWeight: "600" },
  { tag: tags.typeName, color: "var(--syn-type)" },
  { tag: tags.propertyName, color: "var(--syn-property)" },
  { tag: tags.bracket, color: "var(--syn-bracket)" },
  { tag: tags.meta, color: "var(--syn-meta)" },
]);

// Rich Contextual Autocomplete & Snippet Provider
const diagramSnippets = [
  snippetCompletion(
    "flowchart TD\n  ${1:Start}[${2:Start Process}] --> ${3:Decision}{${4:Condition?}}\n  ${3:Decision} -->|Yes| ${5:Action}[${6:Execute Task}]\n  ${3:Decision} -->|No| ${7:Retry}[${8:Retry Task}]\n  ${5:Action} --> ${9:End}([${10:Complete}])",
    { label: "flowchart TD", detail: "Flowchart top-to-bottom template", type: "snippet" }
  ),
  snippetCompletion(
    "flowchart LR\n  ${1:A}[${2:Client}] --> ${3:B}[${4:API Gateway}] --> ${5:C}[(${6:Database})]",
    { label: "flowchart LR", detail: "Flowchart left-to-right template", type: "snippet" }
  ),
  snippetCompletion(
    "sequenceDiagram\n  autonumber\n  actor ${1:User}\n  participant ${2:API} as ${3:API Gateway}\n  participant ${4:DB} as ${5:Database}\n\n  ${1:User}->>${2:API}: ${6:POST /orders}\n  activate ${2:API}\n  ${2:API}->>${4:DB}: ${7:INSERT order}\n  ${4:DB}-->>${2:API}: ${8:Order Created}\n  ${2:API}-->>${1:User}: ${9:201 Created Response}\n  deactivate ${2:API}",
    { label: "sequenceDiagram", detail: "Sequence diagram with actors & activations", type: "snippet" }
  ),
  snippetCompletion(
    "classDiagram\n  class ${1:UserService} {\n    +${2:String} ${3:apiKey}\n    +${4:getUser}(id: ${5:String}) ${6:User}\n    +${7:saveUser}(user: ${6:User}) ${8:void}\n  }\n  class ${6:User} {\n    +${2:String} id\n    +${2:String} email\n  }\n  ${1:UserService} --> ${6:User}",
    { label: "classDiagram", detail: "UML Class diagram with methods & relations", type: "snippet" }
  ),
  snippetCompletion(
    "stateDiagram-v2\n  [*] --> ${1:Idle}\n  ${1:Idle} --> ${2:Processing}: submit\n  ${2:Processing} --> ${3:Approved}: approve\n  ${2:Processing} --> ${1:Idle}: reject\n  ${3:Approved} --> [*]",
    { label: "stateDiagram-v2", detail: "State transition diagram template", type: "snippet" }
  ),
  snippetCompletion(
    "erDiagram\n  ${1:CUSTOMER} ||--o{ ${2:ORDER} : places\n  ${1:CUSTOMER} {\n    string id PK\n    string email\n  }\n  ${2:ORDER} {\n    string id PK\n    string customer_id FK\n    float total\n  }",
    { label: "erDiagram", detail: "Entity relationship schema with PK/FK", type: "snippet" }
  ),
  snippetCompletion(
    "architecture-beta\n  group ${1:cloud}(cloud)[${2:Cloud VPC}]\n  service ${3:api}(server)[${4:API Gateway}] in ${1:cloud}\n  service ${5:db}(database)[${6:Primary DB}] in ${1:cloud}\n  ${3:api}:R --> L:${5:db}",
    { label: "architecture-beta", detail: "Cloud Architecture diagram with VPC & services", type: "snippet" }
  ),
  snippetCompletion(
    "packet-beta\n  0-15: \"${1:Source Port}\"\n  16-31: \"${2:Destination Port}\"\n  32-63: \"${3:Sequence Number}\"\n  64-95: \"${4:Acknowledgment Number}\"",
    { label: "packet-beta", detail: "Binary Protocol & Bytefield packet header", type: "snippet" }
  ),
  snippetCompletion(
    "C4Context\n  title ${1:System Context}\n  Person(${2:user}, \"${3:Customer}\", \"${4:User of the service}\")\n  System(${5:system}, \"${6:Platform}\", \"${7:Core banking service}\")\n  Rel(${2:user}, ${5:system}, \"${8:Uses}\", \"${9:HTTPS}\")",
    { label: "C4Context", detail: "C4 System Context diagram", type: "snippet" }
  ),
  snippetCompletion(
    "requirementDiagram\n  requirement ${1:req1} {\n    id: ${2:REQ-1}\n    text: ${3:System must respond within 100ms}\n    risk: ${4:medium}\n    verifymethod: ${5:test}\n  }",
    { label: "requirementDiagram", detail: "Systems Engineering Requirement model", type: "snippet" }
  ),
  snippetCompletion(
    "subgraph ${1:Cluster} [\"${2:Cluster Title}\"]\n  direction ${3:TB}\n  ${4:A} --> ${5:B}\nend",
    { label: "subgraph", detail: "Flowchart subgraph container with direction", type: "snippet" }
  ),
  snippetCompletion(
    "mindmap\n  root((\"${1:Central Theme}\"))\n    ${2:Strategy}\n      ${3:Product Roadmap}\n      ${4:Target Audience}\n    ${5:Architecture}\n      ${6:Frontend}\n      ${7:Backend Services}",
    { label: "mindmap", detail: "Hierarchical mind map structure", type: "snippet" }
  ),
  snippetCompletion(
    "gitGraph\n  commit\n  branch ${1:feature}\n  checkout ${1:feature}\n  commit id: \"${2:feat(ui): add editor}\"\n  checkout main\n  merge ${1:feature}",
    { label: "gitGraph", detail: "Git trunk-based branching workflow", type: "snippet" }
  ),
  // Flowchart Node Shapes
  snippetCompletion('${1:id}["${2:Rectangle}"]', { label: "node-rect", detail: "Node: Rectangle [label]", type: "variable" }),
  snippetCompletion('${1:id}("${2:Rounded}")', { label: "node-round", detail: "Node: Rounded (label)", type: "variable" }),
  snippetCompletion('${1:id}(["${2:Stadium}"])', { label: "node-stadium", detail: "Node: Stadium ([label])", type: "variable" }),
  snippetCompletion('${1:id}[["${2:Subroutine}"]]', { label: "node-subroutine", detail: "Node: Subroutine [[label]]", type: "variable" }),
  snippetCompletion('${1:id}[("${2:Database})"]', { label: "node-cylinder", detail: "Node: Cylinder [(label)]", type: "variable" }),
  snippetCompletion('${1:id}(("${2:Circle})")', { label: "node-circle", detail: "Node: Circle ((label))", type: "variable" }),
  snippetCompletion('${1:id}((("${2:Double Circle})")))', { label: "node-doublecircle", detail: "Node: Double Circle (((label)))", type: "variable" }),
  snippetCompletion('${1:id}{"${2:Decision?}"}', { label: "node-diamond", detail: "Node: Diamond {label}", type: "variable" }),
  snippetCompletion('${1:id}{{"${2:Hexagon}"}}', { label: "node-hexagon", detail: "Node: Hexagon {{label}}", type: "variable" }),
  snippetCompletion('${1:id}[/"${2:Input/Output}"/]', { label: "node-parallelogram", detail: "Node: Parallelogram [/label/]", type: "variable" }),
  snippetCompletion('${1:id}[/"${2:Trapezoid}"\\]', { label: "node-trapezoid", detail: "Node: Trapezoid [/label\\]", type: "variable" }),
  snippetCompletion('${1:id}>"${2:Flag}"]', { label: "node-flag", detail: "Node: Asymmetric Flag >label]", type: "variable" }),
  // Style and Decorator snippets
  snippetCompletion('style ${1:NodeId} fill:${2:#1e293b},stroke:${3:#38bdf8},stroke-width:2px,color:#fff', { label: "style", detail: "Node style directive", type: "property" }),
  snippetCompletion('classDef ${1:accent} fill:${2:#0284c7},stroke:${3:#38bdf8},color:#fff', { label: "classDef", detail: "Reusable class style definition", type: "property" }),
  snippetCompletion('linkStyle ${1:0} stroke:${2:#f59e0b},stroke-width:2px', { label: "linkStyle", detail: "Connection link style directive", type: "property" }),
];

// C4 Architectural Component Snippets
const c4Snippets = [
  snippetCompletion('Person(${1:user}, "${2:Customer}", "${3:User of the service}")', { label: "Person", detail: "C4 Person actor", type: "snippet" }),
  snippetCompletion('System(${1:system}, "${2:Core Platform}", "${3:Primary system description}")', { label: "System", detail: "C4 Software System", type: "snippet" }),
  snippetCompletion('System_Ext(${1:ext}, "${2:Third-Party Service}", "${3:External system}")', { label: "System_Ext", detail: "C4 External System", type: "snippet" }),
  snippetCompletion('Container(${1:app}, "${2:Web App}", "${3:Next.js / Node}", "${4:Serves user UI}")', { label: "Container", detail: "C4 Container Application", type: "snippet" }),
  snippetCompletion('ContainerDb(${1:db}, "${2:Primary DB}", "${3:PostgreSQL / DynamoDB}", "${4:Persists records}")', { label: "ContainerDb", detail: "C4 Database Container", type: "snippet" }),
  snippetCompletion('Rel(${1:user}, ${2:system}, "${3:Uses}", "${4:HTTPS / OAuth2}")', { label: "Rel", detail: "C4 Unidirectional Relationship", type: "snippet" }),
  snippetCompletion('BiRel(${1:systemA}, ${2:systemB}, "${3:Syncs with}", "${4:gRPC / mTLS}")', { label: "BiRel", detail: "C4 Bidirectional Relationship", type: "snippet" }),
];

// Cloud & Infrastructure Stencils Snippets
const cloudSnippets = (CLOUD_STENCILS || []).map((stencil) =>
  snippetCompletion(stencil.codeSnippet.trim(), {
    label: `cloud-${stencil.id}`,
    detail: `${stencil.icon} ${stencil.label} (${stencil.category})`,
    type: "snippet",
    boost: 2,
  })
);

// High-Priority Arrow / Operator Completions
const arrowCompletions = [
  { label: "-->", detail: "Directed arrow link", type: "operator", boost: 16 },
  { label: "-.->", detail: "Dotted directed arrow", type: "operator", boost: 15 },
  { label: "==>", detail: "Thick directed arrow", type: "operator", boost: 15 },
  { label: "-->|label|", detail: "Directed arrow with text label", type: "operator", boost: 14 },
  { label: "-.->|label|", detail: "Dotted arrow with text label", type: "operator", boost: 14 },
  { label: "==>|label|", detail: "Thick arrow with text label", type: "operator", boost: 14 },
  { label: "---", detail: "Solid open line link", type: "operator", boost: 13 },
  { label: "-.-", detail: "Dotted open line link", type: "operator", boost: 13 },
  { label: "===", detail: "Thick open line link", type: "operator", boost: 13 },
  { label: "<-->", detail: "Bidirectional arrow", type: "operator", boost: 12 },
  { label: "--o", detail: "Circle head link", type: "operator", boost: 11 },
  { label: "--x", detail: "Cross head link", type: "operator", boost: 11 },
  { label: "o--o", detail: "Bidirectional circle link", type: "operator", boost: 10 },
  { label: "x--x", detail: "Bidirectional cross link", type: "operator", boost: 10 },
  { label: "->>", detail: "Sequence solid sync message", type: "operator", boost: 14 },
  { label: "-->>", detail: "Sequence dashed reply message", type: "operator", boost: 14 },
];

const allSnippets = [...diagramSnippets, ...c4Snippets, ...cloudSnippets];

const nodeShapeSnippets = [
  snippetCompletion('${1:id}["${2:Process}"]', {
    label: 'id["Label"]',
    detail: 'Rectangle node',
    type: 'variable',
    boost: 22,
  }),
  snippetCompletion('${1:id}("${2:Rounded}")', {
    label: 'id("Rounded")',
    detail: 'Rounded node',
    type: 'variable',
    boost: 21,
  }),
  snippetCompletion('${1:id}[("${2:Database}")]', {
    label: 'id[("Database")]',
    detail: 'Database cylinder shape',
    type: 'variable',
    boost: 21,
  }),
  snippetCompletion('${1:id}(("${2:Circle}"))', {
    label: 'id(("Circle"))',
    detail: 'Circle shape',
    type: 'variable',
    boost: 20,
  }),
  snippetCompletion('${1:id}{"${2:Decision}"}', {
    label: 'id{"Decision"}',
    detail: 'Diamond / decision shape',
    type: 'variable',
    boost: 20,
  }),
  snippetCompletion('${1:id}{{"${2:Hexagon}"}}', {
    label: 'id{{"Hexagon"}}',
    detail: 'Hexagon shape',
    type: 'variable',
    boost: 19,
  }),
  snippetCompletion('${1:id}[["${2:Subroutine}"]]', {
    label: 'id[["Subroutine"]]',
    detail: 'Subroutine shape',
    type: 'variable',
    boost: 19,
  }),
  snippetCompletion('${1:id}[/"${2:Input/Output}"/]', {
    label: 'id[/"Input/Output"/]',
    detail: 'Parallelogram shape',
    type: 'variable',
    boost: 19,
  }),
];

const flowchartKeywords = [
  "subgraph", "end", "direction", "TB", "TD", "BT", "RL", "LR",
  "style", "classDef", "linkStyle", "interpolate", "click"
];
const sequenceKeywords = [
  "participant", "actor", "boundary", "control", "entity", "database", "collections",
  "create", "destroy", "box", "autonumber", "activate", "deactivate", "alt", "else", "opt",
  "loop", "par", "and", "critical", "break", "rect", "note", "over", "right of", "left of", "as"
];
const classKeywords = [
  "class", "interface", "enum", "abstract", "service"
];
const stateKeywords = [
  "state", "fork", "join", "choice"
];
const erKeywords = [
  "string", "int", "integer", "boolean", "datetime", "timestamp", "uuid", "float", "PK", "FK", "UK"
];

const diagramTypeKeywords = new Set([
  "flowchart", "graph", "sequenceDiagram", "classDiagram", "stateDiagram", "stateDiagram-v2", "erDiagram",
  "gantt", "pie", "journey", "gitGraph", "mindmap", "timeline", "quadrantChart", "xychart", "xychart-beta",
  "sankey", "sankey-beta", "block", "block-beta", "packet", "packet-beta", "architecture", "architecture-beta",
  "requirementDiagram", "C4Context", "kanban", "zenuml",
]);
const keywordCompletions = keywords.map((label) => ({
  label,
  type: "keyword",
}));

const CodeEditor = forwardRef(function CodeEditor(
  { document, previewError, onChange, onContextMenu, isVisible = true },
  ref
) {
  const host = useRef(null);
  const editor = useRef(null);
  const latest = useRef({ document, onChange, previewError });
  const states = useRef(new Map());
  const currentId = useRef(document?.id);
  const compartment = useRef(new Compartment());
  const lastSentTextRef = useRef(document?.source ?? "");

  // Encapsulated Syntax Diagnostics, Fix & Explanation Logic
  const {
    syntaxStatus,
    setSyntaxStatus,
    fixBusy,
    fixSuccessMsg,
    fixFailMsg,
    showSuggestions,
    setShowSuggestions,
    explanations,
    goToLine,
    commentOutLine,
    runAiFix,
    applyLineRepair,
  } = useEditorDiagnostics({
    editorRef: editor,
    document,
    previewError,
    onChange,
    currentIdRef: currentId,
  });

  // Real-time As-You-Type CodeMirror Linter Extension
  const syntaxLinter = useMemo(() => {
    return linter(
      async (view) => {
        const code = view.state.doc.toString();
        if (!code.trim()) {
          setSyntaxStatus({ valid: true, error: null, line: null, raw: null });
          return [];
        }

        const fmt = latest.current.document?.format || "mermaid";
        let error = null;

        if (fmt === "mermaid") {
          const v = await testMermaidSyntax(code);
          if (!v.valid) error = v.error;
        } else if (fmt === "json") {
          try {
            JSON.parse(code);
          } catch (e) {
            error = e.message;
          }
        } else {
          // Derived format verification
          try {
            const { compileDocument } = await import("../lib/formats.js");
            const compiled = await compileDocument({ format: fmt, source: code });
            const v = await testMermaidSyntax(compiled.code);
            if (!v.valid) error = v.error;
          } catch (e) {
            error = e.message;
          }
        }

        if (!error) {
          setSyntaxStatus({ valid: true, error: null, line: null, raw: null });
          return [];
        }

        const details = parseErrorDetails(error, code);
        setSyntaxStatus({
          valid: false,
          error: details.message,
          line: details.line,
          raw: details.raw,
        });

        const lineNum = Math.max(1, Math.min(details.line, view.state.doc.lines));
        const lineObj = view.state.doc.line(lineNum);
        const col = details.column || 0;
        const from = col > 0 && lineObj.from + col <= lineObj.to
          ? lineObj.from + Math.max(0, col - 1)
          : lineObj.from;
        const to = col > 0 && lineObj.from + col <= lineObj.to
          ? Math.min(lineObj.to, from + 4)
          : (lineObj.to > from ? lineObj.to : Math.min(view.state.doc.length, from + 1));

        return [
          {
            from,
            to,
            severity: "error",
            message: `Line ${details.line}: ${details.message}`,
            actions: [
              {
                name: "⚡ AI Quick Fix",
                apply() {
                  runAiFix();
                },
              },
              {
                name: "💬 Comment Line",
                apply(v) {
                  const l = v.state.doc.lineAt(from);
                  v.dispatch({
                    changes: { from: l.from, to: l.from, insert: "%% " },
                  });
                  latest.current.onChange(currentId.current, v.state.doc.toString());
                },
              },
            ],
          },
        ];
      },
      { delay: 160 }
    );
  }, [runAiFix]);

  const createState = useCallback(
    (doc) =>
      EditorState.create({
        doc: doc.source,
        extensions: [
          basicSetup,
          theme,
          syntaxHighlighting(highlight),
          compartment.current.of(language(doc)),
          lintGutter(),
          syntaxLinter,
          search({ top: true }),
          keymap.of([
            ...searchKeymap,
            {
              key: "Alt-f",
              run: () => {
                runAiFix();
                return true;
              },
            },
          ]),
          EditorView.contentAttributes.of({
            "aria-label": "Diagram source code",
            spellcheck: "false",
          }),
          autocompletion({
            override: [
              (context) => {
                const doc = context.state.doc;
                const text = doc.toString();
                const line = doc.lineAt(context.pos);
                const lineBeforeCursor = line.text.slice(0, context.pos - line.from);

                // 1. Arrow / operator matching (typing -, =, ., <, >, |)
                const arrowMatch = context.matchBefore(/[-=.><|]+/);
                if (arrowMatch && arrowMatch.from !== arrowMatch.to) {
                  const query = arrowMatch.text;
                  const matches = arrowCompletions.filter(
                    (a) => a.label.startsWith(query) || query.length <= 1
                  );
                  if (matches.length > 0) {
                    return {
                      from: arrowMatch.from,
                      options: matches,
                    };
                  }
                }

                // 2. Suppress keyword completion inside quoted strings or node shape brackets
                const quoteCount = (lineBeforeCursor.match(/"/g) || []).length;
                if (quoteCount % 2 === 1) return null;

                const openBrackets = (lineBeforeCursor.match(/\[/g) || []).length;
                const closeBrackets = (lineBeforeCursor.match(/\]/g) || []).length;
                if (openBrackets > closeBrackets) return null;

                // 3. Word or identifier matching
                const word = context.matchBefore(/[\w-]*/);
                if (!word || (word.from === word.to && !context.explicit)) return null;

                const atStatementStart =
                  line.number === 1 ||
                  !lineBeforeCursor.slice(0, word.from - line.from).trim();
                const isAfterArrow =
                  /(?:-->|-.->|==>|---|===|->>|-->>|<-->|\s+as\s+)\s*$/.test(
                    lineBeforeCursor.slice(0, word.from - line.from)
                  );

                // Dynamically scan declared nodes in the active file
                const declaredNodes = [];
                try {
                  const decls = scanNodeDeclarations(text);
                  const seenIds = new Set();
                  for (const [, decl] of decls) {
                    if (!seenIds.has(decl.id)) {
                      seenIds.add(decl.id);
                      declaredNodes.push({
                        label: decl.id,
                        detail: `${decl.open}${decl.label || decl.id}${decl.close}`,
                        type: "variable",
                        boost: isAfterArrow ? 25 : 8,
                      });
                    }
                  }
                } catch {
                  // Fallback gracefully
                }

                if (isAfterArrow) {
                  return {
                    from: word.from,
                    options: [
                      ...declaredNodes,
                      ...nodeShapeSnippets,
                    ],
                  };
                }

                const seen = new Set(declaredNodes.map((d) => d.label));
                const symbols = [];
                for (const match of text.matchAll(/\b[A-Za-z_][\w-]*\b/g)) {
                  const id = match[0];
                  if (id.length < 2 || seen.has(id) || id === word.text) continue;
                  seen.add(id);
                  if (!keywords.includes(id)) {
                    symbols.push({
                      label: id,
                      type: "variable",
                      detail: "in this file",
                      boost: 2,
                    });
                  }
                }

                const firstLine = text.split("\n").find((l) => l.trim().length > 0) || "";
                let contextualKeywords = [];
                if (/^(?:flowchart|graph)\b/i.test(firstLine)) {
                  contextualKeywords = flowchartKeywords.map((label) => ({ label, type: "keyword", boost: 12 }));
                } else if (/^sequenceDiagram\b/i.test(firstLine)) {
                  contextualKeywords = sequenceKeywords.map((label) => ({ label, type: "keyword", boost: 12 }));
                } else if (/^classDiagram\b/i.test(firstLine)) {
                  contextualKeywords = classKeywords.map((label) => ({ label, type: "keyword", boost: 12 }));
                } else if (/^stateDiagram\b/i.test(firstLine)) {
                  contextualKeywords = stateKeywords.map((label) => ({ label, type: "keyword", boost: 12 }));
                } else if (/^erDiagram\b/i.test(firstLine)) {
                  contextualKeywords = erKeywords.map((label) => ({ label, type: "keyword", boost: 12 }));
                } else {
                  contextualKeywords = keywordCompletions.filter((k) => !diagramTypeKeywords.has(k.label));
                }

                const structural = line.number === 1 || !text.slice(0, line.from).trim();
                return {
                  from: word.from,
                  options: [
                    ...(structural ? allSnippets : []),
                    ...(structural ? keywordCompletions.filter((k) => diagramTypeKeywords.has(k.label)) : []),
                    ...(atStatementStart ? contextualKeywords : []),
                    ...declaredNodes,
                    ...symbols,
                  ],
                };
              },
            ],
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newText = update.state.doc.toString();
              lastSentTextRef.current = newText;
              const targetDocId = latest.current.document?.id || currentId.current;
              pendingChangeRef.current = { id: targetDocId, text: newText };
              if (!changeRafRef.current) {
                changeRafRef.current = requestAnimationFrame(() => {
                  changeRafRef.current = 0;
                  if (pendingChangeRef.current && latest.current.onChange) {
                    const { id, text } = pendingChangeRef.current;
                    pendingChangeRef.current = null;
                    latest.current.onChange(id, text);
                  }
                });
              }
            }
          }),
        ],
      }),
    [syntaxLinter, runAiFix]
  );

  const changeRafRef = useRef(0);
  const pendingChangeRef = useRef(null);

  const flushPendingChange = useCallback(() => {
    if (changeRafRef.current) {
      cancelAnimationFrame(changeRafRef.current);
      changeRafRef.current = 0;
    }
    if (pendingChangeRef.current && latest.current.onChange) {
      const { id, text } = pendingChangeRef.current;
      pendingChangeRef.current = null;
      latest.current.onChange(id, text);
    }
  }, []);

  // Create the view once per mount.
  const hasDocument = Boolean(document);
  const lastLanguageRef = useRef("");

  useEffect(() => {
    if (!hasDocument || !host.current) return;
    if (editor.current) return; // Prevent recreation and focus loss on parent re-renders
    host.current.innerHTML = "";
    const initialDoc = latest.current.document;
    lastSentTextRef.current = initialDoc?.source ?? "";
    editor.current = new EditorView({
      state: createState(initialDoc),
      parent: host.current,
    });
    if (host.current) host.current._editorView = editor.current;
    currentId.current = initialDoc?.id;
    lastLanguageRef.current = `${initialDoc?.format || "mermaid"}:${initialDoc?.name || ""}`;
    return () => {
      flushPendingChange();
      if (host.current) host.current._editorView = null;
      editor.current?.destroy();
      editor.current = null;
    };
  }, [hasDocument, createState]);

  useEffect(() => {
    if (!document || !editor.current) return;
    const view = editor.current;

    // 1. Switched to a different active document
    if (currentId.current !== document.id) {
      if (currentId.current) {
        states.current.set(currentId.current, view.state);
      }
      currentId.current = document.id;
      lastSentTextRef.current = document.source ?? "";
      const cached = states.current.get(document.id);
      view.setState(cached || createState(document));
      lastLanguageRef.current = `${document.format || "mermaid"}:${document.name || ""}`;
      return;
    }

    // 2. If the document.source matches what was sent from this CodeMirror instance
    // or matches what the editor already contains, skip re-dispatching to preserve
    // cursor position, selection, undo tree, and typing flow.
    const currentDocText = view.state.doc.toString();
    if (document.source === lastSentTextRef.current || document.source === currentDocText) {
      return;
    }

    // 3. Genuine external change to document source (template loaded, AI quick fix, visual drag-and-drop)
    lastSentTextRef.current = document.source;
    const curSel = view.state.selection;
    view.dispatch({
      changes: {
        from: 0,
        to: currentDocText.length,
        insert: document.source,
      },
      selection: curSel
        ? { anchor: Math.min(curSel.main.anchor, document.source.length) }
        : undefined,
    });

    // 4. Reconfigure language compartment only if format or filename changed
    const langKey = `${document.format || "mermaid"}:${document.name || ""}`;
    if (lastLanguageRef.current !== langKey) {
      lastLanguageRef.current = langKey;
      view.dispatch({
        effects: compartment.current.reconfigure(language(document)),
      });
    }
  }, [document?.id, document?.source, document?.format, document?.name, createState]);

  // Re-measure editor when visibility toggles from hidden to split or code
  useEffect(() => {
    if (isVisible && editor.current) {
      editor.current.requestMeasure();
    }
  }, [isVisible]);

  const formatDocument = useCallback(() => {
    if (!editor.current || !latest.current.document) return;
    const view = editor.current;
    const docText = view.state.doc.toString();
    try {
      const formatted = formatMermaidCode(docText);
      if (formatted && formatted !== docText) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: formatted },
        });
        latest.current.onChange(currentId.current, formatted);
      }
    } catch (e) {
      console.warn("Format document error:", e);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    undo: () => editor.current && undo(editor.current),
    redo: () => editor.current && redo(editor.current),
    search: () => editor.current && openSearchPanel(editor.current),
    focus: () => editor.current?.focus(),
    format: formatDocument,
    runAiFix,
    insertText: (snippet) => {
      const v = editor.current;
      if (!v || !snippet) return;
      const sel = v.state.selection.main;
      v.dispatch({
        changes: { from: sel.from, to: sel.to, insert: snippet },
        selection: { anchor: sel.from + snippet.length },
        effects: EditorView.scrollIntoView(sel.from + snippet.length, { y: "nearest" }),
      });
      v.focus();
    },
    selectAll: () => {
      const v = editor.current;
      if (v) {
        v.dispatch({ selection: { anchor: 0, head: v.state.doc.length } });
        v.focus();
      }
    },
    copyAll: () => {
      const v = editor.current;
      if (v) {
        navigator.clipboard?.writeText(v.state.doc.toString());
      }
    },
    // Select a node's declaration (falling back to its first mention) so a
    // canvas click is mirrored in the source. Does not take focus.
    reveal: (id) => {
      const v = editor.current;
      if (!v || !id) return;
      const text = v.state.doc.toString();
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const declaration = new RegExp(`(^|[^\\w-])(${escaped})(?=\\s*(\\[|\\(|\\{))`, "m").exec(text);
      const mention = new RegExp(`(^|[^\\w-])(${escaped})(?![\\w-])`, "m").exec(text);
      const hit = declaration || mention;
      if (!hit) return;
      const from = hit.index + hit[1].length;
      const line = v.state.doc.lineAt(from);
      const closing = declaration ? line.text.slice(from - line.from).search(/[\]\)\}]/) : -1;
      const to = declaration && closing > -1 ? from + closing + 1 : from + id.length;
      v.dispatch({
        selection: { anchor: from, head: Math.min(to, line.to) },
        effects: EditorView.scrollIntoView(from, { y: "nearest" }),
      });
    },
    goTo: (line) => {
      const v = editor.current;
      if (v) {
        const at = v.state.doc.line(
          Math.max(1, Math.min(line, v.state.doc.lines)),
        ).from;
        v.dispatch({
          selection: { anchor: at },
          effects: EditorView.scrollIntoView(at, { y: "center" }),
        });
        v.focus();
      }
    },
  }));

  return (
    <div
      className="flex h-full flex-col min-h-0 bg-background"
      onClick={(e) => {
        if (editor.current && !editor.current.hasFocus && !e.target.closest("button, a, input, select, textarea")) {
          editor.current.focus();
        }
      }}
    >
      {/* Floating AI Diagnostic, Fix & Autocomplete Status Bar & Popover */}
      <EditorDiagnosticsBanner
        document={document}
        syntaxStatus={syntaxStatus}
        fixBusy={fixBusy}
        fixSuccessMsg={fixSuccessMsg}
        fixFailMsg={fixFailMsg}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        explanations={explanations}
        goToLine={goToLine}
        runAiFix={runAiFix}
        applyLineRepair={applyLineRepair}
        commentOutLine={commentOutLine}
      />

      {/* CodeMirror Mounting Host */}
      <div
        ref={host}
        className="code-mirror flex-1 min-h-0 overflow-hidden cursor-text"
        onClick={(e) => {
          if (!editor.current) return;
          if (!editor.current.hasFocus) {
            editor.current.focus();
          }
          const content = host.current?.querySelector(".cm-content");
          if (content && e.clientY > content.getBoundingClientRect().bottom) {
            editor.current.dispatch({
              selection: { anchor: editor.current.state.doc.length },
            });
          }
        }}
        onContextMenu={(e) => {
          if (onContextMenu) {
            e.preventDefault();
            onContextMenu(e);
          }
        }}
      />
    </div>
  );
});

export default CodeEditor;
