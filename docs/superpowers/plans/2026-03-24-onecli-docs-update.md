# OneCLI Gateway Documentation Update

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all documentation pages to cover the new OneCLI gateway credential injection method (vX.Y.Z+) alongside the legacy credential proxy, using `<Tabs>` for substantial sections and `<Note>` callouts for passing references.

**Architecture:** Tab-based approach — pages with deep credential content get `<Tabs>` with "OneCLI Gateway (vX.Y.Z+)" and "Credential Proxy (legacy)". Pages with brief mentions get `<Note>` callouts. Node 22 → 24 updates apply unconditionally. No new pages created; all changes are edits to existing pages.

**Tech Stack:** Mintlify MDX, `<Tabs>`/`<Tab>` components, `mint validate`, `mint broken-links`

**Placeholder:** Use `vX.Y.Z` for the version number everywhere — will be replaced before launch once upstream confirms the release version.

---

## File Map

| File | Change Type | Scope |
|------|------------|-------|
| `concepts/security.mdx:237-267` | Tabs | Rewrite "Credential handling" section with OneCLI + legacy tabs |
| `concepts/security.mdx:36-67` | Edit | Update Mermaid diagram label |
| `concepts/security.mdx:346-371` | Edit | Update ASCII diagram label |
| `advanced/security-model.mdx:194-221` | Tabs | Rewrite "Credential handling" section with OneCLI + legacy tabs |
| `advanced/security-model.mdx:235-262` | Edit | Update ASCII diagram label |
| `api/configuration.mdx:37-39` | Tabs | Replace `CREDENTIAL_PROXY_PORT` with `ONECLI_URL` + legacy tab |
| `api/configuration.mdx:107-146` | Tabs | Credential env vars + security notes with OneCLI + legacy tabs |
| `advanced/container-runtime.mdx:71,80` | Edit | Node 22 → 24 in Dockerfile section |
| `advanced/container-runtime.mdx:228-278` | Tabs | `buildContainerArgs` code + key flags with OneCLI + legacy tabs |
| `advanced/container-runtime.mdx:214` | Edit | Update stdin step credential reference |
| `concepts/architecture.mdx:250` | Edit | Node 22 → 24 in container image |
| `concepts/architecture.mdx:89` | Edit | Update credential proxy reference (inline text) |
| `concepts/architecture.mdx:304` | Note | Startup sequence step 5 |
| `api/skills/examples.mdx:458` | Edit | Update credential proxy reference in skill example |
| `installation.mdx:40,227` | Edit | Remove WSL credential proxy language |
| `installation.mdx:379` | Edit | Node 22 → 24 in container image |
| `installation.mdx:352-365` | Edit | Add `@onecli-sh/sdk` to dependencies |
| `installation.mdx` (after prereq 4) | Add | OneCLI prerequisite section |
| `concepts/containers.mdx:30,73` | Edit | Node 22 → 24 |
| `concepts/containers.mdx:91` | Note | Update credential proxy reference |
| `concepts/containers.mdx:513` | Note | Update "what containers don't protect against" |
| `integrations/ollama.mdx:126` | Note | Update credential proxy warning |
| All 9 modified files | Edit | Ensure `tag: "UPDATED"` in frontmatter |

---

### Task 1: Update `concepts/security.mdx` — credential handling section + diagrams

**Files:**
- Modify: `concepts/security.mdx:36-67` (Mermaid diagram)
- Modify: `concepts/security.mdx:237-267` (Credential handling section)
- Modify: `concepts/security.mdx:346-371` (ASCII diagram)

- [ ] **Step 1: Update Mermaid diagram**

Change `CF[Credential Proxy]` to `CF[Secret Injection]` at line 46. This neutral label covers both methods.

```
CF[Secret Injection]
```

- [ ] **Step 2: Rewrite section 6 "Credential handling" with tabs**

Replace lines 237-267 with:

