import {
  Ai360,
  Claude,
  Cloudflare,
  Cohere,
  DeepSeek,
  Doubao,
  Gemini,
  Hunyuan,
  Jimeng,
  Jina,
  Kling,
  Meta,
  Midjourney,
  Minimax,
  Mistral,
  Moonshot,
  Ollama,
  OpenAI,
  OpenRouter,
  Perplexity,
  Replicate,
  SiliconCloud,
  Spark,
  Suno,
  Wenxin,
  XAI,
  Yi,
  Zhipu,
  Qwen,
} from "@lobehub/icons";
import type { ReactNode } from "react";

type ModelProvider = {
  icon: (size: number) => ReactNode;
  label: string;
};

const providerIcons = {
  ai360: (size: number) => <Ai360.Color size={size} />,
  claude: (size: number) => <Claude.Color size={size} />,
  cloudflare: (size: number) => <Cloudflare.Color size={size} />,
  cohere: (size: number) => <Cohere.Color size={size} />,
  deepseek: (size: number) => <DeepSeek.Color size={size} />,
  doubao: (size: number) => <Doubao.Color size={size} />,
  gemini: (size: number) => <Gemini.Color size={size} />,
  hunyuan: (size: number) => <Hunyuan.Color size={size} />,
  jimeng: (size: number) => <Jimeng.Color size={size} />,
  jina: (size: number) => <Jina size={size} />,
  kling: (size: number) => <Kling.Color size={size} />,
  meta: (size: number) => <Meta.Color size={size} />,
  midjourney: (size: number) => <Midjourney size={size} />,
  minimax: (size: number) => <Minimax.Color size={size} />,
  mistral: (size: number) => <Mistral.Color size={size} />,
  moonshot: (size: number) => <Moonshot size={size} />,
  ollama: (size: number) => <Ollama size={size} />,
  openai: (size: number) => <OpenAI size={size} />,
  openrouter: (size: number) => <OpenRouter size={size} />,
  perplexity: (size: number) => <Perplexity.Color size={size} />,
  qwen: (size: number) => <Qwen.Color size={size} />,
  replicate: (size: number) => <Replicate size={size} />,
  siliconcloud: (size: number) => <SiliconCloud.Color size={size} />,
  spark: (size: number) => <Spark.Color size={size} />,
  suno: (size: number) => <Suno size={size} />,
  wenxin: (size: number) => <Wenxin.Color size={size} />,
  xai: (size: number) => <XAI size={size} />,
  yi: (size: number) => <Yi.Color size={size} />,
  zhipu: (size: number) => <Zhipu.Color size={size} />,
} satisfies Record<string, (size: number) => ReactNode>;

function resolveModelProvider(modelName?: string | null): ModelProvider | null {
  const model = (modelName || "").trim().toLowerCase();
  if (!model) return null;
  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => model.includes(keyword));

  if (
    hasAny([
      "gpt",
      "chatgpt",
      "text-embedding-",
      "omni-moderation",
      "dall-e",
      "whisper",
      "tts-",
      "babbage",
      "davinci",
      "curie",
      "ada",
    ]) ||
    /\bo[134](?:-|$)/.test(model)
  ) {
    return { icon: providerIcons.openai, label: "OpenAI" };
  }
  if (hasAny(["claude", "anthropic"])) {
    return { icon: providerIcons.claude, label: "Claude" };
  }
  if (
    hasAny([
      "gemini",
      "gemma",
      "learnlm",
      "text-embedding-004",
      "imagen-",
      "veo-",
      "aqa",
    ]) ||
    model.startsWith("embedding-")
  ) {
    return { icon: providerIcons.gemini, label: "Gemini" };
  }
  if (hasAny(["grok", "xai"])) {
    return { icon: providerIcons.xai, label: "xAI" };
  }
  if (hasAny(["deepseek"])) {
    return { icon: providerIcons.deepseek, label: "DeepSeek" };
  }
  if (hasAny(["qwen", "qwq"])) {
    return { icon: providerIcons.qwen, label: "Qwen" };
  }
  if (hasAny(["doubao", "volcengine"])) {
    return { icon: providerIcons.doubao, label: "Doubao" };
  }
  if (hasAny(["moonshot", "kimi"])) {
    return { icon: providerIcons.moonshot, label: "Moonshot" };
  }
  if (hasAny(["glm-", "chatglm", "cogview", "cogvideo"])) {
    return { icon: providerIcons.zhipu, label: "Zhipu" };
  }
  if (hasAny(["ernie", "wenxin"])) {
    return { icon: providerIcons.wenxin, label: "Wenxin" };
  }
  if (hasAny(["spark"])) {
    return { icon: providerIcons.spark, label: "Spark" };
  }
  if (hasAny(["minimax", "abab"])) {
    return { icon: providerIcons.minimax, label: "MiniMax" };
  }
  if (hasAny(["hunyuan"])) {
    return { icon: providerIcons.hunyuan, label: "Hunyuan" };
  }
  if (hasAny(["command", "cohere", "c4ai-", "embed-"])) {
    return { icon: providerIcons.cohere, label: "Cohere" };
  }
  if (hasAny(["mistral", "mixtral", "codestral", "pixtral", "voxtral"])) {
    return { icon: providerIcons.mistral, label: "Mistral AI" };
  }
  if (hasAny(["llama", "meta-"])) {
    return { icon: providerIcons.meta, label: "Meta" };
  }
  if (hasAny(["@cf/", "cloudflare"])) {
    return { icon: providerIcons.cloudflare, label: "Cloudflare" };
  }
  if (hasAny(["jina"])) {
    return { icon: providerIcons.jina, label: "Jina" };
  }
  if (hasAny(["openrouter"])) {
    return { icon: providerIcons.openrouter, label: "OpenRouter" };
  }
  if (hasAny(["perplexity", "pplx"])) {
    return { icon: providerIcons.perplexity, label: "Perplexity" };
  }
  if (hasAny(["replicate"])) {
    return { icon: providerIcons.replicate, label: "Replicate" };
  }
  if (hasAny(["silicon", "siliconcloud"])) {
    return { icon: providerIcons.siliconcloud, label: "SiliconCloud" };
  }
  if (hasAny(["ollama"])) {
    return { icon: providerIcons.ollama, label: "Ollama" };
  }
  if (hasAny(["midjourney"]) || model.startsWith("mj_")) {
    return { icon: providerIcons.midjourney, label: "Midjourney" };
  }
  if (hasAny(["suno"])) {
    return { icon: providerIcons.suno, label: "Suno" };
  }
  if (hasAny(["kling"])) {
    return { icon: providerIcons.kling, label: "Kling" };
  }
  if (hasAny(["jimeng"])) {
    return { icon: providerIcons.jimeng, label: "Jimeng" };
  }
  if (hasAny(["360"])) {
    return { icon: providerIcons.ai360, label: "360 AI" };
  }
  if (hasAny(["yi-"])) {
    return { icon: providerIcons.yi, label: "01.AI" };
  }

  return null;
}

export function ModelIcon({ modelName }: { modelName?: string | null }) {
  const provider = resolveModelProvider(modelName);
  if (provider) {
    return (
      <span aria-label={provider.label} title={provider.label}>
        {provider.icon(16)}
      </span>
    );
  }

  const fallbackLetter = (modelName || "?").trim().charAt(0).toUpperCase();
  return <span className="model-icon-fallback">{fallbackLetter || "?"}</span>;
}
