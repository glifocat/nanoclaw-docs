# Setup illustrations

Regenerates the terminal illustrations in `images/setup/`. They are **illustrations, not captures**: `flow.mjs` replays the terminal side of NanoClaw's `setup/portal.ts` with the same `@clack/prompts` calls and the same strings, so the prompt library draws the output itself. No installer runs, nothing is fetched, and nobody signs in. The link, code, and email are placeholders.

Source revision: `nanocoai/nanoclaw` `setup/portal.ts` @ `61cf826d`, `@clack/prompts` 1.2.0 (the version in NanoClaw's lockfile).

```bash
cd scripts/setup-illustrations
npm i --no-save @clack/prompts@1.2.0 @xterm/xterm@5.5.0 @fontsource/jetbrains-mono playwright
python3 rec.py 1 ""  s1.raw 86 30   # prompt waiting for an answer
python3 rec.py 2 "E" s2.raw 86 30   # Enter pressed: link and code
python3 rec.py 3 "E" s3.raw 86 30   # after the browser steps
node render.mjs '[{"raw":"s1.raw","out":"../../images/setup/portal-01-enable-prompt.png","cols":86,"rows":30},{"raw":"s2.raw","out":"../../images/setup/portal-02-link-and-code.png","cols":86,"rows":30},{"raw":"s3.raw","out":"../../images/setup/portal-03-choice-saved.png","cols":86,"rows":30}]'
```

When the strings in `setup/portal.ts` change, update `flow.mjs` to match, rerun, and update the revision above and the provenance comments beside each embed.