```mdx
### 6. Credential handling

<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    NanoClaw uses the [OneCLI](https://onecli.sh) gateway for centralized secret management. API keys are never stored in `.env` or exposed to containers — the gateway intercepts outbound API traffic from containers and injects credentials at request time.

    - Secrets are registered once via `onecli secrets create` (CLI or dashboard)
    - The host's `.env` file is shadowed with `/dev/null` when the project root is mounted, preventing containers from reading any residual secrets
    - Each non-main group gets its own OneCLI agent identifier, enabling per-group credential scoping
    - If the OneCLI gateway is unreachable, the container starts with no credentials and logs a warning

    <Warning>
    The OneCLI gateway prevents credential exposure to containers. However, containers can still make authenticated API requests through the gateway — they cannot extract the real credentials, but they can use them indirectly.
    </Warning>
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    - Containers receive a placeholder token and a proxy URL — never real credentials
    - The host's `.env` file is shadowed with `/dev/null` when the project root is mounted, preventing containers from reading secrets

    Containers never see real credentials. A credential proxy (`src/credential-proxy.ts`) runs on the host and injects authentication on every outbound API request:

    ```typescript
    // Container has a placeholder token — real credentials injected by proxy
    ANTHROPIC_BASE_URL=http://host.docker.internal:3001  // → proxy
    CLAUDE_CODE_OAUTH_TOKEN=placeholder                   // → replaced by proxy
    ```

    The proxy reads credentials from `.env` once at startup. It supports both API key mode (`ANTHROPIC_API_KEY`) and OAuth mode (`CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_AUTH_TOKEN`):

    - **API key mode**: The proxy replaces the `x-api-key` header on every outbound request
    - **OAuth mode**: The proxy replaces the `Authorization` header only on requests that include one (used during the initial token exchange). Subsequent requests use a temporary API key obtained during the exchange and pass through without modification

    <Warning>
    The credential proxy prevents credential exposure to containers. However, the proxy URL is accessible from within the container's network. The container cannot extract the real credentials, but it can make authenticated API requests through the proxy.
    </Warning>
  </Tab>
</Tabs>

#### NOT mounted

- Channel sessions (e.g., `store/auth/` for WhatsApp) - host only
- Mount allowlist - external, never mounted
- Any credentials matching blocked patterns
```

- [ ] **Step 3: Update ASCII diagram**

Replace `│  • Credential proxy` with `│  • Secret injection (OneCLI or credential proxy)` in both the HOST PROCESS section (around line 359).

- [ ] **Step 4: Validate**

Run: `mint validate` from `/Users/ethanmunoz/Projects/clients/qwibit/nanoclaw-docs`
Expected: No errors or warnings

- [ ] **Step 5: Commit**

```bash
git add concepts/security.mdx
git commit -m "docs: update credential handling section for OneCLI gateway (vX.Y.Z+)

Add tabs for OneCLI Gateway and legacy Credential Proxy methods.
Update Mermaid and ASCII diagrams to use neutral 'Secret Injection' label."
```

---

### Task 2: Update `advanced/security-model.mdx` — credential handling + diagram

**Files:**
- Modify: `advanced/security-model.mdx:194-221` (Credential handling section)
- Modify: `advanced/security-model.mdx:235-262` (ASCII diagram)

- [ ] **Step 1: Rewrite "Credential handling" section with tabs**

Replace lines 194-221 with:

