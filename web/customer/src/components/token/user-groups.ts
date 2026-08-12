export type UserGroupSelectOption = {
  name: string;
  desc: string;
  ratio: string;
};

export function normalizeUserGroupOptions(
  groups: Record<string, { ratio?: string | number; desc?: string }>,
): UserGroupSelectOption[] {
  return Object.entries(groups)
    .map(([name, info]) => ({
      name,
      desc: String(info.desc || ""),
      ratio: String(info.ratio ?? ""),
    }))
    .sort((first, second) => {
      if (first.name === "auto") return -1;
      if (second.name === "auto") return 1;
      return first.name.localeCompare(second.name);
    });
}

export function formatUserGroupOptionLabel(option: UserGroupSelectOption) {
  const parts = [option.name];
  if (option.desc) parts.push(option.desc);
  if (option.ratio) parts.push(option.ratio);
  return parts.join(" · ");
}
