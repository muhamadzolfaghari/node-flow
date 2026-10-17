import { FORMATS, getFormat, FILE_ACCEPT } from "./formats-config.js";
export { FORMATS, getFormat, FILE_ACCEPT } from "./formats-config.js";
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export function detectFormat(name = "", source = "") {
  const lower = name.toLowerCase();
  const ext = lower.split(".").pop();
  // extension-first for unambiguous formats
  const known = FORMATS.find(
    (f) => f.extensions.includes(ext) && f.id !== "markdown",
  );
  if (known && !["openapi", "asyncapi", "archimate"].includes(known.id)) {
    // json/yaml/xml/csv are content-sniffed below even if extension matches yaml/json/csv
    if (!["yaml", "jsonschema", "gliffy", "excalidraw", "csv"].includes(known.id)) return known.id;
  }
  if (/^\s*(strict\s+)?(di)?graph\s*[^\n]*\{/i.test(source)) return "graphviz";
  if (
    /^\s*(?:---[\s\S]*?---\s*)?(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|mindmap|gantt|pie|xychart|C4|gitGraph|journey|timeline|sankey|quadrantChart|kanban|block|requirementDiagram|packet|architecture)\b/m.test(
      source,
    )
  )
    return "mermaid";
  if (/(?:"openapi"|"swagger")\s*:|^\s*(openapi|swagger)\s*:/m.test(source))
    return "openapi";
  if (/"asyncapi"\s*:|^\s*asyncapi\s*:/m.test(source)) return "asyncapi";
  if (/<mxfile\b|<mxGraphModel\b/.test(source)) return "drawio";
  if (/<(?:\w+:)?definitions\b[^>]*BPMN|<bpmn:(?:definitions|process)\b/i.test(source)) return "bpmn";
  if (/<definitions\b[^>]*DMN|<decision\b[^>]*name=/i.test(source) && /DMN/i.test(source)) return "dmn";
  if (/<opml\b/.test(source)) return "opml";
  if (/<map\b/.test(source)) return "freemind";
  if (/<xmi:XMI|xmlns:uml/i.test(source)) return "xmi";
  if (/xsi:type="[^"]*(Business|Application|Technology|Motivation)/i.test(source) || /archimate/i.test(source)) return "archimate";
  if (/<VisioDocument|<Shape\b[^>]*ID=/i.test(source)) return "visio";
  if (/^\s*@startuml/m.test(source)) return "plantuml";
  if (/^\s*Table\s+\w+\s*\{/m.test(source) && /Ref\s*:/i.test(source)) return "dbml";
  if (/^\s*model\s+\w+\s*\{/m.test(source) && /@id|@relation/i.test(source)) return "prisma";
  if (/^\s*syntax\s*=\s*"proto3"|^\s*message\s+\w+\s*\{/m.test(source)) return "protobuf";
  if (/CREATE\s+TABLE/i.test(source)) return "sql";
  if (/^\s*Table\s+\w+\s*\{/m.test(source)) return "dbml";
  if (/^\s*(part|requirement|action)\s+\w+/m.test(source)) return "sysml";
  if (/\|\|--o\{/.test(source)) return "erd";
  if (/"elements"\s*:\s*\[|"type"\s*:\s*"excalidraw"|"type"\s*:\s*"rectangle"/.test(source)) return "excalidraw";
  if (/"stage"\s*:\s*\{|"objects"\s*:\s*\[/.test(source)) return "gliffy";
  // JSON-schema: object with properties/$defs/definitions
  if (/^\s*\{/.test(source) && /"(properties|definitions|\$defs)"\s*:/.test(source)) return "jsonschema";
  if (/"_type"\s*:\s*"Project"|"_type"\s*:\s*"UMLClass"/.test(source)) return "staruml";
  if (/(?:Shape Library|Text Area 1|Line Source).*Line Destination/i.test(source)) return "lucid";
  if (/"pages"\s*:\s*\[|"shapes"\s*:\s*\[|"lines"\s*:\s*\[/.test(source) && !/"elements"/.test(source)) return "lucid";
  if (/(?:xmlns:i="http:\/\/ns\.adobe\.com\/AdobeIllustrator|<i:pgf\b|Artboard\s+["']|%AI5_BeginLayer)/i.test(source)) return "illustrator";
  if (/(?:"document"\s*:\s*\{[^}]*"children"|"connectorStart"\s*:|"type"\s*:\s*"(?:FRAME|COMPONENT|STICKY)")/i.test(source)) return "figma";
  if (/<plist\b[^>]*>[\s\S]*<key>GraphicsList<\/key>/i.test(source) || /OmniGraffle/i.test(source)) return "omnigraffle";
  if (/\btype\s+\w+\s*\{[^}]*:/.test(source) && /:\s*(String|ID|Int|Float|Boolean)/.test(source)) return "graphql";
  if (
    ["geojson", "geo.json", "mvt", "pbf", "shp", "dbf", "kml", "topojson"].includes(ext) ||
    /"FeatureCollection"|"coordinates"\s*:|vector_tile|Topology|"objects"\s*:\s*\{|map_layer|shapefile/i.test(source)
  ) return "geojson";
  if (["md", "markdown", "txt"].includes(ext)) return "markdown";
  // yaml fallback: generic mapping
  if (["yaml", "yml"].includes(ext) && /^\s*[\w./-]+\s*:/m.test(source)) return "yaml";
  if (known) return known.id;
  throw new Error(
    `Cannot identify ${name || "this source"}. Choose a format in the file inspector.`,
  );
}

async function specification(source) {
  const { parse } = await import("yaml");
  const value = parse(source);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a JSON or YAML specification object.");
  return JSON.stringify(value);
}

async function expandDrawio(source) {
  const doc = new DOMParser().parseFromString(source, "application/xml");
  if (doc.querySelector("parsererror"))
    throw new Error("Invalid Draw.io XML. Check closing tags and attributes.");
  const pages = [...doc.querySelectorAll("diagram")];
  if (!pages.length) return source;
  // first non-empty page
  for (const page of pages) {
    const model = page.querySelector("mxGraphModel");
    if (model) return new XMLSerializer().serializeToString(model);
    const compressed = (page.textContent || "").trim();
    if (compressed.startsWith("<")) return compressed;
    if (compressed.length > 8) {
      const { inflateSync, strFromU8 } = await import("fflate");
      try {
        const bytes = Uint8Array.from(atob(compressed), (c) => c.charCodeAt(0));
        return decodeURIComponent(strFromU8(inflateSync(bytes)));
      } catch { continue; }
    }
  }
  throw new Error(
    "Unable to decode the first Draw.io page. Export an uncompressed XML file and retry.",
  );
}

export async function compileDocument(document) {
  const { format, source } = document;
  if (!source.trim()) return { code: "", warnings: [] };
  let code;
  switch (format) {
    case "mermaid":
    case "graphviz":
    case "xmind":
      code = source;
      break;
    case "plantuml":
      code = (
        await import("../utils/importers/plantuml.js")
      ).parsePlantUmlToMermaid(source);
      break;
    case "d2":
      code = (await import("../utils/importers/d2.js")).parseD2ToMermaid(
        source,
      );
      break;
    case "sql":
      code = (
        await import("../utils/importers/sql-ddl.js")
      ).parseSqlDdlToMermaid(source);
      break;
    case "dbml":
      code = (await import("../utils/importers/dbml.js")).parseDbmlToMermaid(source);
      break;
    case "prisma":
      code = (await import("../utils/importers/prisma.js")).parsePrismaToMermaid(source);
      break;
    case "protobuf":
      code = (await import("../utils/importers/protobuf.js")).parseProtoToMermaid(source);
      break;
    case "jsonschema":
      code = (await import("../utils/importers/json-schema.js")).parseJsonSchemaToMermaid(source);
      break;
    case "graphql":
      code = (
        await import("../utils/importers/graphql.js")
      ).parseGraphQLToMermaid(source);
      break;
    case "openapi":
      code = (
        await import("../utils/importers/openapi.js")
      ).parseOpenApiToMermaid(await specification(source));
      break;
    case "asyncapi":
      code = (
        await import("../utils/importers/asyncapi.js")
      ).parseAsyncApiToMermaid(await specification(source));
      break;
    case "yaml":
      code = (await import("../utils/importers/yaml-generic.js")).parseYamlGenericToMermaid(source);
      break;
    case "erd":
      code = (await import("../utils/importers/yaml-generic.js")).parseErdTextToMermaid(source);
      break;
    case "xmi":
      code = (await import("../utils/importers/xmi.js")).parseXmiToMermaid(source);
      break;
    case "sysml":
      code = (await import("../utils/importers/sysml.js")).parseSysmlToMermaid(source);
      break;
    case "archimate":
      code = (await import("../utils/importers/archimate.js")).parseArchiMateToMermaid(source);
      break;
    case "dmn":
      code = (await import("../utils/importers/dmn.js")).parseDmnToMermaid(source);
      break;
    case "drawio":
      code = (
        await import("../utils/importers/drawio.js")
      ).parseDrawioToMermaid(await expandDrawio(source));
      break;
    case "bpmn":
      code = (await import("../utils/importers/bpmn.js")).parseBpmnToMermaid(
        source,
      );
      break;
    case "c4":
      code = (await import("../utils/importers/c4-dsl.js")).parseC4DslToMermaid(
        source,
      );
      break;
    case "terraform":
      code = (
        await import("../utils/importers/terraform.js")
      ).parseTerraformToMermaid(source);
      break;
    case "markdown": {
      const fence = source.match(/```mermaid\s*\n([\s\S]*?)```/i);
      code = fence
        ? fence[1]
        : (await import("../utils/importers/markdown-outline.js")).parseOutline(
            source,
            "mindmap",
          );
      break;
    }
    case "csv":
      code = (
        await import("../utils/importers/csv-table.js")
      ).parseCsvToMermaid(source);
      break;
    case "visio":
      code = (await import("../utils/importers/visio-excalidraw.js")).parseVisioToMermaid(source);
      break;
    case "gliffy":
      code = (await import("../utils/importers/visio-excalidraw.js")).parseGliffyToMermaid(source);
      break;
    case "excalidraw":
      code = (await import("../utils/importers/visio-excalidraw.js")).parseExcalidrawToMermaid(source);
      break;
    case "freemind":
    case "opml":
      code = (
        await import("../utils/importers/freemind.js")
      ).parseFreeMindOrOpmlToMermaid(source);
      break;
    case "code":
      code = (
        await import("../utils/importers/code-to-uml.js")
      ).parseCodeToClassDiagram(source);
      break;
    case "staruml":
      code = (
        await import("../utils/importers/staruml.js")
      ).parseStarUmlToMermaid(source);
      break;
    case "lucid":
      code = (
        await import("../utils/importers/lucidchart.js")
      ).parseLucidchartToMermaid(source);
      break;
    case "illustrator":
      code = (
        await import("../utils/importers/illustrator.js")
      ).parseIllustratorToMermaid(source);
      break;
    case "figma":
      code = (
        await import("../utils/importers/figma.js")
      ).parseFigmaToMermaid(source);
      break;
    case "omnigraffle":
      code = (
        await import("../utils/importers/omnigraffle.js")
      ).parseOmniGraffleToMermaid(source);
      break;
    case "miro":
      code = (
        await import("../utils/importers/miro.js")
      ).parseMiroToMermaid(source);
      break;
    case "geojson":
      code = (
        await import("../utils/importers/geojson.js")
      ).parseGeoJsonToMermaid(source);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  if (!code || code.trim().split("\n").length < 2)
    throw new Error(
      `No diagram elements found in ${getFormat(format).name}. Check the supported syntax.`,
    );
  const derived = getFormat(format).mode === "Derived";
  return {
    code,
    warnings: derived
      ? [
          getFormat(format).description +
            " Your original source stays editable.",
        ]
      : [],
  };
}

export async function importDocument(file) {
  if (file.size > MAX_FILE_SIZE_BYTES)
    throw new Error(`${file.name} exceeds the 15 MB per-file limit.`);
  if (file.name.toLowerCase().endsWith(".xmind")) {
    const buffer = await file.arrayBuffer();
    const { parseXmindToMermaid } = await import("../utils/importers/xmind.js");
    const parsed = await parseXmindToMermaid(buffer);
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return {
      name: file.name,
      source: parsed.mermaidCode,
      format: "xmind",
      original: { name: file.name, base64: btoa(binary) },
    };
  }
  if (file.name.toLowerCase().endsWith(".svg")) {
    const svgText = await file.text();
    const { extractSourceFromSvg } = await import("../utils/importers/svg-metadata.js");
    const extracted = extractSourceFromSvg(svgText);
    if (!extracted) {
      throw new Error(
        `${file.name} does not contain embedded NodeFlow or Mermaid source metadata. Check that the SVG was exported with source metadata, or import a diagram source file.`,
      );
    }
    const targetExt = getFormat(extracted.format)?.ext || "mmd";
    return {
      name: file.name.replace(/\.svg$/i, `.${targetExt}`),
      source: extracted.source,
      format: extracted.format,
    };
  }
  if (/\.(mvt|pbf|shp|dbf)$/i.test(file.name)) {
    const buffer = await file.arrayBuffer();
    const { parseGeoJsonToMermaid } = await import("../utils/importers/geojson.js");
    const mermaidCode = parseGeoJsonToMermaid(buffer, file.name);
    return {
      name: file.name,
      source: mermaidCode,
      format: "geojson",
    };
  }
  const source = await file.text();
  return {
    name: file.webkitRelativePath || file.name,
    source,
    format: detectFormat(file.name, source),
  };
}