```mdx
### Credential handling

<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    NanoClaw delegates all credential management to the [OneCLI](https://onecli.sh) gateway. The host process never reads API keys — secrets are registered with OneCLI and injected into container traffic by the gateway.

    **How it works:**
    - The `@onecli-sh/sdk` package's `applyContainerConfig()` configures each container's network to route through the gateway
    - The gateway intercepts HTTPS traffic to `api.anthropic.com` and injects the registered secret
    - Each non-main group receives an `agentIdentifier` (derived from its folder name) for per-group credential scoping
    - `ONECLI_URL` (default `http://localhost:10254`) configures the gateway address

    **Container environment** (from `src/container-runner.ts`):

    ```typescript
    // OneCLI SDK configures container networking — no explicit env vars needed
    const onecliApplied = await onecli.applyContainerConfig(args, {
      addHostMapping: false, // NanoClaw already handles host gateway
      agent: agentIdentifier,
    });
    ```

    <Note>
    If the OneCLI gateway is unreachable at container start, the container launches with no credentials. The agent will fail on API calls, and a warning is logged. Re-run after ensuring OneCLI is running (`curl http://127.0.0.1:10254/api/health`).
    </Note>
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    **Credential proxy** (`src/credential-proxy.ts`):
    - Runs on the host as an HTTP proxy (default port 3001, configurable via `CREDENTIAL_PROXY_PORT`)
    - Containers send API requests to the proxy with a placeholder token
    - Reads credentials from `.env` once at startup
    - Supports API key mode (`ANTHROPIC_API_KEY`) and OAuth mode (`CLAUDE_CODE_OAUTH_TOKEN` or `ANTHROPIC_AUTH_TOKEN`)

    **Credential injection behavior differs by auth mode:**
    - **API key mode**: The proxy replaces the `x-api-key` header on every outbound request
    - **OAuth mode**: The proxy replaces the `Authorization` header only on requests that include one (during the initial token exchange). The Claude CLI exchanges the placeholder token for a temporary API key, and subsequent requests use that key directly without further injection

    **Container environment** (from `src/container-runner.ts`):

    ```typescript
    // Containers get a placeholder token and proxy URL — never real credentials
    ANTHROPIC_BASE_URL=http://${CONTAINER_HOST_GATEWAY}:${CREDENTIAL_PROXY_PORT}
    CLAUDE_CODE_OAUTH_TOKEN=placeholder
    ```

    <Note>
    Containers cannot extract real credentials. The credential proxy intercepts all API requests and replaces the placeholder token with real authentication before forwarding to `api.anthropic.com`.
    </Note>
  </Tab>
</Tabs>

**NOT mounted:**
- Channel sessions (e.g., `store/auth/` for WhatsApp) - host only
- Mount allowlist - external, never mounted
- Real API keys or OAuth tokens - injected by secret injection layer, never in containers
- Any credentials matching blocked patterns
```

- [ ] **Step 2: Update ASCII diagram**

Replace `│  • Credential proxy` with `│  • Secret injection (OneCLI or credential proxy)` around line 250.

- [ ] **Step 3: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 4: Commit**

```bash
git add advanced/security-model.mdx
git commit -m "docs: update security deep dive for OneCLI gateway credential handling

Add tabs for OneCLI Gateway and legacy Credential Proxy in credential handling section.
Update ASCII diagram label."
```

---

### Task 3: Update `api/configuration.mdx` — env vars + credential section

**Files:**
- Modify: `api/configuration.mdx:37-39` (CREDENTIAL_PROXY_PORT param)
- Modify: `api/configuration.mdx:107-146` (Credential env vars + security notes)

- [ ] **Step 1: Replace CREDENTIAL_PROXY_PORT with tabbed params**

Replace the `CREDENTIAL_PROXY_PORT` ParamField (lines 37-39) with:

```mdx
<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    <ParamField path="ONECLI_URL" type="string" default="http://localhost:10254">
      URL for the OneCLI gateway that handles credential injection for containers.
    </ParamField>
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    <ParamField path="CREDENTIAL_PROXY_PORT" type="number" default="3001">
      Port for the credential proxy that containers route API calls through.
    </ParamField>
  </Tab>
</Tabs>
```

- [ ] **Step 2: Rewrite credential environment variables section with tabs**

Replace lines 107-146 (from `## Example .env file` through end) with:

