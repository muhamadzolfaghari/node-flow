/**
 * Diagram template registry.
 *
 * The templates live in focused data modules under src/data/templates/ so no single file
 * has to hold all 51. This module is the public entry point: it exports the combined list
 * in the original order plus the id lookup.
 */
import { TEMPLATES as umlSpecification1 } from "../data/templates/uml-specification-1.js";
import { TEMPLATES as umlSpecification2 } from "../data/templates/uml-specification-2.js";
import { TEMPLATES as umlSpecification3 } from "../data/templates/uml-specification-3.js";
import { TEMPLATES as productAndDesign1 } from "../data/templates/product-and-design-1.js";
import { TEMPLATES as productAndDesign2 } from "../data/templates/product-and-design-2.js";
import { TEMPLATES as architectureAndCloud1 } from "../data/templates/architecture-and-cloud-1.js";
import { TEMPLATES as engineeringAndData1 } from "../data/templates/engineering-and-data-1.js";
import { TEMPLATES as architectureAndCloud2 } from "../data/templates/architecture-and-cloud-2.js";
import { TEMPLATES as engineeringAndData2 } from "../data/templates/engineering-and-data-2.js";
import { TEMPLATES as softwareArchitecture } from "../data/templates/software-architecture.js";
import { TEMPLATES as businessAndOperations1 } from "../data/templates/business-and-operations-1.js";
import { TEMPLATES as businessAndOperations2 } from "../data/templates/business-and-operations-2.js";
import { TEMPLATES as qaAndTesting } from "../data/templates/qa-and-testing.js";
import { TEMPLATES as productAndDesign3 } from "../data/templates/product-and-design-3.js";
import { TEMPLATES as businessAndOperations3 } from "../data/templates/business-and-operations-3.js";
import { TEMPLATES as educationAndResearch } from "../data/templates/education-and-research.js";
import { TEMPLATES as engineeringAndData3 } from "../data/templates/engineering-and-data-3.js";

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
