import { useRef, type KeyboardEvent, type ReactNode } from "react";

export type TabDescriptor<Value extends string> = {
  label: ReactNode;
  value: Value;
};

export function getTabId(idPrefix: string, value: string) {
  return `${idPrefix}-tab-${value}`;
}

export function getTabPanelId(idPrefix: string) {
  return `${idPrefix}-panel`;
}

/**
 * Horizontal tab list following the ARIA tabs pattern: only the selected tab is
 * in the tab order, and arrow/Home/End keys move between tabs.
 */
export function TabList<Value extends string>({
  className,
  idPrefix,
  label,
  tabClassName = "",
  tabs,
  value,
  onChange,
}: {
  className: string;
  idPrefix: string;
  label: string;
  tabClassName?: string;
  tabs: TabDescriptor<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}) {
  const buttonRefs = useRef(new Map<Value, HTMLButtonElement | null>());

  const selectByOffset = (event: KeyboardEvent<HTMLDivElement>) => {
    const lastIndex = tabs.length - 1;
    const current = tabs.findIndex((tab) => tab.value === value);
    let next = current;
    if (event.key === "ArrowRight")
      next = current >= lastIndex ? 0 : current + 1;
    else if (event.key === "ArrowLeft")
      next = current <= 0 ? lastIndex : current - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = lastIndex;
    else return;

    event.preventDefault();
    const target = tabs[next];
    if (!target || target.value === value) return;
    onChange(target.value);
    buttonRefs.current.get(target.value)?.focus();
  };

  return (
    <div
      aria-label={label}
      className={className}
      role="tablist"
      onKeyDown={selectByOffset}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(node) => {
              buttonRefs.current.set(tab.value, node);
            }}
            aria-controls={getTabPanelId(idPrefix)}
            aria-selected={selected}
            className={`${tabClassName}${selected ? " active" : ""}`.trim()}
            id={getTabId(idPrefix, tab.value)}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
            onClick={() => onChange(tab.value)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({
  children,
  className,
  idPrefix,
  value,
}: {
  children: ReactNode;
  className?: string;
  idPrefix: string;
  value: string;
}) {
  return (
    <div
      aria-labelledby={getTabId(idPrefix, value)}
      className={className}
      id={getTabPanelId(idPrefix)}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