```mdx
## Example .env file

<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    ```bash
    ASSISTANT_NAME=Andy
    ASSISTANT_HAS_OWN_NUMBER=false
    CONTAINER_TIMEOUT=1800000
    MAX_CONCURRENT_CONTAINERS=5
    TZ=America/Los_Angeles
    ONECLI_URL=http://127.0.0.1:10254
    ```

    <Note>
    With the OneCLI gateway, API keys and OAuth tokens are no longer stored in `.env`. Secrets are managed via `onecli secrets create` and injected by the gateway at request time. The only credential-related variable is `ONECLI_URL`.
    </Note>
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    ```bash
    ASSISTANT_NAME=Andy
    ASSISTANT_HAS_OWN_NUMBER=false
    CONTAINER_TIMEOUT=1800000
    MAX_CONCURRENT_CONTAINERS=5
    TZ=America/Los_Angeles
    ```
  </Tab>
</Tabs>

## Credential environment variables

<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    Credentials are managed externally via OneCLI — no credential environment variables are needed in `.env`.

    Register secrets with OneCLI using the CLI or dashboard:
    ```bash
    onecli secrets create --name Anthropic --type anthropic --value YOUR_KEY --host-pattern api.anthropic.com
    ```

    See `onecli secrets list` to verify registered secrets.
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    The credential proxy reads these from `.env` at startup (never exposed to containers):

    <ParamField path="ANTHROPIC_API_KEY" type="string">
      Anthropic API key. If set, the proxy uses API key mode.
    </ParamField>

    <ParamField path="CLAUDE_CODE_OAUTH_TOKEN" type="string">
      OAuth token for Claude Code authentication. Used when `ANTHROPIC_API_KEY` is not set.
    </ParamField>

    <ParamField path="ANTHROPIC_AUTH_TOKEN" type="string">
      Fallback OAuth token. Used when neither `ANTHROPIC_API_KEY` nor `CLAUDE_CODE_OAUTH_TOKEN` is set.
    </ParamField>

    <ParamField path="ANTHROPIC_BASE_URL" type="string">
      Upstream API URL for the credential proxy to forward requests to. Defaults to the Anthropic API endpoint. Set this to use third-party Anthropic-compatible endpoints (Together AI, Fireworks, custom deployments). See [Ollama integration](/integrations/ollama#third-party-model-endpoints).
    </ParamField>
  </Tab>
</Tabs>

<ParamField path="OLLAMA_HOST" type="string" default="http://host.docker.internal:11434">
  Ollama API endpoint. Only used when the `/add-ollama-tool` skill is installed. The MCP server inside the container uses this to reach the host's Ollama instance. Falls back to `localhost` if `host.docker.internal` fails.
</ParamField>

## Security notes

<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    - **Secrets** are never read by NanoClaw — OneCLI manages them externally
    - The OneCLI gateway injects credentials into container API traffic at request time
    - Containers cannot extract real credentials from the gateway
    - Mount allowlist is stored OUTSIDE project root and never mounted into containers
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    - **Secrets** (API keys, credentials) are NOT read in `config.ts`
    - Secrets are loaded only by the credential proxy (`credential-proxy.ts`) once at startup, never exposed to containers
    - This prevents leaking secrets to child processes
    - Mount allowlist is stored OUTSIDE project root and never mounted into containers
  </Tab>
</Tabs>
```

- [ ] **Step 3: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 4: Commit**

```bash
git add api/configuration.mdx
git commit -m "docs: add OneCLI gateway config alongside legacy credential proxy

Add tabs for ONECLI_URL vs CREDENTIAL_PROXY_PORT, external secret management
vs .env credential variables, and updated security notes."
```

---

### Task 4: Update `advanced/container-runtime.mdx` — container args + Node version

**Files:**
- Modify: `advanced/container-runtime.mdx:71,80` (Node version)
- Modify: `advanced/container-runtime.mdx:214` (stdin step)
- Modify: `advanced/container-runtime.mdx:228-278` (buildContainerArgs + key flags)

- [ ] **Step 1: Update Node version references**

