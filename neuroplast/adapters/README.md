# Neuroplast Environment Guides

These files explain how to apply the same Neuroplast workflow contract in different AI-assisted development environments.

## Rules
- These guides are documentation-only.
- They must not redefine workflow phases, file structure, or artifact roles.
- They must always defer to `neuroplast/WORKFLOW_CONTRACT.md` and `neuroplast/manifest.yaml`.
- They must also defer to `neuroplast/capabilities.yaml` when describing constrained-environment behavior.
- Environment-specific prompts and tips may improve usability, but they must not fork behavior.
- They must not override the Neuroplast workflow contract.

## Shared Guide Template
Each guide should cover:
1. Purpose of the environment guide
2. Mandatory start sequence
3. Workflow entrypoint
4. Recommended prompt to start work
5. How to follow the Neuroplast contract in that environment
6. Known limitations and graceful degradation notes
7. Reminder that the guide is optional and non-authoritative
