# Diagramming product research

Reviewed on 15 October 2026. This is a product-pattern review based on current public product and documentation pages, not a feature-by-feature hands-on benchmark. Plan availability and capabilities can change.

## Products reviewed

| Product | Observable product pattern | Useful lesson for NodeFlow |
| --- | --- | --- |
| [Miro](https://miro.com/product-overview/) | An intelligent canvas combines diagramming, planning, AI, templates, and integrations. Miro’s diagram workflow can use selected or mentioned canvas content as prompt context, and generated output remains editable on the board. | Let the active document and canvas selection inform AI requests. Keep generation and refinement in the workspace, and use role-based examples for PM, QA, engineering, and general users. |
| [Lucidchart](https://lucid.co/lucidchart) | AI creation and summarization sit beside data imports, data linking, conditional formatting, layers, collaboration, and integrations. | Treat diagrams as working artifacts: preserve source, expose diagnostics, and make iteration and import/export discoverable. Avoid positioning a converter list as the whole product. |
| [Eraser](https://docs.eraser.io/quickstart) | AI output is diagram-as-code; users can edit source while the canvas updates. It supports refinement prompts, templates, rules, references, files, repositories, and agent integrations. | NodeFlow’s editable source and preview are strong foundations. The next AI step should propose validated edits against the open document, with a reviewable preview and undo. |

## NodeFlow’s current position

NodeFlow already combines editable source, live previews, direct canvas editing for supported Mermaid families, import adapters, local storage, project backups, and multiple AI routes. Its clearest distinction is the combination of source-first editing, format conversion, local inference, and provider choice in an open-source browser app.

Current product limits matter to the positioning: there is no account system, shared cloud workspace, real-time collaboration, SSO, admin policy, or service worker. Gemini and OpenAI-compatible modes send the submitted prompt to their provider; credentials are stored in browser local storage in the client-only mode. “Enterprise-ready” or “100% private” claims would overstate the current product.

## Product priorities suggested by the review

1. **Make AI contextual.** Include the active document and selected diagram elements in the request, with a clear context summary and a control for what gets sent.
2. **Make edits reviewable.** Ask models for typed operations, validate them, show a source/canvas preview, and apply them as one undoable transaction.
3. **Keep the source and canvas in sync.** Build on the existing editor and canvas, so users can choose code or direct manipulation without losing the other representation.
4. **Lead with useful role workflows.** Show practical examples such as requirement-to-flow for PMs, edge cases for QA, API-to-sequence for developers, and explain/simplify for students.
5. **Earn enterprise claims through capabilities.** Prioritize a server-side credential option, explicit provider data handling, collaboration, access controls, auditability, and deployment documentation before marketing administrative controls.
6. **Market only verified behavior.** State which formats are native, which are converted subsets, where cloud data goes, and which exports are raster or vector.

## Source notes

- Miro overview and AI diagram flow: [product overview](https://miro.com/product-overview/), [Miro Diagrams help](https://help.miro.com/hc/en-us/articles/25275263961874-Miro-Diagrams), [AI diagram generator](https://miro.com/ai/diagram-ai/).
- Lucid capabilities: [Lucidchart product page](https://lucid.co/lucidchart), [Lucid AI diagramming](https://app.lucid.co/lucidchart/use-cases/diagram-with-AI).
- Eraser workflow and documentation: [Quickstart](https://docs.eraser.io/quickstart), [Eraser docs](https://docs.eraser.io/).