Change `Node.js 22` to `Node.js 24` at line 71 and `node:22-slim` to `node:24-slim` at line 80.

- [ ] **Step 2: Update stdin step credential reference**

Change line 214 from:
```
The input JSON contains the prompt, session ID, group folder, and metadata. Credentials are handled by the credential proxy — never passed via stdin or mounted as files.
```
to:
```
The input JSON contains the prompt, session ID, group folder, and metadata. Credentials are handled by the secret injection layer (OneCLI gateway or credential proxy) — never passed via stdin or mounted as files.
```

- [ ] **Step 3: Replace buildContainerArgs section with tabs**

Replace lines 228-278 (from `### Container arguments` through the key flags list) with:

```mdx
### Container arguments

From the `buildContainerArgs` function in `src/container-runner.ts`:

<Tabs>
  <Tab title="OneCLI Gateway (vX.Y.Z+)">
    ```typescript
    async function buildContainerArgs(
      mounts: VolumeMount[],
      containerName: string,
      agentIdentifier?: string,
    ): Promise<string[]> {
      const args: string[] = ['run', '-i', '--rm', '--name', containerName];

      // Pass host timezone so container's local time matches the user's
      args.push('-e', `TZ=${TIMEZONE}`);

      // OneCLI gateway handles credential injection
      const onecliApplied = await onecli.applyContainerConfig(args, {
        addHostMapping: false,
        agent: agentIdentifier,
      });
      if (!onecliApplied) {
        logger.warn({ containerName }, 'OneCLI gateway not reachable');
      }

      // Run as host user so bind-mounted files are accessible
      const hostUid = process.getuid?.();
      const hostGid = process.getgid?.();
      if (hostUid != null && hostUid !== 0 && hostUid !== 1000) {
        args.push('--user', `${hostUid}:${hostGid}`);
        args.push('-e', 'HOME=/home/node');
      }

      for (const mount of mounts) {
        if (mount.readonly) {
          args.push(...readonlyMountArgs(mount.hostPath, mount.containerPath));
        } else {
          args.push('-v', `${mount.hostPath}:${mount.containerPath}`);
        }
      }

      args.push(CONTAINER_IMAGE);
      return args;
    }
    ```

    **Key flags:**
    - `-i` - Interactive (keeps stdin open)
    - `--rm` - Remove container after exit (ephemeral)
    - `--name` - Unique container name for management
    - `--user` - Run as host UID/GID for file permissions
    - OneCLI SDK configures container networking for credential injection (no explicit env vars)
  </Tab>

  <Tab title="Credential Proxy (legacy)">
    ```typescript
    function buildContainerArgs(
      mounts: VolumeMount[],
      containerName: string,
    ): string[] {
      const args: string[] = ['run', '-i', '--rm', '--name', containerName];

      // Pass host timezone so container's local time matches the user's
      args.push('-e', `TZ=${TIMEZONE}`);

      // Route API traffic through the credential proxy
      args.push('-e', `ANTHROPIC_BASE_URL=http://${CONTAINER_HOST_GATEWAY}:${CREDENTIAL_PROXY_PORT}`);

      // Mirror the host's auth method with a placeholder value
      const authMode = detectAuthMode();
      if (authMode === 'api-key') {
        args.push('-e', 'ANTHROPIC_API_KEY=placeholder');
      } else {
        args.push('-e', 'CLAUDE_CODE_OAUTH_TOKEN=placeholder');
      }

      // Run as host user so bind-mounted files are accessible
      const hostUid = process.getuid?.();
      const hostGid = process.getgid?.();
      if (hostUid != null && hostUid !== 0 && hostUid !== 1000) {
        args.push('--user', `${hostUid}:${hostGid}`);
        args.push('-e', 'HOME=/home/node');
      }

      for (const mount of mounts) {
        if (mount.readonly) {
          args.push(...readonlyMountArgs(mount.hostPath, mount.containerPath));
        } else {
          args.push('-v', `${mount.hostPath}:${mount.containerPath}`);
        }
      }

      args.push(CONTAINER_IMAGE);
      return args;
    }
    ```

    **Key flags:**
    - `-i` - Interactive (keeps stdin open)
    - `--rm` - Remove container after exit (ephemeral)
    - `--name` - Unique container name for management
    - `--user` - Run as host UID/GID for file permissions
    - `-e ANTHROPIC_BASE_URL` - Routes API calls through the credential proxy
    - `-e ANTHROPIC_API_KEY` or `-e CLAUDE_CODE_OAUTH_TOKEN` - Placeholder credential (replaced by proxy)
  </Tab>
</Tabs>
```

