import { getOpenAICompatibleServerAddress } from "../../helpers/server-address";
import type { SetupGuideStep, SetupOs, SetupTool } from "../../types";

const apiKeyPlaceholder = "YOUR_API_KEY";
const nodeDownloadUrl = "https://nodejs.org/en/download";
const codexInstallUrl = "https://chatgpt.com/codex/install.sh";
const codexWindowsInstallUrl = "https://chatgpt.com/codex/install.ps1";

export function getSetupGuide(
  tool: SetupTool,
  os: SetupOs,
  gatewayBaseUrl: string,
): SetupGuideStep[] {
  return tool === "claude"
    ? getClaudeGuide(os, gatewayBaseUrl)
    : getCodexGuide(os, gatewayBaseUrl);
}

function getClaudeGuide(os: SetupOs, gatewayBaseUrl: string): SetupGuideStep[] {
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

function getCodexGuide(os: SetupOs, gatewayBaseUrl: string): SetupGuideStep[] {
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
