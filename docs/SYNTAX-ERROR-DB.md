# Syntax-Error Database

Source: `src/utils/syntax-error-db.js` (60+ entries and growing).
Each entry: `id`, `formats`, `test`, `symptom`, `cause`, `fix`, `exampleBad`, `exampleGood`.

## How it is used

1. **DiagnosticsPanel** (`src/components/DiagnosticsPanel.jsx`) — shown under
   Problems & output whenever a preview fails. Lists matching entries with
   cause/fix/examples and an **Auto-fix** button.
2. **Universal fixer** (`src/utils/universal-fixer.js`) — deterministic pre-fixes
   per format, then the Mermaid rule engine (`ai-syntax-fixer.js`, extended to all
   17 diagram types), then optional LLM fallback.
3. **Studio Problems panel** — one-click apply writes fixed source back to the file.

## Coverage

- Mermaid core: missing header, legacy graph, flowchart arrows/pipes/quotes/subgraphs,
  class braces/visibility/generics, ER cardinality/parens, sequence arrows/colons/actors,
  state v2/`[*]`, gantt dateFormat/tasks, journey scores, quadrant points, pie quotes,
  gitGraph commits, C4 casing, mindmap root, timeline, kanban, xy-axis, sankey commas,
  block columns, frontmatter, fences, unbalanced quotes/brackets, reserved words.
- PlantUML: missing wrappers, skinparam notice, arrow mapping.
- DOT/D2: braces, semicolons, direction.
- SQL/DBML/Prisma/GraphQL/OpenAPI/AsyncAPI/JSON-Schema/Proto/XMI: shape checks.
- XML family (drawio/bpmn/freemind/opml/xmi/archimate): entities, namespaces,
  compressed pages, flow refs.
- Terraform/CSV/Markdown/code: braces, headers/delimiters, bullets, type declarations.

## Adding a new entry

```js
{ id: 'mermaid-my-rule', formats: ['mermaid'], test: /regex/ or (code)=>bool,
  symptom: '...', cause: '...', fix: '...',
  exampleBad: '...', exampleGood: '...' },
```

Then add the corresponding auto-fix to `applyRuleBasedFixes` (mermaid) or
`preFixByFormat` (other formats) and a case in `tests/universal.test.mjs`.