- [ ] **Step 4: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 5: Commit**

```bash
git add advanced/container-runtime.mdx
git commit -m "docs: update container runtime for OneCLI gateway and Node 24

Add tabs for OneCLI vs legacy credential proxy in container arguments section.
Update Dockerfile base from Node 22 to Node 24."
```

---

### Task 5: Update `concepts/architecture.mdx` — startup sequence + Node version

**Files:**
- Modify: `concepts/architecture.mdx:89` (credential reference in container runner)
- Modify: `concepts/architecture.mdx:250` (Node version)
- Modify: `concepts/architecture.mdx:304` (startup sequence step 5)

- [ ] **Step 1: Update container runner credential reference**

Change line 89 from:
```
3. Pass prompt and metadata via stdin JSON (credentials handled by proxy, never passed here)
```
to:
```
3. Pass prompt and metadata via stdin JSON (credentials handled by secret injection layer, never passed here)
```

- [ ] **Step 2: Update Node version**

Change `node:22-slim` to `node:24-slim` at line 250.

- [ ] **Step 3: Update startup sequence step 5**

Replace line 304:
```
5. **Credential proxy**: Start the credential proxy on `CREDENTIAL_PROXY_PORT` (containers route API calls through this)
```
with:
```
5. **Secret injection**: Ensure credential injection is available for containers

<Note>
In vX.Y.Z+, this step syncs OneCLI agents for all registered groups. In earlier versions, this starts the built-in credential proxy on `CREDENTIAL_PROXY_PORT`.
</Note>
```

- [ ] **Step 4: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 5: Commit**

```bash
git add concepts/architecture.mdx
git commit -m "docs: update architecture page for OneCLI gateway and Node 24

Update startup sequence, container runner description, and Dockerfile base version."
```

---

### Task 6: Update `installation.mdx` — prerequisites + Node version + dependencies

**Files:**
- Modify: `installation.mdx:40` (WSL note)
- Modify: `installation.mdx:227` (WSL Docker tab)
- Modify: `installation.mdx:352-365` (package dependencies)
- Modify: `installation.mdx:379` (container image Node version)
- Add: New prerequisite section after prerequisite 4

- [ ] **Step 1: Remove WSL credential proxy language**

Change line 40 from:
```
NanoClaw runs inside WSL, not natively on Windows. All commands should be run in a WSL terminal. The credential proxy detects WSL automatically and uses the correct network routing.
```
to:
```
NanoClaw runs inside WSL, not natively on Windows. All commands should be run in a WSL terminal.
```

Change line 227 from:
```
WSL uses Docker Desktop's WSL 2 backend. The credential proxy detects WSL automatically and routes through `127.0.0.1` (same as macOS).
```
to:
```
WSL uses Docker Desktop's WSL 2 backend.
```

- [ ] **Step 2: Add OneCLI prerequisite**

After the "4. Build tools" section (after line 288), add:

```mdx
### 5. OneCLI (vX.Y.Z+)

Starting in vX.Y.Z, NanoClaw uses OneCLI for credential management. OneCLI is a local gateway that injects API keys into container traffic without exposing secrets.

```bash
curl -fsSL onecli.sh/install | sh
curl -fsSL onecli.sh/cli/install | sh
```

Verify installation:
```bash
onecli version
```

<Info>
OneCLI is also installed automatically by the `/setup` skill if not already present. It's listed here so you know about the dependency upfront.
</Info>

<Note>
**What `/setup` handles for you:** OneCLI installation, npm dependencies, container image build, channel configuration, and service setup. **What you need beforehand:** Node.js, Claude Code, a container runtime, and build tools.
</Note>
```

