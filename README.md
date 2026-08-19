# dsh-memory

Standalone Project Memory bundle for DeepSeek Harness. Users maintain a small set of workspace-scoped facts through the Web header panel, a `/memory` command, or the model-facing `project_memory` tool. Only content the user explicitly asks to remember is stored; ordinary conversation is never auto-saved.

## Install

Add this bundle to a profile:

```sh
dsh plugin --profile <name> add github:yzq/dsh-memory
```

For the full Web panel, the profile must also include the shipped Web surface (`@deepseek-ai/dsh-web-app`). A headless profile still gets the `project_memory` tool, the `/memory` command, and bounded request context.

```sh
dsh --profile <name> --dump-config   # shows a "# == dsh-memory" layer
dsh --profile <name>
```

## Usage

- `/memory` — list memories for the current workspace.
- `/memory add <content>` — add a memory.
- `/memory edit <id> <content>` — edit a memory.
- `/memory delete <id>` — delete a memory.

The model manages memory only when explicitly told to remember, update, or forget. The Web header shows a database icon that opens the management panel.

## Config

```yaml
- id: project-memory
  name: dsh-memory
  config:
    maxEntriesPerWorkspace: 12
    maxEntryChars: 300
    injectContext: true
```

- `maxEntriesPerWorkspace` — max memories per workspace (positive safe integer).
- `maxEntryChars` — max characters per memory (positive safe integer).
- `injectContext` — `false` keeps storage, tool, command, and UI but stops auto-injecting memories into request context.

## Safety

Do not store passwords, API keys, tokens, or other secrets. Memories are recall notes, not permissions or policy; team rules belong in `AGENTS.md` or version control.
