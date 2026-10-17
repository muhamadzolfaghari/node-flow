/**
 * Embeds and extracts diagram source metadata into SVG files.
 * This makes exported SVG files self-contained diagrams that can be dropped
 * back into NodeFlow / Mermaid Studio to resume interactive editing with 100% fidelity.
 */

export function embedSourceInSvg(svgString, source, format = "mermaid") {
  if (!svgString || typeof svgString !== "string") return svgString;
  if (!source || typeof source !== "string") return svgString;

  // Format and escape source for XML
  const cleanSourceForXml = source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const metadataTag = `\n  <metadata id="nodeflow-metadata" data-source-format="${format}">\n    <nodeflow:source xmlns:nodeflow="https://nodeflow.dev/ns" format="${format}"><![CDATA[${source}]]></nodeflow:source>\n  </metadata>`;
  const commentTag = `\n  <!-- [nodeflow-source format="${format}"]\n${encodeURIComponent(source)}\n  -->`;

  const match = svgString.match(/<svg\b[^>]*>/i);
  if (match) {
    const idx = match.index + match[0].length;
    return (
      svgString.slice(0, idx) +
      commentTag +
      metadataTag +
      svgString.slice(idx)
    );
  }
  return svgString;
}

export function extractSourceFromSvg(svgString) {
  if (!svgString || typeof svgString !== "string") return null;

  // 1. Try CDATA inside nodeflow:source
  const cdataMatch = svgString.match(
    /<nodeflow:source\b[^>]*format=["']([^"']+)["'][^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/nodeflow:source>/i,
  );
  if (cdataMatch) {
    return {
      format: cdataMatch[1].trim(),
      source: cdataMatch[2].trim(),
    };
  }

  // 2. Try metadata tag
  const metaMatch =
    svgString.match(
      /<metadata\b[^>]*id=["']nodeflow-metadata["'][^>]*data-source-format=["']([^"']+)["'][^>]*>([\s\S]*?)<\/metadata>/i,
    ) ||
    svgString.match(
      /<metadata\b[^>]*data-source-format=["']([^"']+)["'][^>]*id=["']nodeflow-metadata["'][^>]*>([\s\S]*?)<\/metadata>/i,
    );
  if (metaMatch) {
    const format = metaMatch[1];
    let source = metaMatch[2].trim();
    // Strip inner tags if any
    source = source.replace(/<[^>]+>/g, "").trim();
    // Decode XML entities
    source = source
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
    if (source) return { source, format };
  }

  // 3. Try encoded nodeflow comment
  const commentMatch = svgString.match(
    /<!--\s*\[nodeflow-source\s+format=["']([^"']+)["']\]\s*([\s\S]*?)\s*-->/i,
  );
  if (commentMatch) {
    const format = commentMatch[1];
    try {
      const source = decodeURIComponent(commentMatch[2].trim());
      return { source, format };
    } catch {
      return { source: commentMatch[2].trim(), format };
    }
  }

  // 4. Try generic diagram / mermaid source comment
  const genericMatch = svgString.match(
    /<!--\s*(?:mermaid|diagram)-source:\s*([\s\S]*?)\s*-->/i,
  );
  if (genericMatch) {
    try {
      const source = decodeURIComponent(genericMatch[1].trim());
      return { source, format: "mermaid" };
    } catch {
      return { source: genericMatch[1].trim(), format: "mermaid" };
    }
  }

  return null;
}
// @ts-nocheck
