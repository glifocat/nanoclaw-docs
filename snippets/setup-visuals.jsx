// Synthetic terminal illustrations. Exact questions/options: NanoClaw
// setup/auto.ts, setup/providers/skill-descriptor.ts, .claude/skills/add-{codex,cursor,opencode}/SKILL.md
// and .claude/skills/add-onecli/scripts/auth.ts @ 61cf826d.
// Presentation inspired by setup/lib/bright-select.ts at the same revision.
// Hints and surrounding output are omitted; selection is the guide's choice,
// not necessarily the installer's default. No installation capture is claimed.
export const TerminalMenu = ({ screens }) => (
  <figure className="not-prose setup-terminal">
    <div className="setup-terminal-label">Terminal · illustration</div>
    <div className="setup-terminal-screens">
      {screens.map((screen, index) => (
        <div className="setup-terminal-screen" key={screen.question}>
          {screens.length > 1 && <div className="setup-terminal-order">Prompt {index + 1}</div>}
          <div className="setup-terminal-question"><span aria-hidden="true">◆</span><span>{screen.question}</span></div>
          <ul className="setup-terminal-options">
            {screen.options.map((option, i) => (
              <li key={option} className={i === screen.selected ? 'setup-terminal-selected' : ''}>
                <span aria-hidden="true">{i === screen.selected ? '●' : '○'}</span>
                <span>{option}{i === screen.selected && <span className="sr-only"> (choice for this guide)</span>}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <figcaption>Code-based illustration, not a screenshot. Highlighted choices follow this guide; hints and surrounding output are omitted.{screens.length > 1 && " Separate prompts are shown in setup order."}</figcaption>
  </figure>
);

export const SetupCheck = ({ children }) => (
  <div className="not-prose setup-check">
    <span className="setup-check-icon" aria-hidden="true">✓</span>
    <div><div className="setup-check-label">Before you continue</div><div>{children}</div></div>
  </div>
);
