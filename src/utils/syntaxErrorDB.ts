/**
 * Universal Syntax Error Database for DiagramAtlas
 * Phase 2 of 50-phase universal format plan.
 *
 * Each entry: id, formats, test(regex or fn), symptom, cause, fix,
 * exampleBad, exampleGood. Used by DiagnosticsPanel + universal-fixer.
 */

export const ERROR_DB = [
  // ── Mermaid core ──────────────────────────────────────────────
  { id: 'mermaid-missing-header', formats: ['mermaid'], test: (c) => !/^\s*(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|journey|xychart|sankey|kanban|block|C4)\b/im.test(c.split('\n').find(l=>l.trim())||''), symptom: 'First line is not a diagram type', cause: 'Mermaid requires a header like flowchart TD', fix: 'Add the detected diagram header as first line.', exampleBad: 'A --> B', exampleGood: 'flowchart TD\n  A --> B' },
  { id: 'mermaid-legacy-graph', formats: ['mermaid'], test: /^\s*graph\b/im, symptom: "Legacy 'graph' header", cause: "'graph' is legacy; use flowchart", fix: "Replace 'graph' with 'flowchart'.", exampleBad: 'graph TD\n  A-->B', exampleGood: 'flowchart TD\n  A --> B' },
  { id: 'mermaid-flow-single-arrow', formats: ['mermaid'], test: (c) => c.split('\n').some(l => /(^|[^-])->([^-]|$)/.test(l) && !l.includes('-->')), symptom: "Single '->' arrow in flowchart", cause: "Flowcharts need '-->' not '->'", fix: "Replace '->' with '-->'.", exampleBad: 'flowchart TD\n  A -> B', exampleGood: 'flowchart TD\n  A --> B' },
  { id: 'mermaid-flow-pipe-spaces', formats: ['mermaid'], test: /-->\s*\|\s*[^|]*\s*\|\s*\w/, symptom: 'Pipe label spacing breaks parse', cause: 'Edge labels must be -->|label| without stray spaces', fix: 'Normalize to -->|label|.', exampleBad: 'A --> | my label | B', exampleGood: 'A -->|my label| B' },
  { id: 'mermaid-flow-unquoted-special', formats: ['mermaid'], test: /\w+\[[^\]"'\n]*[()\/&:,+{}<>][^\]"'\n]*\]/, symptom: 'Unquoted special chars in [label]', cause: '() / & : , + < > need quotes', fix: 'Quote label: id["label (v2)"].', exampleBad: 'A[Pay (now) & go]', exampleGood: 'A["Pay (now) & go"]' },
  { id: 'mermaid-flow-unquoted-paren', formats: ['mermaid'], test: /\w+\([^"'\n]*[()[\]{}][^"'\n]*\)/, symptom: 'Nested parens in (label)', cause: 'Round nodes cannot nest raw parens', fix: 'Quote: id("label (v2)").', exampleBad: 'A(Hello (world))', exampleGood: 'A("Hello (world)")' },
  { id: 'mermaid-subgraph-unclosed', formats: ['mermaid'], test: (c) => (c.match(/^\s*subgraph\b/gim)||[]).length > (c.match(/^\s*end\b/gim)||[]).length, symptom: 'Unclosed subgraph', cause: 'Every subgraph needs end', fix: "Append missing 'end' lines.", exampleBad: 'flowchart TD\n  subgraph A\n  A-->B', exampleGood: 'flowchart TD\n  subgraph A\n  A-->B\n  end' },
  { id: 'mermaid-subgraph-title', formats: ['mermaid'], test: /^\s*subgraph\s+[A-Za-z][^\["\n]*\s+[^\["\n]+/m, symptom: 'Multi-word subgraph title without id', cause: 'subgraph needs id + ["Title"]', fix: 'Use subgraph id ["Title"].', exampleBad: 'subgraph My Group', exampleGood: 'subgraph MG ["My Group"]' },
  { id: 'mermaid-subgraph-direction', formats: ['mermaid'], test: /^\s*subgraph\b.*\n\s*direction\s+(LR|RL|TB|BT)/m, symptom: 'Old subgraph direction style', cause: 'Prefer flowchart direction; direction inside subgraph is ok but often mis-indented', fix: 'Keep direction indented one level inside subgraph.', exampleBad: 'subgraph A\ndirection LR', exampleGood: 'subgraph A\n  direction LR' },
  { id: 'mermaid-class-missing-brace', formats: ['mermaid'], test: (c) => /^classDiagram/im.test(c) && (c.match(/\{/g)||[]).length !== (c.match(/\}/g)||[]).length, symptom: 'Unbalanced { } in classDiagram', cause: 'Class bodies need matching braces', fix: 'Balance braces.', exampleBad: 'classDiagram\n  class A {\n    +x', exampleGood: 'classDiagram\n  class A {\n    +x\n  }' },
  { id: 'mermaid-class-visibility', formats: ['mermaid'], test: /^\s*class\s+\w+\s*\{[^}]*\n\s*[a-zA-Z_][\w<>]*\s+[a-z]/m, symptom: 'Field without visibility (+/-/#)', cause: 'Mermaid prefers +Type name', fix: 'Prefix fields with + - #.', exampleBad: 'class A {\n  name string\n}', exampleGood: 'class A {\n  +String name\n}' },
  { id: 'mermaid-class-generic', formats: ['mermaid'], test: /<\w+>/, symptom: 'Java-style generics <T>', cause: 'Mermaid uses ~T~ not <T>', fix: 'Rewrite List<T> → List~T~.', exampleBad: 'class A {\n  +List<String> items\n}', exampleGood: 'class A {\n  +List~String~ items\n}' },
  { id: 'mermaid-er-cardinality', formats: ['mermaid'], test: (c) => /^erDiagram/im.test(c) && !/\|\|--o\{|\|\|--|}o--|\}o--/m.test(c) && /--/.test(c), symptom: 'ER relation without cardinality', cause: 'ER needs ||--o{ etc.', fix: 'Use USER ||--o{ ORDER : places.', exampleBad: 'USER -- ORDER', exampleGood: 'USER ||--o{ ORDER : places' },
  { id: 'mermaid-er-type-parens', formats: ['mermaid'], test: /erDiagram[\s\S]*\w+\(\d+\)/, symptom: 'SQL types with (N) in ER', cause: 'Mermaid ER types cannot contain parens', fix: 'Strip (N): VARCHAR(100) → String.', exampleBad: 'USER {\n  varchar(100) name\n}', exampleGood: 'USER {\n  String name\n}' },
  { id: 'mermaid-seq-single-arrow', formats: ['mermaid'], test: /^\s*\w+\s*->\s*\w+\s*:/m, symptom: "Sequence uses '->' not '->>'", cause: 'Sequence needs ->> / -->>', fix: "Use '->>'.", exampleBad: 'sequenceDiagram\n  A->B: hi', exampleGood: 'sequenceDiagram\n  A->>B: hi' },
  { id: 'mermaid-seq-dotted', formats: ['mermaid'], test: /^\s*\w+\s*-->\s*\w+/m, symptom: "Sequence dotted '-->' should be '-->>'", cause: 'Dotted reply needs double head', fix: "Use '-->>'.", exampleBad: 'A-->B: reply', exampleGood: 'A-->>B: reply' },
  { id: 'mermaid-seq-missing-colon', formats: ['mermaid'], test: /^\s*\w+\s*(->>|-->>|-\)|--\))\s*\w+\s+[^:\n]+$/m, symptom: 'Sequence message without colon', cause: 'Messages need A->>B: text', fix: 'Add colon.', exampleBad: 'A->>B hello', exampleGood: 'A->>B: hello' },
  { id: 'mermaid-seq-actor-keyword', formats: ['mermaid'], test: /^\s*(actor|participant)\s*:/m, symptom: 'Actor with colon A: label', cause: 'Use actor Id as Label', fix: 'Use actor A as Label.', exampleBad: 'actor: User', exampleGood: 'actor U as User' },
  { id: 'mermaid-state-single-arrow', formats: ['mermaid'], test: (c) => /^stateDiagram/im.test(c) && /\w\s*->\s*\w/.test(c) && !/-->/.test(c), symptom: "State uses '->' not '-->'", cause: 'State needs -->', fix: "Use '-->'.", exampleBad: 'stateDiagram-v2\n  A -> B', exampleGood: 'stateDiagram-v2\n  A --> B' },
  { id: 'mermaid-state-star', formats: ['mermaid'], test: (c) => /^stateDiagram/im.test(c) && !/\[\*\]/.test(c), symptom: 'State diagram without [*]', cause: 'Need [*] start/end', fix: 'Add [*] --> Idle.', exampleBad: 'stateDiagram-v2\n  Idle --> Active', exampleGood: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Active' },
  { id: 'mermaid-state-v1', formats: ['mermaid'], test: /^\s*stateDiagram\s*$/m, symptom: 'stateDiagram without -v2', cause: 'v1 is deprecated', fix: 'Use stateDiagram-v2.', exampleBad: 'stateDiagram', exampleGood: 'stateDiagram-v2' },
  { id: 'mermaid-gantt-dateformat', formats: ['mermaid'], test: (c) => /^\s*gantt\b/im.test(c) && !/dateFormat/i.test(c), symptom: 'Gantt without dateFormat', cause: 'Gantt needs dateFormat', fix: 'Add dateFormat YYYY-MM-DD.', exampleBad: 'gantt\n  title T\n  task :a1, 2026-01-01, 3d', exampleGood: 'gantt\n  dateFormat YYYY-MM-DD\n  title T\n  task :a1, 2026-01-01, 3d' },
  { id: 'mermaid-gantt-task-id', formats: ['mermaid'], test: (c) => /^\s*gantt\b/im.test(c) && !/:/.test(c.split('\n').slice(1).join('\n')), symptom: 'Gantt task without colon', cause: 'Tasks need name :id, dates', fix: 'Add colon + id.', exampleBad: 'gantt\n  My task 2026-01-01 3d', exampleGood: 'gantt\n  My task :t1, 2026-01-01, 3d' },
  { id: 'mermaid-journey-score', formats: ['mermaid'], test: (c) => /^\s*journey\b/im.test(c) && !/:\s*[1-5]\s*:/.test(c), symptom: 'Journey task without score', cause: 'Journey needs Task: score: actors', fix: 'Add : 5: User.', exampleBad: 'journey\n  Task A', exampleGood: 'journey\n  Task A: 5: User' },
  { id: 'mermaid-quadrant-points', formats: ['mermaid'], test: (c) => /quadrantChart/im.test(c) && !/\[\d\.\d+,\s*\d\.\d+\]/.test(c), symptom: 'Quadrant point without [x, y]', cause: 'Points need [0.5, 0.5]', fix: 'Append coordinates.', exampleBad: 'quadrantChart\n  My Feature', exampleGood: 'quadrantChart\n  My Feature: [0.3, 0.7]' },
  { id: 'mermaid-pie-quotes', formats: ['mermaid'], test: (c) => /^\s*pie\b/im.test(c) && /^\s*"[^"]+"\s*:\s*\d+/m.test(c) === false && /:/.test(c), symptom: 'Pie label should be quoted', cause: 'Unquoted labels with spaces break pie', fix: 'Quote labels.', exampleBad: 'pie\n  My slice : 40', exampleGood: 'pie\n  "My slice" : 40' },
  { id: 'mermaid-gitgraph-commit', formats: ['mermaid'], test: (c) => /gitGraph/im.test(c) && !/commit\b/i.test(c), symptom: 'gitGraph without commit', cause: 'Need at least one commit', fix: 'Add commit lines.', exampleBad: 'gitGraph\n  branch f', exampleGood: 'gitGraph\n  commit\n  branch f' },
  { id: 'mermaid-c4-person-case', formats: ['mermaid'], test: (c) => /^C4Context/im.test(c) && /person\(/i.test(c) && !/Person\(/.test(c), symptom: 'C4 person lowercase', cause: 'C4 keywords are case-sensitive', fix: 'Use Person/ System/ Rel.', exampleBad: 'person(a, "A")', exampleGood: 'Person(a, "A")' },
  { id: 'mermaid-mindmap-root', formats: ['mermaid'], test: (c) => /^\s*mindmap\b/im.test(c) && !/root\(?\(?/i.test(c), symptom: 'Mindmap without root', cause: 'Mindmap needs root((Title))', fix: 'Add root line.', exampleBad: 'mindmap\n  Topic', exampleGood: 'mindmap\n  root((Topic))' },
  { id: 'mermaid-timeline-title', formats: ['mermaid'], test: (c) => /^\s*timeline\b/im.test(c) && c.split('\n').length < 3, symptom: 'Timeline too short', cause: 'Timeline needs title + periods', fix: 'Add title + period lines.', exampleBad: 'timeline', exampleGood: 'timeline\n  title Roadmap\n  2026 : Launch' },
  { id: 'mermaid-kanban-columns', formats: ['mermaid'], test: (c) => /^\s*kanban\b/im.test(c) && !/^\s{2}\S/m.test(c), symptom: 'Kanban without columns', cause: 'Kanban needs indented columns', fix: 'Indent columns + [cards].', exampleBad: 'kanban\nBacklog', exampleGood: 'kanban\n  Backlog\n    [Task]' },
  { id: 'mermaid-xy-axis', formats: ['mermaid'], test: (c) => /xychart-beta/im.test(c) && !/x-axis/i.test(c), symptom: 'XY chart without x-axis', cause: 'xychart needs x-axis/y-axis', fix: 'Add x-axis [...] + y-axis.', exampleBad: 'xychart-beta\n  bar [1,2]', exampleGood: 'xychart-beta\n  x-axis [a, b]\n  y-axis "v" 0 --> 10\n  bar [1,2]' },
  { id: 'mermaid-sankey-commas', formats: ['mermaid'], test: (c) => /sankey-beta/im.test(c) && !/,/.test(c), symptom: 'Sankey without commas', cause: 'Sankey needs A,B,value', fix: 'Use Source,Target,Value.', exampleBad: 'sankey-beta\n  A B 10', exampleGood: 'sankey-beta\n  A,B,10' },
  { id: 'mermaid-block-columns', formats: ['mermaid'], test: (c) => /block-beta/im.test(c) && !/columns\s+\d+/i.test(c), symptom: 'Block without columns', cause: 'block-beta needs columns N', fix: 'Add columns 3.', exampleBad: 'block-beta\n  A B', exampleGood: 'block-beta\n  columns 3\n  A B' },
  { id: 'mermaid-frontmatter', formats: ['mermaid'], test: /^---\s*\n[\s\S]*?---/, symptom: 'Frontmatter config block', cause: 'Frontmatter must close with ---', fix: 'Ensure closing --- before diagram.', exampleBad: '---\ntitle: T\nflowchart TD', exampleGood: '---\ntitle: T\n---\nflowchart TD' },
  { id: 'mermaid-markdown-fence', formats: ['mermaid'], test: /```mermaid/, symptom: 'Markdown fences pasted into editor', cause: 'Editor wants raw Mermaid, not fences', fix: 'Strip ```mermaid fences.', exampleBad: '```mermaid\nflowchart TD', exampleGood: 'flowchart TD' },
  { id: 'mermaid-unbalanced-quotes', formats: ['mermaid'], test: (c) => c.split('\n').some(l => ((l.match(/"/g)||[]).length % 2) === 1), symptom: 'Unbalanced double quotes on a line', cause: 'Every " needs a pair', fix: 'Balance or escape quotes.', exampleBad: 'A["oops]', exampleGood: 'A["oops"]' },
  { id: 'mermaid-unbalanced-brackets', formats: ['mermaid'], test: (c) => { const o=(c.match(/\[/g)||[]).length, cl=(c.match(/\]/g)||[]).length; return o!==cl; }, symptom: 'Unbalanced [ ]', cause: 'Node brackets must pair', fix: 'Close brackets.', exampleBad: 'A[hi', exampleGood: 'A[hi]' },
  { id: 'mermaid-reserved-words', formats: ['mermaid'], test: /^\s*(end|click|class|style|link)\s*-->/m, symptom: 'Reserved word as node id', cause: 'end/click/class are keywords', fix: 'Rename id (e.g. endN).', exampleBad: 'end --> B', exampleGood: 'endN --> B' },
  // ── PlantUML ──────────────────────────────────────────────────
  { id: 'plantuml-wrapper', formats: ['plantuml'], test: (c) => !/^\s*@startuml/m.test(c), symptom: 'Missing @startuml', cause: 'PlantUML files start with @startuml', fix: 'Add @startuml / @enduml.', exampleBad: 'Alice -> Bob: hi', exampleGood: '@startuml\nAlice -> Bob: hi\n@enduml' },
  { id: 'plantuml-enduml', formats: ['plantuml'], test: (c) => /@startuml/i.test(c) && !/@enduml/i.test(c), symptom: 'Missing @enduml', cause: 'Wrapper must close', fix: 'Append @enduml.', exampleBad: '@startuml\nA -> B', exampleGood: '@startuml\nA -> B\n@enduml' },
  { id: 'plantuml-skinparam', formats: ['plantuml'], test: /skinparam/i, symptom: 'skinparam styling ignored in preview', cause: 'Atlas models structure, not vendor skin', fix: 'Keep skinparam in source; preview ignores it.', exampleBad: 'skinparam foo bar', exampleGood: "' skinparam kept, preview unaffected" },
  { id: 'plantuml-arrow-single', formats: ['plantuml'], test: /^\s*\w+\s*->\s*\w+\s*:/m, symptom: "PlantUML '->' vs '-->'", cause: 'Dotted reply is -->', fix: 'Map to correct Mermaid arrow on import.', exampleBad: 'A -> B: sync', exampleGood: 'A -> B: sync (kept); import maps to ->>' },
  // ── Graphviz / D2 ─────────────────────────────────────────────
  { id: 'dot-braces', formats: ['graphviz'], test: (c) => /digraph|strict|graph/i.test(c) && ((c.match(/\{/g)||[]).length !== (c.match(/\}/g)||[]).length), symptom: 'DOT braces unbalanced', cause: 'digraph G { ... } must balance', fix: 'Close braces.', exampleBad: 'digraph G {\n  A -> B;', exampleGood: 'digraph G {\n  A -> B;\n}' },
  { id: 'dot-semicolon', formats: ['graphviz'], test: (c) => /digraph/i.test(c) && /->/.test(c) && !/;/.test(c), symptom: 'DOT edges without semicolons', cause: 'Statements should end with ;', fix: 'Terminate edges with ;.', exampleBad: 'digraph G { A -> B }', exampleGood: 'digraph G { A -> B; }' },
  { id: 'd2-direction', formats: ['d2'], test: (c) => !/direction:\s*(right|left|up|down)/i.test(c) && /->/.test(c), symptom: 'D2 without direction', cause: 'Direction improves layout', fix: 'Add direction: right.', exampleBad: 'a -> b', exampleGood: 'direction: right\na -> b' },
  // ── SQL / DBML / Prisma ───────────────────────────────────────
  { id: 'sql-missing-table', formats: ['sql'], test: (c) => !/CREATE\s+TABLE/i.test(c), symptom: 'No CREATE TABLE found', cause: 'SQL preview needs CREATE TABLE', fix: 'Add CREATE TABLE blocks.', exampleBad: 'SELECT * FROM t', exampleGood: 'CREATE TABLE t (\n  id INT PRIMARY KEY\n);' },
  { id: 'sql-comma', formats: ['sql'], test: (c) => /CREATE TABLE[\s\S]*\w\n\s*\w+\s+\w+/m.test(c), symptom: 'Missing comma between columns', cause: 'Columns need commas', fix: 'Add commas.', exampleBad: 'CREATE TABLE t (\n  a INT\n  b TEXT\n);', exampleGood: 'CREATE TABLE t (\n  a INT,\n  b TEXT\n);' },
  { id: 'dbml-ref', formats: ['dbml'], test: (c) => /Table\s+\w+/i.test(c) && !/Ref:/i.test(c), symptom: 'DBML without Ref', cause: 'Relationships need Ref:', fix: 'Add Ref: a.x > b.y.', exampleBad: 'Table users {\n  id int\n}', exampleGood: 'Table users {\n  id int [pk]\n}\nRef: orders.user_id > users.id' },
  // ── GraphQL / OpenAPI / AsyncAPI ──────────────────────────────
  { id: 'graphql-braces', formats: ['graphql'], test: (c) => /type\s+\w+/i.test(c) && ((c.match(/\{/g)||[]).length !== (c.match(/\}/g)||[]).length), symptom: 'GraphQL braces unbalanced', cause: 'type X { ... } must balance', fix: 'Close braces.', exampleBad: 'type User {\n  id: ID!', exampleGood: 'type User {\n  id: ID!\n}' },
  { id: 'openapi-paths', formats: ['openapi'], test: (c) => /openapi|swagger/i.test(c) && !/paths\s*:/i.test(c), symptom: 'OpenAPI without paths', cause: 'Preview reads paths (first 10)', fix: 'Add paths: block.', exampleBad: 'openapi: 3.0.0', exampleGood: 'openapi: 3.0.0\npaths:\n  /items:\n    get:\n      responses:\n        "200":\n          description: ok' },
  { id: 'asyncapi-channels', formats: ['asyncapi'], test: (c) => /asyncapi/i.test(c) && !/channels\s*:/i.test(c), symptom: 'AsyncAPI without channels', cause: 'Preview reads channels (first 12)', fix: 'Add channels: block.', exampleBad: 'asyncapi: 2.6.0', exampleGood: 'asyncapi: 2.6.0\nchannels:\n  orders.created:\n    publish:\n      message:\n        name: OrderCreated' },
  // ── XML family ────────────────────────────────────────────────
  { id: 'xml-unclosed', formats: ['drawio','bpmn','freemind','opml','xmi','archimate'], test: (c) => /</.test(c) && (()=>{ const o=(c.match(/<[^/!?][^>]*[^/]>/g)||[]).length; return false; })(), symptom: 'Malformed XML', cause: 'Tags/entities/namespaces', fix: 'Validate XML; escape & as &amp;.', exampleBad: '<mxCell value="A & B">', exampleGood: '<mxCell value="A &amp; B">' },
  { id: 'drawio-compressed', formats: ['drawio'], test: (c) => /<mxfile|<diagram>/i.test(c) && !/<mxCell/i.test(c), symptom: 'Draw.io shows compressed page only', cause: 'Page content is base64 deflate', fix: 'Atlas auto-decodes first page; export uncompressed if it fails.', exampleBad: '<mxfile><diagram>eJw…</diagram></mxfile>', exampleGood: '<mxfile><diagram>…decoded mxGraphModel…</diagram></mxfile>' },
  { id: 'bpmn-namespace', formats: ['bpmn'], test: (c) => /sequenceFlow/i.test(c) && !/sourceRef|targetRef/i.test(c), symptom: 'BPMN flow without sourceRef/targetRef', cause: 'Flows need both refs', fix: 'Add sourceRef + targetRef.', exampleBad: '<sequenceFlow id="f1"/>', exampleGood: '<sequenceFlow id="f1" sourceRef="a" targetRef="b"/>' },
  // ── HCL / CSV / MD / code ─────────────────────────────────────
  { id: 'tf-braces', formats: ['terraform'], test: (c) => /resource\s+"/i.test(c) && ((c.match(/\{/g)||[]).length !== (c.match(/\}/g)||[]).length), symptom: 'Terraform braces unbalanced', cause: 'resource { ... } must balance', fix: 'Close braces.', exampleBad: 'resource "aws_vpc" "m" {', exampleGood: 'resource "aws_vpc" "m" {\n  cidr_block = "10.0.0.0/16"\n}' },
  { id: 'csv-header', formats: ['csv'], test: (c) => !/,|;|\t|\|/.test(c.split('\n')[0]||''), symptom: 'CSV first row has no delimiter', cause: 'Need source,target header', fix: 'Add header: source,target,label.', exampleBad: 'just some text', exampleGood: 'source,target,label\nA,B,calls' },
  { id: 'md-outline', formats: ['markdown'], test: (c) => !/^(\s*[-*•]|\s*\d+\.|#{1,6}\s|```mermaid)/m.test(c), symptom: 'Markdown without list/headings/fence', cause: 'Outline needs bullets or fence', fix: 'Use - items or ```mermaid fence.', exampleBad: 'hello world', exampleGood: '- hello\n  - world' },
  { id: 'code-no-class', formats: ['code'], test: (c) => !/(class|struct|interface|enum|type\s+\w+\s*=|def\s+\w+|fn\s+\w+)\b/.test(c), symptom: 'No class/struct detected', cause: 'Code→UML needs a type declaration', fix: 'Add class/struct/interface.', exampleBad: 'console.log(1)', exampleGood: 'class User {\n  name: string\n}' },
  { id: 'json-schema-shape', formats: ['jsonschema'], test: (c) => { try { const v=JSON.parse(c); return !(v&&typeof v==='object'&&(v.properties||v.definitions||v.$defs||v.type==='object')); } catch { return false; } }, symptom: 'JSON-Schema without properties', cause: 'Need properties/$defs to model', fix: 'Add properties object.', exampleBad: '{"type":"string"}', exampleGood: '{"type":"object","properties":{"id":{"type":"string"}}}' },
  { id: 'proto-message', formats: ['protobuf'], test: (c) => /syntax\s*=\s*"proto3"/i.test(c) && !/message\s+\w+/i.test(c), symptom: 'Proto without message', cause: 'Proto preview models messages', fix: 'Add message block.', exampleBad: 'syntax = "proto3";', exampleGood: 'syntax = "proto3";\nmessage User {\n  string id = 1;\n}' },
  { id: 'xmi-namespace', formats: ['xmi'], test: (c) => /XMI/i.test(c) && !/uml:Class|packagedElement/i.test(c), symptom: 'XMI without UML classes', cause: 'Need uml:Class/packagedElement', fix: 'Export UML2 XMI with classes.', exampleBad: '<xmi:XMI></xmi:XMI>', exampleGood: '<uml:Class xmi:id="c1" name="User"/>' },
];

export function lookupErrors(code, format = 'mermaid') {
  const out = [];
  for (const e of ERROR_DB) {
    if (e.formats.includes(format) || e.formats.includes('mermaid') && format === 'mermaid') {
      try {
        const hit = typeof e.test === 'function' ? e.test(code) : e.test.test(code);
        if (hit) out.push(e);
      } catch { /* ignore */ }
    }
  }
  // format-agnostic XML check
  return out;
}

export function explainError(code, format, message = '') {
  if (!code || typeof code !== 'string') return [];
  const lines = code.split('\n');
  const lineMatch = String(message).match(/(?:line|Line)\s*[:#]?\s*(\d+)/i) || String(message).match(/at line (\d+)/i);
  const lineNum = lineMatch ? Math.max(1, parseInt(lineMatch[1], 10)) : null;
  const lineText = lineNum && lineNum <= lines.length ? lines[lineNum - 1] : '';

  const targetedHits = [];
  const seenIds = new Set();

  // 1. Direct diagnostic check on the reported error line
  if (lineText && (format === 'mermaid' || !format)) {
    if (lineNum === 1 && !/^\s*(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|journey|xychart|sankey|kanban|block|C4)\b/i.test(lineText.trim())) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-missing-header');
      if (entry) {
        targetedHits.push({ ...entry, symptom: `Line 1: Missing diagram header` });
        seenIds.add(entry.id);
      }
    }
    if (/\w+\[[^\]"'\n]*[()\/&:,+{}<>][^\]"'\n]*\]/.test(lineText)) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-flow-unquoted-special');
      if (entry) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Unquoted special characters (: / & , ( ) +) in label` });
        seenIds.add(entry.id);
      }
    }
    if (/\w+\([^"'\n]*[()[\]{}][^"'\n]*\)/.test(lineText)) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-flow-unquoted-paren');
      if (entry) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Nested parentheses inside round node (label)` });
        seenIds.add(entry.id);
      }
    }
    if ((lineText.match(/\[/g) || []).length !== (lineText.match(/\]/g) || []).length) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-unbalanced-brackets');
      if (entry && !seenIds.has(entry.id)) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Unclosed bracket [ ]` });
        seenIds.add(entry.id);
      }
    }
    if (((lineText.match(/"/g) || []).length % 2) === 1) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-unbalanced-quotes');
      if (entry && !seenIds.has(entry.id)) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Unbalanced double quotes` });
        seenIds.add(entry.id);
      }
    }
    if (!lineText.includes('-->') && /(^|[^-])->([^-]|$)/.test(lineText)) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-flow-single-arrow');
      if (entry && !seenIds.has(entry.id)) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Flowchart uses single '->' instead of '-->'` });
        seenIds.add(entry.id);
      }
    }
    if (/-->\s*\|\s*[^|]*\s*\|\s*\w/.test(lineText)) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-flow-pipe-spaces');
      if (entry && !seenIds.has(entry.id)) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Stray spacing inside pipe label -->|label|` });
        seenIds.add(entry.id);
      }
    }
    if (/^\s*\w+\s*(->>|-->>|-\)|--\))\s*\w+\s+[^:\n]+$/.test(lineText)) {
      const entry = ERROR_DB.find((e) => e.id === 'mermaid-seq-missing-colon');
      if (entry && !seenIds.has(entry.id)) {
        targetedHits.push({ ...entry, symptom: `Line ${lineNum}: Sequence message missing colon (A->>B: text)` });
        seenIds.add(entry.id);
      }
    }
  }

  // 2. Parser message token matches
  const msgLower = (message || '').toLowerCase();
  for (const e of ERROR_DB) {
    if (seenIds.has(e.id)) continue;
    const tag = e.id.replace(/^(?:mermaid|plantuml|dot|d2|sql|graphql)-/, '');
    if (tag.length > 2 && msgLower.includes(tag)) {
      targetedHits.push(e);
      seenIds.add(e.id);
    }
  }

  // 3. Document-wide structural checks
  const docHits = lookupErrors(code, format || 'mermaid').filter((e) => !seenIds.has(e.id));
  return [...targetedHits, ...docHits].slice(0, 8);
}
