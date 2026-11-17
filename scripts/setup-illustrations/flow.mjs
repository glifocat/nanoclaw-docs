// Replays the terminal side of setup/portal.ts (beginPortal -> signInThroughPortal
// -> runImagePortal) @ nanoclaw 61cf826d with the same @clack/prompts calls and
// the same strings. No network, no sign-in: link, code and email are placeholders.
import * as p from '@clack/prompts';
const stage = Number(process.env.STAGE || 3);
const hold = () => new Promise(() => setInterval(() => {}, 1e6));
const URL_ = 'https://portal.nanoclaw.dev/setup/example-link';
const CODE = 'WDJB-MJHT';
const consent = await p.confirm({
  message: 'Enable Echo’s hardened agent image? Open the perks dashboard in your browser?',
  initialValue: true,
});
if (p.isCancel(consent) || !consent) {
  p.log.info('Skipped for now. You can enable it later.');
  if (stage === 4) await hold();
  process.exit(0);
}
p.log.info('Open the link below to sign in, approve this terminal, and choose your perk. Setup continues automatically once you decide.');
process.stdout.write(`\n${URL_}\n\n`);
process.stdout.write(`Code: ${CODE} — approve only if the sign-in page shows this code.\n\n`);
if (stage === 2) await hold();
p.log.info(`Signed in as you@example.com. Choose your perk in the browser.`);
p.log.success('Image choice saved. Continuing setup.');
await hold();
