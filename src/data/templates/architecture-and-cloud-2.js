// Architecture & Cloud templates (part 2 of 2).
// Combined registry and lookup live in src/components/templates.js.
export const TEMPLATES = [
  {
    id: "system-requirements-spec",
    title: "Systems Engineering Requirements & Traceability",
    category: "Architecture & Cloud",
    kind: "requirement",
    description: "System-level requirements specification with functional/performance criteria, risk levels, and traceability verification links.",
    code: `requirementDiagram
    requirement req_core_zero_trust {
        id: 1.1
        text: All network communications must be mutual TLS encrypted and strictly authenticated.
        risk: high
        verifymethod: test
    }
    functionalRequirement req_token_rotation {
        id: 1.2
        text: Access tokens must rotate automatically every 15 minutes with cryptographic replay protection.
        risk: medium
        verifymethod: test
    }
    performanceRequirement req_auth_sla {
        id: 2.1
        text: Authentication handshakes must complete within 50ms at p99 under 10k RPS load.
        risk: medium
        verifymethod: demonstration
    }
    interfaceRequirement req_oidc_federation {
        id: 3.1
        text: Support standard OIDC and SAML 2.0 identity providers for enterprise SSO.
        risk: low
        verifymethod: inspection
    }

    element identity_gateway {
        type: service
    }
    element vault_kms {
        type: subsystem
    }
    element redis_session_cache {
        type: storage
    }

    identity_gateway - satisfies -> req_core_zero_trust
    identity_gateway - satisfies -> req_token_rotation
    identity_gateway - traces -> req_oidc_federation
    vault_kms - satisfies -> req_token_rotation
    redis_session_cache - satisfies -> req_auth_sla
`,
  },
];
