import { Apple, Claude, OpenAI } from "@lobehub/icons";
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
      icon: ClaudeCodeMark,
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

  function ClaudeCodeMark() {
    return (
      <span className="setup-brand-mark claude" aria-hidden="true">
        <Claude.Color size={52} />
      </span>
    );
  }

  function CodexMark() {
    return (
      <span className="setup-brand-mark codex" aria-hidden="true">
        <OpenAI size={52} />
      </span>
    );
  }

  function AppleMark() {
    return (
      <span className="setup-brand-mark apple" aria-hidden="true">
        <Apple size={52} />
      </span>
    );
  }

  function LinuxMark() {
    return (
      <span className="setup-brand-mark linux" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path
            d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 0 0-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 0 0-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 0 1-.004-.021l-.004-.024a1.807 1.807 0 0 1-.15.706.953.953 0 0 1-.213.335.71.71 0 0 0-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 0 0-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 0 0-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 0 0-.205.334 1.18 1.18 0 0 0-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 0 1-.018-.2v-.02a1.772 1.772 0 0 1 .15-.768c.082-.22.232-.406.43-.533a.985.985 0 0 1 .594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 0 0-.166-.267.248.248 0 0 0-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 0 0-.12.27.944.944 0 0 0-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 0 1-.131.068 2.62 2.62 0 0 1-.275-.402 1.772 1.772 0 0 1-.155-.667 1.759 1.759 0 0 1 .08-.668 1.43 1.43 0 0 1 .283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 0 1 .016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 0 1-.448-.067 3.566 3.566 0 0 1-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 0 0-.402-.533 1.45 1.45 0 0 0-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 0 0 .314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 0 1 .647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 0 1-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }

  function WindowsMark() {
    return (
      <span className="setup-brand-mark windows" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path
            d="M0 0h11.377v11.372H0V0Zm12.623 0H24v11.372H12.623V0ZM0 12.623h11.377V24H0V12.623Zm12.623 0H24V24H12.623V12.623Z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }

  return SetupPage;
}
