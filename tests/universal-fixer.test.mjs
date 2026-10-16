import test from "node:test";
import assert from "node:assert/strict";
import { fixAnySyntax } from "../src/utils/universal-fixer.js";

test("fixAnySyntax repairs plantuml with missing @startuml/@enduml tags", async () => {
  const puml = "Alice -> Bob: Request";
  const res = await fixAnySyntax(puml, "plantuml");
  assert.ok(res.fixedCode.includes("@startuml"));
  assert.ok(res.fixedCode.includes("@enduml"));
});

test("fixAnySyntax repairs Graphviz DOT unbalanced braces and unclosed edges", async () => {
  const dot = "digraph G {\n  A -> B";
  const res = await fixAnySyntax(dot, "graphviz");
  assert.ok(res.fixedCode.endsWith("}"));
  assert.ok(res.fixedCode.includes(";"));
});

test("fixAnySyntax repairs D2 missing direction", async () => {
  const d2 = "A -> B";
  const res = await fixAnySyntax(d2, "d2");
  assert.ok(res.fixedCode.includes("direction: right"));
});

test("fixAnySyntax repairs SQL columns missing trailing commas", async () => {
  const sql = `CREATE TABLE users (
  id INT PRIMARY KEY
  name VARCHAR(100) NOT NULL
)`;
  const res = await fixAnySyntax(sql, "sql");
  assert.ok(res.fixedCode.includes("id INT PRIMARY KEY,"));
});

test("fixAnySyntax repairs GraphQL and Terraform unclosed braces", async () => {
  const gql = "type Query {\n  users: [User]";
  const resGql = await fixAnySyntax(gql, "graphql");
  assert.ok(resGql.fixedCode.endsWith("}"));

  const tf = 'resource "aws_s3_bucket" "b" {\n  bucket = "my-bucket"';
  const resTf = await fixAnySyntax(tf, "terraform");
  assert.ok(resTf.fixedCode.endsWith("}"));
});

test("fixAnySyntax normalizes CSV headers and semicolon delimiters", async () => {
  const csv = "UserRelationships\nServerB;DB;Queries";
  const res = await fixAnySyntax(csv, "csv");
  assert.ok(res.fixedCode.includes("source,target,label"));
  assert.ok(res.fixedCode.includes("ServerB,DB,Queries"));
});

test("fixAnySyntax converts plain text lines to Markdown bullets", async () => {
  const md = "Feature One\nFeature Two";
  const res = await fixAnySyntax(md, "markdown");
  assert.ok(res.fixedCode.includes("- Feature One"));
  assert.ok(res.fixedCode.includes("- Feature Two"));
});

test("fixAnySyntax escapes raw unescaped ampersands in XML formats", async () => {
  const xml = "<root><title>Fish & Chips</title></root>";
  const res = await fixAnySyntax(xml, "drawio");
  assert.ok(res.fixedCode.includes("Fish &amp; Chips"));
});

test("fixAnySyntax removes trailing commas in OpenAPI/AsyncAPI JSON", async () => {
  const jsonSpec = '{\n  "openapi": "3.0.0",\n}';
  const res = await fixAnySyntax(jsonSpec, "openapi");
  assert.ok(!res.fixedCode.includes('",\n}'));
});