- [ ] **Step 3: Update package dependencies**

Add `@onecli-sh/sdk` to the dependencies JSON block (around line 355):

```json
{
  "dependencies": {
    "@onecli-sh/sdk": "^0.2.0",     // OneCLI gateway integration (vX.Y.Z+)
    "better-sqlite3": "^11.8.1",   // SQLite database
    "cron-parser": "^5.5.0",       // Task scheduling
    "pino": "^9.6.0",              // Logging
    "pino-pretty": "^13.0.0",      // Log formatting
    "yaml": "^2.8.2",              // YAML parsing
    "zod": "^4.3.6"                // Schema validation
  }
}
```

- [ ] **Step 4: Update container image Node version**

Change line 379 from `Node.js 22 (Debian slim)` to `Node.js 24 (Debian slim)`.

- [ ] **Step 5: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 6: Commit**

```bash
git add installation.mdx
git commit -m "docs: add OneCLI prerequisite and update Node version to 24

Add OneCLI as prerequisite #5 with note about /setup auto-installation.
Update container image base to Node 24. Add @onecli-sh/sdk to dependencies.
Remove WSL credential proxy language."
```

---

### Task 7: Update `concepts/containers.mdx` — Node version + credential references

**Files:**
- Modify: `concepts/containers.mdx:30` (Dockerfile snippet)
- Modify: `concepts/containers.mdx:73` (key components list)
- Modify: `concepts/containers.mdx:91` (entrypoint credential reference)
- Modify: `concepts/containers.mdx:513` (what containers don't protect against)

- [ ] **Step 1: Update Node version**

Change `node:22-slim` to `node:24-slim` at line 30.
Change `node:22-slim` to `node:24-slim` at line 73.

- [ ] **Step 2: Update entrypoint credential reference**

Change line 91 from:
```
   - Credentials handled by the credential proxy, never passed via stdin
```
to:
```
   - Credentials handled by the secret injection layer (OneCLI gateway or credential proxy), never passed via stdin
```

- [ ] **Step 3: Update "what containers don't protect against"**

Change line 513 from:
```
- **Proxy-based API access**: Containers can make authenticated API requests through the credential proxy (though they cannot extract real credentials)
```
to:
```
- **Gateway-based API access**: Containers can make authenticated API requests through the secret injection layer (though they cannot extract real credentials)
```

- [ ] **Step 4: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 5: Commit**

```bash
git add concepts/containers.mdx
git commit -m "docs: update containers page for Node 24 and OneCLI gateway

Update Dockerfile base, credential references to use neutral 'secret injection' language."
```

---

### Task 8: Update `integrations/ollama.mdx` + `api/skills/examples.mdx` — passing credential references

**Files:**
- Modify: `integrations/ollama.mdx:125-127` (credential proxy warning)
- Modify: `api/skills/examples.mdx:458` (credential proxy reference in skill example)

- [ ] **Step 1: Update Ollama warning**

Replace lines 125-127:
```mdx
<Warning>
When using `ANTHROPIC_BASE_URL`, the credential proxy still intercepts container API requests. Make sure the proxy can reach your custom endpoint.
</Warning>
```
with:
```mdx
<Warning>
When using custom endpoints, the secret injection layer (OneCLI gateway in vX.Y.Z+, or the credential proxy in earlier versions) still intercepts container API requests. Ensure the endpoint is reachable from the host.
</Warning>
```

- [ ] **Step 2: Update skills example credential reference**

Change line 458 of `api/skills/examples.mdx` from:
```
Add `PARALLEL_API_KEY` to `.env` so the credential proxy and MCP env resolution can access it:
```
to:
```
Add `PARALLEL_API_KEY` to `.env` so MCP env resolution can access it:
```

- [ ] **Step 3: Validate**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 4: Commit**

```bash
git add integrations/ollama.mdx api/skills/examples.mdx
git commit -m "docs: update passing credential proxy references for OneCLI

Update Ollama warning and skills example to use version-neutral language."
```

---

### Task 9: Frontmatter tags, changelog, final validation

**Files:**
- All 9 modified `.mdx` files (frontmatter)
- `changelog/docs-updates.mdx`

- [ ] **Step 1: Verify `tag: "UPDATED"` frontmatter on all modified files**

Check each modified file's frontmatter. If `tag: "UPDATED"` is missing, add it. Files to check:
- `concepts/security.mdx`
- `advanced/security-model.mdx`
- `api/configuration.mdx`
- `advanced/container-runtime.mdx`
- `concepts/architecture.mdx`
- `installation.mdx`
- `concepts/containers.mdx`
- `integrations/ollama.mdx`
- `api/skills/examples.mdx`

- [ ] **Step 2: Add changelog entry**

Add a new entry at the top of `changelog/docs-updates.mdx` (newest first):

```mdx
<Update label="OneCLI gateway documentation" description="2026-03-XX" tags={["New", "Updated"]}>
  Added tabbed documentation for OneCLI gateway secret injection (vX.Y.Z+) alongside legacy credential proxy across 9 pages. Updated container image base from Node 22 to Node 24. Added OneCLI as installation prerequisite.
</Update>
```

- [ ] **Step 3: Run full validation**

Run: `mint validate`
Expected: No errors or warnings

- [ ] **Step 4: Run broken links check**

Run: `mint broken-links`
Expected: No broken links

- [ ] **Step 5: Verify `vX.Y.Z` placeholders are searchable**

Run: `grep -r "vX.Y.Z" *.mdx **/*.mdx`
Expected: All placeholder instances listed for future find-and-replace

- [ ] **Step 6: Run `mint dev` for visual preview**

Run: `mint dev`
Manually verify tabs render correctly on at least `concepts/security` and `api/configuration` pages.

- [ ] **Step 7: Commit**

```bash
git add changelog/docs-updates.mdx concepts/security.mdx advanced/security-model.mdx api/configuration.mdx advanced/container-runtime.mdx concepts/architecture.mdx installation.mdx concepts/containers.mdx integrations/ollama.mdx api/skills/examples.mdx
git commit -m "docs: add changelog entry and update frontmatter tags"
```

- [ ] **Step 8: Create PR**

```bash
gh pr create --title "docs: add OneCLI gateway documentation alongside legacy credential proxy" --body "$(cat <<'EOF'
## Summary
- Adds tabbed documentation for OneCLI gateway (vX.Y.Z+) alongside legacy credential proxy across 9 pages
- Updates container image base from Node 22 to Node 24
- Adds OneCLI as installation prerequisite with note about `/setup` auto-installation
- Uses `vX.Y.Z` placeholder for version — to be replaced before launch

## Pages updated
- `concepts/security.mdx` — credential handling section + diagrams
- `advanced/security-model.mdx` — credential handling deep dive + diagram
- `api/configuration.mdx` — env vars + credential section
- `advanced/container-runtime.mdx` — container args + Node version
- `concepts/architecture.mdx` — startup sequence + Node version
- `installation.mdx` — prerequisites + Node version + dependencies
- `concepts/containers.mdx` — Node version + credential references
- `integrations/ollama.mdx` — credential proxy warning
- `api/skills/examples.mdx` — credential proxy reference in skill example

## Test plan
- [ ] `mint validate` passes
- [ ] `mint broken-links` passes
- [ ] All `vX.Y.Z` placeholders are present and searchable
- [ ] Tabs render correctly in local preview (`mint dev`)

Closes #TBD

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
