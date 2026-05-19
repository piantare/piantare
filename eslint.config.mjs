import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Architecture layering rules — enforces docs/adrs/0002.
 * See also src/ARCHITECTURE.md.
 *
 * IMPORTANT (flat config gotcha): `no-restricted-imports` cannot be merged
 * across multiple config blocks for the same file — a later block REPLACES
 * the rule options entirely. We therefore set the rule ONCE per file pattern,
 * with all relevant patterns combined.
 */

const NO_IO = [
  "@/modules/**",
  "@/services/**",
  "@/app/**",
  "@/components/**",
  "@/design-system/**",
  "@/config/**",
  "@/i18n/**",
  "@/lib/**",
  "@/types/database",
  "**/modules/**",
  "**/services/**",
  "**/app/**",
  "**/components/**",
  "**/design-system/**",
  "**/config/**",
  "**/i18n/**",
  "**/lib/**",
];

const NO_VERTICAL = ["@/domains/vertical/**", "**/domains/vertical/**"];

const NO_CONCRETE_VERTICAL = [
  "@/domains/vertical/cannabis-br/**",
  "**/domains/vertical/cannabis-br/**",
];

const DESIGN_SYSTEM_FORBIDDEN = [
  "@/domains/**",
  "@/modules/**",
  "@/services/**",
  "@/components/**",
  "@/app/**",
  "@/config/**",
  "@/i18n/**",
  "**/domains/**",
  "**/modules/**",
  "**/services/**",
  "**/components/**",
  "**/app/**",
  "**/config/**",
  "**/i18n/**",
];

const SERVICES_FORBIDDEN = [
  "@/modules/**",
  "@/app/**",
  "@/components/**",
  "@/design-system/**",
  "**/modules/**",
  "**/app/**",
  "**/components/**",
  "**/design-system/**",
];

const LIB_FORBIDDEN = [
  "@/domains/**",
  "@/modules/**",
  "@/services/**",
  "@/app/**",
  "@/components/**",
  "@/design-system/**",
  "@/config/**",
  "@/i18n/**",
  "**/domains/**",
  "**/modules/**",
  "**/services/**",
  "**/app/**",
  "**/components/**",
  "**/design-system/**",
  "**/config/**",
  "**/i18n/**",
];

const I18N_FORBIDDEN = [
  "@/domains/**",
  "@/modules/**",
  "@/services/**",
  "@/app/**",
  "@/components/**",
  "@/design-system/**",
  "**/domains/**",
  "**/modules/**",
  "**/services/**",
  "**/app/**",
  "**/components/**",
  "**/design-system/**",
];

const ADR_LINK = "See docs/adrs/0002 and src/ARCHITECTURE.md.";

const layeringRules = [
  // domains/family and domains/organization: pure model + no vertical imports
  {
    files: [
      "src/domains/family/**/*.{ts,tsx}",
      "src/domains/organization/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: NO_IO,
              message: `domains/ is pure — no modules, services, app, components, design-system, config, lib, or types/database. ${ADR_LINK}`,
            },
            {
              group: NO_VERTICAL,
              message: `domains/family and domains/organization must not depend on any vertical. Verticals plug into the model, not the other way. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },

  // domains/vertical/_base: pure model + no concrete vertical
  {
    files: ["src/domains/vertical/_base/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: NO_IO,
              message: `domains/ is pure — no I/O or orchestration blocks. ${ADR_LINK}`,
            },
            {
              group: NO_CONCRETE_VERTICAL,
              message: `vertical/_base is the abstract protocol — it cannot reference any concrete vertical. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },

  // domains/identity, domains/vertical/cannabis-br, and the MVP product/order
  // domains: just NO_IO (they may freely depend on each other and on
  // domains/organization).
  {
    files: [
      "src/domains/identity/**/*.{ts,tsx}",
      "src/domains/vertical/cannabis-br/**/*.{ts,tsx}",
      "src/domains/product/**/*.{ts,tsx}",
      "src/domains/order/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: NO_IO,
              message: `domains/ is pure — no I/O or orchestration blocks. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },

  // design-system: presentational only
  {
    files: ["src/design-system/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: DESIGN_SYSTEM_FORBIDDEN,
              message: `design-system/ contains presentational primitives only. No domain knowledge, no product composition. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },

  // services: adapters
  {
    files: ["src/services/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: SERVICES_FORBIDDEN,
              message: `services/ are adapters — they translate external systems, they do not orchestrate use cases. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },

  // lib: generic utilities
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: LIB_FORBIDDEN,
              message: `lib/ is generic. If a utility is domain-relevant, it belongs in a domain. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },

  // i18n: thin Next adapter for locale state + message loading
  {
    files: ["src/i18n/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: I18N_FORBIDDEN,
              message: `i18n/ is a thin Next adapter — it must not depend on domains, modules, services, components, or design-system. Keep it framework-glue only. ${ADR_LINK}`,
            },
          ],
        },
      ],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...layeringRules,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated contract — never hand-edited, never linted.
    "src/types/database.ts",
  ]),
]);

export default eslintConfig;
