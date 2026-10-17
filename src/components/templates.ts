/**
 * Diagram template registry.
 *
 * The templates live in focused data modules under src/data/templates/ so no single file
 * has to hold all 51. This module is the public entry point: it exports the combined list
 * in the original order plus the id lookup.
 */
import { TEMPLATES as umlSpecification1 } from "../data/templates/umlspecification1.ts";
import { TEMPLATES as umlSpecification2 } from "../data/templates/umlspecification2.ts";
import { TEMPLATES as umlSpecification3 } from "../data/templates/umlspecification3.ts";
import { TEMPLATES as productAndDesign1 } from "../data/templates/productanddesign1.ts";
import { TEMPLATES as productAndDesign2 } from "../data/templates/productanddesign2.ts";
import { TEMPLATES as architectureAndCloud1 } from "../data/templates/architectureandcloud1.ts";
import { TEMPLATES as engineeringAndData1 } from "../data/templates/engineeringanddata1.ts";
import { TEMPLATES as architectureAndCloud2 } from "../data/templates/architectureandcloud2.ts";
import { TEMPLATES as engineeringAndData2 } from "../data/templates/engineeringanddata2.ts";
import { TEMPLATES as softwareArchitecture } from "../data/templates/softwarearchitecture.ts";
import { TEMPLATES as businessAndOperations1 } from "../data/templates/businessandoperations1.ts";
import { TEMPLATES as businessAndOperations2 } from "../data/templates/businessandoperations2.ts";
import { TEMPLATES as qaAndTesting } from "../data/templates/qaandtesting.ts";
import { TEMPLATES as productAndDesign3 } from "../data/templates/productanddesign3.ts";
import { TEMPLATES as businessAndOperations3 } from "../data/templates/businessandoperations3.ts";
import { TEMPLATES as educationAndResearch } from "../data/templates/educationandresearch.ts";
import { TEMPLATES as engineeringAndData3 } from "../data/templates/engineeringanddata3.ts";

export const DIAGRAM_TEMPLATES = [
  ...umlSpecification1,
  ...umlSpecification2,
  ...umlSpecification3,
  ...productAndDesign1,
  ...productAndDesign2,
  ...architectureAndCloud1,
  ...engineeringAndData1,
  ...architectureAndCloud2,
  ...engineeringAndData2,
  ...softwareArchitecture,
  ...businessAndOperations1,
  ...businessAndOperations2,
  ...qaAndTesting,
  ...productAndDesign3,
  ...businessAndOperations3,
  ...educationAndResearch,
  ...engineeringAndData3,
];

export function getTemplateById(id) {
  return DIAGRAM_TEMPLATES.find((tpl) => tpl.id === id) || DIAGRAM_TEMPLATES[0];
}
