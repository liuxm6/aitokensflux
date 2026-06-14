import { Check, ChevronLeft, ShieldCheck, X } from "lucide-react";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { LanguageContext } from "../../context/Language";
import { getOpenAICompatibleServerAddress } from "../../helpers/server-address";
import { localizeKey } from "../../i18n/localization";
import type {
  ApiResponse,
  CustomerStatus,
  DualTextProps,
  SetupChoice,
  SetupGuideStep,
  SetupOs,
  SetupStage,
  SetupTool,
  TranslationKeyProps,
} from "../../types";

type SetupPageDeps = {
  MarketingHeader: ComponentType;
  Pill: ComponentType<{ children: ReactNode }>;
  T: ComponentType<DualTextProps | TranslationKeyProps>;
  AppLink: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  CodeBlock: ComponentType<{ value: string }>;
  fetchCustomerStatus: () => Promise<ApiResponse<CustomerStatus>>;
  getConfiguredServerAddress: (status?: CustomerStatus | null) => string;
  navigateTo: (path: string) => void;
};

type SetupPageProps = {
  modal?: boolean;
  onClose?: () => void;
};

function getDialogExitDelay() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 150;
}

export function createSetupPage(deps: SetupPageDeps) {
  const {
    MarketingHeader,
    Pill,
    T,
    AppLink,
    CodeBlock,
    fetchCustomerStatus,
    getConfiguredServerAddress,
    navigateTo,
  } = deps;

  const apiKeyPlaceholder = "YOUR_API_KEY";

  const nodeDownloadUrl = "https://nodejs.org/en/download";

  const codexInstallUrl = "https://chatgpt.com/codex/install.sh";

  const codexWindowsInstallUrl = "https://chatgpt.com/codex/install.ps1";

  const setupTools: SetupChoice<SetupTool>[] = [
    {
      id: "claude",
      title: "Claude Code",
      subtitleId: "Anthropic CLI",
      icon: ClaudeMark,
    },
    {
      id: "codex",
      title: "Codex",
      subtitleId: "CLI / VS Code / desktop app",
      icon: CodexMark,
    },
  ];

  const setupOperatingSystems: SetupChoice<SetupOs>[] = [
    {
      id: "macos",
      title: "macOS",
      subtitleId: "Terminal / zsh",
      icon: AppleMark,
    },
    {
      id: "windows",
      title: "Windows",
      subtitleId: "PowerShell",
      icon: WindowsMark,
    },
    {
      id: "linux",
      title: "Linux",
      subtitleId: "bash / zsh",
      icon: LinuxMark,
    },
  ];

  function getSetupTool(id: SetupTool) {
    return setupTools.find((item) => item.id === id)!;
  }

  function getSetupOs(id: SetupOs) {
    return setupOperatingSystems.find((item) => item.id === id)!;
  }

  function getSetupGuide(
    tool: SetupTool,
    os: SetupOs,
    gatewayBaseUrl: string,
  ): SetupGuideStep[] {
    return tool === "claude"
      ? getClaudeGuide(os, gatewayBaseUrl)
      : getCodexGuide(os, gatewayBaseUrl);
  }

  function getClaudeGuide(
    os: SetupOs,
    gatewayBaseUrl: string,
  ): SetupGuideStep[] {
    const envShell = `export ANTHROPIC_BASE_URL="${gatewayBaseUrl}"
export ANTHROPIC_API_KEY="${apiKeyPlaceholder}"
export ANTHROPIC_AUTH_TOKEN="${apiKeyPlaceholder}"`;
    const keyStep: SetupGuideStep = {
      titleId: "Prepare an API key",
      textId:
        "Create an API key in the customer portal first. Replace every YOUR_API_KEY below with that real key.",
      action: {
        href: "/apikeys",
        labelId: "Open API Keys",
      },
      codeBlocks: [
        {
          labelId: "Gateway variables for Claude Code",
          value: `ANTHROPIC_BASE_URL=${gatewayBaseUrl}
ANTHROPIC_API_KEY=${apiKeyPlaceholder}
ANTHROPIC_AUTH_TOKEN=${apiKeyPlaceholder}`,
        },
      ],
    };

    if (os === "windows") {
      return [
        keyStep,
        {
          titleId: "Install Node.js LTS",
          textId:
            "Claude Code requires Node.js. On Windows, install the LTS build with winget or the official installer.",
          action: {
            href: nodeDownloadUrl,
            labelId: "Download Windows Installer",
          },
          codeBlocks: [
            {
              labelId: "PowerShell",
              value: `winget install --id OpenJS.NodeJS.LTS -e
node --version`,
            },
          ],
        },
        {
          titleId: "Install the Claude Code CLI",
          textId: "Open PowerShell and install Claude Code with npm.",
          codeBlocks: [
            {
              value: `npm install -g @anthropic-ai/claude-code
claude --version`,
            },
          ],
        },
        {
          titleId: "Clean old settings and configure env vars",
          textId:
            "If you used Claude CLI before, remove old settings first, then set the aitokensflux gateway and API key.",
          callout: {
            tone: "warning",
            titleId: "Important",
            textId:
              "Replace {{key}} with the key you created on the API Keys page.",
            textValues: { key: apiKeyPlaceholder },
          },
          codeBlocks: [
            {
              labelId: "Clean old config",
              value:
                'Remove-Item -Recurse -Force "$env:USERPROFILE\\.claude" -ErrorAction SilentlyContinue',
            },
            {
              labelId: "Temporary for current terminal",
              value: `$env:ANTHROPIC_BASE_URL="${gatewayBaseUrl}"
$env:ANTHROPIC_API_KEY="${apiKeyPlaceholder}"
$env:ANTHROPIC_AUTH_TOKEN="${apiKeyPlaceholder}"`,
            },
            {
              labelId: "Persist to user environment",
              value: `[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "${gatewayBaseUrl}", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_API_KEY", "${apiKeyPlaceholder}", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "${apiKeyPlaceholder}", "User")`,
            },
          ],
        },
        {
          titleId: "Start Claude Code",
          textId: "Reopen PowerShell and run Claude Code.",
          callout: {
            tone: "success",
            textId:
              "After setup, all Claude Code requests appear in Usage details.",
          },
          codeBlocks: [{ value: "claude" }],
        },
      ];
    }

    const profile = os === "macos" ? "~/.zshrc" : "~/.bashrc";
    const nodeInstall =
      os === "macos"
        ? `brew install node
node --version
npm --version`
        : `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version`;
    const installCli =
      os === "macos"
        ? `npm install -g @anthropic-ai/claude-code
claude --version`
        : `sudo npm install -g @anthropic-ai/claude-code
claude --version`;

    return [
      keyStep,
      {
        titleId: "Install Node.js LTS",
        textId:
          os === "macos"
            ? "On macOS, install Node.js LTS with Homebrew or download the .pkg installer from Node.js."
            : "Install Node.js LTS on Linux. Debian / Ubuntu can use NodeSource; other distributions should use their package manager.",
        action: {
          href: nodeDownloadUrl,
          labelId:
            os === "macos"
              ? "Download macOS Installer (.pkg)"
              : "Open Node.js downloads",
        },
        codeBlocks: [{ value: nodeInstall }],
      },
      {
        titleId: "Install the Claude Code CLI",
        textId:
          "Use npm to install the latest Claude Code CLI. If permissions fail, use sudo as prompted.",
        codeBlocks: [{ value: installCli }],
      },
      {
        titleId: "Clean old settings and configure env vars",
        textId:
          "If you used Claude CLI before, remove old settings first, then persist the gateway and key in your shell profile.",
        callout: {
          tone: "warning",
          titleId: "Important",
          textId:
            "Replace {{key}} with the key you created on the API Keys page.",
          textValues: { key: apiKeyPlaceholder },
        },
        codeBlocks: [
          {
            labelId: "Clean old config",
            value: "rm -rf ~/.claude",
          },
          {
            labelId: "Temporary for current terminal",
            value: envShell,
          },
          {
            labelId: "Persist to {{target}}",
            labelValues: { target: profile },
            value: `cat <<'EOF' >> ${profile}
${envShell}
EOF
source ${profile}`,
          },
        ],
      },
      {
        titleId: "Start Claude Code",
        textId:
          "Reload your shell profile and launch Claude Code. Seeing the prompt means setup is complete.",
        callout: {
          tone: "success",
          textId:
            "After setup, all Claude Code requests appear in Usage details.",
        },
        codeBlocks: [{ value: `source ${profile}\nclaude` }],
      },
    ];
  }

  function getCodexGuide(
    os: SetupOs,
    gatewayBaseUrl: string,
  ): SetupGuideStep[] {
    const openaiBaseUrl = getOpenAICompatibleServerAddress(gatewayBaseUrl);
    const keyStep: SetupGuideStep = {
      titleId: "Prepare an API key",
      textId:
        "Codex uses OpenAI-compatible settings. Create an API key first, then replace YOUR_API_KEY with the real key.",
      action: {
        href: "/apikeys",
        labelId: "Open API Keys",
      },
      codeBlocks: [
        {
          labelId: "Codex / OpenAI-compatible values",
          value: `Base URL: ${openaiBaseUrl}
API Key: ${apiKeyPlaceholder}`,
        },
      ],
    };
    const configToml = `openai_base_url = "${openaiBaseUrl}"`;
    const genericOpenAiConfig = `Base URL: ${openaiBaseUrl}
API Key: ${apiKeyPlaceholder}`;

    if (os === "windows") {
      return [
        keyStep,
        {
          titleId: "Install the Codex CLI",
          textId:
            "On Windows, use the official installer script for Codex CLI. npm install -g @openai/codex is also available.",
          action: {
            href: "https://developers.openai.com/codex/quickstart?setup=cli",
            labelId: "Open Codex CLI docs",
          },
          codeBlocks: [
            {
              labelId: "PowerShell",
              value: `powershell -ExecutionPolicy ByPass -c "irm ${codexWindowsInstallUrl} | iex"
codex --version`,
            },
            {
              labelId: "npm alternative",
              value: `npm install -g @openai/codex
codex --version`,
            },
          ],
        },
        {
          titleId: "Configure user-level Codex settings",
          textId:
            "Put the gateway in user-level config.toml. Do not put provider/base URL settings in project .codex/config.toml because Codex ignores them there.",
          callout: {
            tone: "warning",
            titleId: "Important",
            textId:
              "Replace {{key}} with the key you created on the API Keys page. Reopen PowerShell after persisting it.",
            textValues: { key: apiKeyPlaceholder },
          },
          codeBlocks: [
            {
              labelId: "Open user-level config.toml",
              value: `New-Item -ItemType Directory -Force "$env:USERPROFILE\\.codex"
notepad "$env:USERPROFILE\\.codex\\config.toml"`,
            },
            {
              labelId: "Add to config.toml",
              value: configToml,
            },
            {
              labelId: "Temporary for current PowerShell",
              value: `$env:OPENAI_API_KEY="${apiKeyPlaceholder}"`,
            },
            {
              labelId: "Persist to user environment",
              value: `[Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "${apiKeyPlaceholder}", "User")`,
            },
          ],
        },
        {
          titleId: "Configure VS Code / desktop app",
          textId:
            "The Codex IDE extension shares the same user-level config as the CLI. Other OpenAI-compatible apps can use these values directly.",
          codeBlocks: [
            {
              value: genericOpenAiConfig,
            },
          ],
        },
        {
          titleId: "Verify Codex",
          textId: "Reopen PowerShell and start Codex.",
          callout: {
            tone: "success",
            textId: "After setup, all Codex requests appear in Usage details.",
          },
          codeBlocks: [
            { value: 'codex "Inspect this project and suggest improvements"' },
          ],
        },
      ];
    }

    const profile = os === "macos" ? "~/.zshrc" : "~/.bashrc";
    const installCli = `curl -fsSL ${codexInstallUrl} | sh
codex --version`;
    const altInstall =
      os === "macos"
        ? `brew install --cask codex
# Or use npm:
npm install -g @openai/codex
codex --version`
        : `npm install -g @openai/codex
codex --version`;

    return [
      keyStep,
      {
        titleId: "Install the Codex CLI",
        textId:
          os === "macos"
            ? "On macOS, install Codex CLI with the official script, Homebrew, or npm."
            : "On Linux, install Codex CLI with the official script, or use npm if Node.js is already installed.",
        action: {
          href: "https://developers.openai.com/codex/quickstart?setup=cli",
          labelId: "Open Codex CLI docs",
        },
        codeBlocks: [
          {
            labelId: "Official installer",
            value: installCli,
          },
          {
            labelId: "Alternative install",
            value: altInstall,
          },
        ],
      },
      {
        titleId: "Configure user-level Codex settings",
        textId:
          "Put the gateway in user-level ~/.codex/config.toml and persist the API key in your shell profile.",
        callout: {
          tone: "warning",
          titleId: "Important",
          textId:
            "openai_base_url must live in user-level config. Project .codex/config.toml ignores provider/base URL settings.",
        },
        codeBlocks: [
          {
            labelId: "Add to user-level config.toml",
            value: `mkdir -p ~/.codex
cat <<'EOF' >> ~/.codex/config.toml
${configToml}
EOF`,
          },
          {
            labelId: "Temporary for current terminal",
            value: `export OPENAI_API_KEY="${apiKeyPlaceholder}"`,
          },
          {
            labelId: "Persist to {{target}}",
            labelValues: { target: profile },
            value: `cat <<'EOF' >> ${profile}
export OPENAI_API_KEY="${apiKeyPlaceholder}"
EOF
source ${profile}`,
          },
        ],
      },
      {
        titleId: "Configure VS Code / desktop app",
        textId:
          "The Codex IDE extension shares the same user-level config as the CLI. Other OpenAI-compatible apps can use these values directly.",
        codeBlocks: [
          {
            value: genericOpenAiConfig,
          },
        ],
      },
      {
        titleId: "Verify Codex",
        textId: "Reload your shell profile and start Codex.",
        callout: {
          tone: "success",
          textId: "After setup, all Codex requests appear in Usage details.",
        },
        codeBlocks: [
          {
            value: `source ${profile}\ncodex "Inspect this project and suggest improvements"`,
          },
        ],
      },
    ];
  }

  function SetupPage({ modal = false, onClose }: SetupPageProps = {}) {
    const { language } = useContext(LanguageContext);
    const closeTimerRef = useRef<number | null>(null);
    const [status, setStatus] = useState<CustomerStatus | null>(null);
    const [stage, setStage] = useState<SetupStage>("tool");
    const [tool, setTool] = useState<SetupTool | null>(null);
    const [os, setOs] = useState<SetupOs | null>(null);
    const [isClosing, setIsClosing] = useState(false);
    const selectedTool = tool ? getSetupTool(tool) : null;
    const selectedOs = os ? getSetupOs(os) : null;
    const gatewayBaseUrl = getConfiguredServerAddress(status);
    const guide = tool && os ? getSetupGuide(tool, os, gatewayBaseUrl) : [];

    const closeNow = useCallback(() => {
      if (onClose) {
        onClose();
        return;
      }
      navigateTo("/");
    }, [onClose]);

    const requestClose = useCallback(() => {
      if (isClosing) return;
      setIsClosing(true);
      closeTimerRef.current = window.setTimeout(closeNow, getDialogExitDelay());
    }, [closeNow, isClosing]);

    useEffect(() => {
      let mounted = true;
      void fetchCustomerStatus().then((response) => {
        if (mounted && response.success && response.data) {
          setStatus(response.data);
        }
      });
      return () => {
        mounted = false;
      };
    }, []);

    useEffect(() => {
      return () => {
        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const handleKeyDown = (event: globalThis.KeyboardEvent) => {
        if (event.key === "Escape") requestClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [requestClose]);

    const goBack = () => {
      if (stage === "guide") {
        setStage("os");
        return;
      }
      if (stage === "os") {
        setStage("tool");
        setOs(null);
        return;
      }
      requestClose();
    };

    return (
      <>
        {modal ? null : <MarketingHeader />}
        <main
          className={`setup-wizard-page${modal ? " overlay" : ""}${isClosing ? " closing" : ""}`}
          role={modal ? "dialog" : undefined}
          aria-modal={modal ? "true" : undefined}
          aria-label={modal ? localizeKey(language, "Setup guide") : undefined}
        >
          {modal ? (
            <button
              className="setup-wizard-backdrop"
              type="button"
              onClick={requestClose}
              aria-label={localizeKey(language, "Close")}
            />
          ) : null}
          {modal ? null : (
            <div className="setup-wizard-bg" aria-hidden="true">
              <Pill>
                <T id="Unified AI gateway" />
              </Pill>
              <h1>Claude Code / OpenAI Codex</h1>
            </div>
          )}
          <section
            className={`setup-modal${stage === "guide" ? " guide" : ""}`}
            aria-label={localizeKey(language, "Setup guide")}
          >
            <div className="setup-modal-top">
              <button className="setup-back" type="button" onClick={goBack}>
                <ChevronLeft size={18} />
                <T id="Back" />
              </button>
              <button
                className="setup-modal-close"
                type="button"
                onClick={requestClose}
                aria-label={localizeKey(language, "Close")}
              >
                <X size={22} />
              </button>
            </div>

            {stage === "tool" ? (
              <SetupPicker
                titleId="Setup and installation guide"
                subtitleId="Which tool do you want to configure?"
              >
                <div className="setup-choice-grid two">
                  {setupTools.map((item) => (
                    <SetupChoiceCard
                      key={item.id}
                      item={item}
                      onSelect={() => {
                        setTool(item.id);
                        setStage("os");
                      }}
                    />
                  ))}
                </div>
              </SetupPicker>
            ) : null}

            {stage === "os" && selectedTool ? (
              <SetupPicker
                titleId="Choose operating system"
                subtitleId="Which operating system are you using?"
              >
                <div className="setup-choice-grid three">
                  {setupOperatingSystems.map((item) => (
                    <SetupChoiceCard
                      key={item.id}
                      item={item}
                      onSelect={() => {
                        setOs(item.id);
                        setStage("guide");
                      }}
                    />
                  ))}
                </div>
              </SetupPicker>
            ) : null}

            {stage === "guide" && selectedTool && selectedOs ? (
              <div className="setup-guide">
                <div className="setup-guide-head">
                  <div>
                    <h1>
                      {selectedTool.title} <T id="setup guide" />
                    </h1>
                    <p>
                      <T
                        id="Follow these steps to install and configure {{tool}} on {{os}}."
                        values={{
                          tool: selectedTool.title,
                          os: selectedOs.title,
                        }}
                      />
                    </p>
                  </div>
                  <span className="setup-os-badge">{selectedOs.title}</span>
                </div>
                <div className="setup-guide-body">
                  {guide.map((step, index) => (
                    <SetupGuideStepView
                      index={index}
                      key={`${selectedTool.id}-${selectedOs.id}-${step.titleId}`}
                      step={step}
                    />
                  ))}
                  <div className="setup-guide-done">
                    <Check size={18} />
                    <div>
                      <b>
                        <T id="Setup complete" />
                      </b>
                      <p>
                        <T id="Start using it after saving. Requests will appear in Usage details." />
                      </p>
                    </div>
                    <AppLink className="btn btn-flux btn-sm" href="/usage">
                      <T id="View usage" />
                    </AppLink>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </main>
      </>
    );
  }

  function SetupPicker({
    titleId,
    subtitleId,
    children,
  }: {
    titleId: string;
    subtitleId: string;
    children: ReactNode;
  }) {
    return (
      <div className="setup-picker">
        <h1>
          <T id={titleId} />
        </h1>
        <p>
          <T id={subtitleId} />
        </p>
        {children}
      </div>
    );
  }

  function SetupChoiceCard<T extends string>({
    item,
    onSelect,
  }: {
    item: SetupChoice<T>;
    onSelect: () => void;
  }) {
    return (
      <button className="setup-choice-card" type="button" onClick={onSelect}>
        <span className="setup-choice-icon">{item.icon()}</span>
        <span className="setup-choice-title">{item.title}</span>
        <span className="setup-choice-sub">
          <T id={item.subtitleId} />
        </span>
      </button>
    );
  }

  function SetupGuideStepView({
    index,
    step,
  }: {
    index: number;
    step: SetupGuideStep;
  }) {
    return (
      <div className="setup-guide-step">
        <span className="num">{index + 1}</span>
        <div className="setup-guide-step-body">
          <h3>
            <T id={step.titleId} />
          </h3>
          <p>
            <T id={step.textId} values={step.textValues} />
          </p>
          {step.action ? (
            <a
              className="btn btn-flux btn-sm setup-download"
              href={step.action.href}
              target="_blank"
              rel="noreferrer"
            >
              <T id={step.action.labelId} values={step.action.labelValues} />
            </a>
          ) : null}
          {step.callout ? (
            <div className={`setup-guide-callout ${step.callout.tone}`}>
              {step.callout.tone === "success" ? (
                <Check size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
              <div>
                {step.callout.titleId ? (
                  <b>
                    <T id={step.callout.titleId} />
                  </b>
                ) : null}
                <p>
                  <T
                    id={step.callout.textId}
                    values={step.callout.textValues}
                  />
                </p>
              </div>
            </div>
          ) : null}
          {step.codeBlocks?.map((block) => (
            <div className="setup-code-group" key={block.value}>
              {block.labelId ? (
                <div className="setup-code-label">
                  <T id={block.labelId} values={block.labelValues} />
                </div>
              ) : null}
              <CodeBlock value={block.value} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ClaudeMark() {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M33 4 28.6 25.9 16.2 7.4l8.7 20.4L5 18.5l17.8 13.3H2l20.8 3.2L5 48.3l19.9-9.3-8.7 20.4 12.4-18.5L33 62l4.4-21.1 12.4 18.5-8.7-20.4 19.9 9.3L43.2 35H62L43.2 31.8 61 18.5l-19.9 9.3 8.7-20.4-12.4 18.5Z"
          fill="#e56f4a"
        />
      </svg>
    );
  }

  function CodexMark() {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 7.5c5 0 9.2 2.8 11.4 6.8a13 13 0 0 1 11.3 19.4 13 13 0 0 1-15.5 18.6 13 13 0 0 1-22.7-6.6A13 13 0 0 1 9 26.6 13 13 0 0 1 29.4 8c1-.3 2-.5 2.6-.5Zm0 5.6c-1.5 0-3 .4-4.3 1.2l-12.1 7a7.4 7.4 0 0 0-2.9 10.1 7.4 7.4 0 0 0 9.9 2.9l4.2-2.4v-5.1l-6.1 3.5a3 3 0 0 1-4.1-1.1 3 3 0 0 1 1.1-4.1l12.1-7a7.4 7.4 0 0 1 10.1 2.7l7 12.1a7.4 7.4 0 0 1-2.7 10.1l-4.1 2.4a7.4 7.4 0 0 1-10.1-2.7l-2.5-4.3-4.4 2.5 2.5 4.3a13 13 0 0 0 17.8 4.8l4.1-2.4A13 13 0 0 0 52 32.2l-7-12.1A13 13 0 0 0 32 13.1Zm6.6 17.4-8.4-4.9-4.4 2.5 8.4 4.9 4.4-2.5Zm-10.8 8.2 8.4 4.9 4.4-2.5-8.4-4.9-4.4 2.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  function AppleMark() {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M44.8 34.1c-.1-7.3 6-10.8 6.3-11-3.5-5.1-8.9-5.8-10.8-5.9-4.6-.5-8.9 2.7-11.2 2.7-2.3 0-5.9-2.6-9.8-2.5-5 .1-9.7 2.9-12.3 7.4-5.3 9.2-1.4 22.8 3.8 30.2 2.5 3.6 5.5 7.7 9.4 7.5 3.8-.2 5.2-2.4 9.8-2.4s5.9 2.4 9.8 2.3c4.1-.1 6.7-3.7 9.2-7.4 2.9-4.2 4.1-8.3 4.1-8.5-.1-.1-8-3.1-8.1-12.4ZM37.4 12.5c2.1-2.6 3.5-6.1 3.1-9.6-3 .1-6.7 2-8.9 4.6-1.9 2.2-3.6 5.8-3.2 9.3 3.4.3 6.9-1.7 9-4.3Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  function LinuxMark() {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M18.8 45.7c-4.2 2.5-8.2 5.3-7.4 8.3.9 3.3 7.5 2 12.2-.3 2.7 2 11.9 2.1 16.9.2 4.5 2.5 11.5 3.7 12.7.3 1.1-3.2-3.4-6.3-7.8-8.8-.8-3-2.8-6.8-4.4-10.9-1.2-3.1.3-6.3-.3-11.9C39.9 14.1 36.6 7 32 7s-7.9 7.2-8.7 15.6c-.5 5.6.9 8.8-.3 11.9-1.6 4.2-3.4 8.1-4.2 11.2Z"
          fill="currentColor"
        />
        <circle cx="27.8" cy="21.2" r="2.1" fill="#fff" />
        <circle cx="36.2" cy="21.2" r="2.1" fill="#fff" />
        <path
          d="M28.5 29.2c1.8 1.3 5 1.3 6.8 0"
          fill="none"
          stroke="#fff"
          strokeLinecap="round"
          strokeWidth="2.4"
        />
      </svg>
    );
  }

  function WindowsMark() {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M6 14.5 28.5 11v21H6V14.5Zm25.5-4L58 6v26H31.5V10.5ZM6 35h22.5v21L6 52.5V35Zm31.5 0H58v26l-26.5-4V35Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return SetupPage;
}
