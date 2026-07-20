import {
  Children,
  cloneElement,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

type MenuItemProps = {
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  role?: string;
  tabIndex?: number;
};

function getEnabledItems(items: Array<HTMLElement | null>) {
  return items.filter(
    (item): item is HTMLElement =>
      Boolean(item) &&
      !item?.matches(":disabled") &&
      item?.getAttribute("aria-disabled") !== "true",
  );
}

export function DropdownMenu({
  children,
  className,
  menuClassName,
  menuLabel,
  open,
  triggerAriaLabel,
  triggerClassName,
  triggerContent,
  onOpenChange,
}: {
  children: ReactNode;
  className?: string;
  menuClassName: string;
  menuLabel: string;
  open: boolean;
  triggerAriaLabel?: string;
  triggerClassName: string;
  triggerContent: ReactNode;
  onOpenChange: (open: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const pendingFocusRef = useRef<"first" | "last">("first");
  const menuId = useId();
  const menuItems = Children.toArray(children).filter(isValidElement) as Array<
    ReactElement<MenuItemProps>
  >;

  useLayoutEffect(() => {
    if (!open) return;
    const enabledItems = getEnabledItems(itemRefs.current);
    const target =
      pendingFocusRef.current === "last"
        ? enabledItems.at(-1)
        : enabledItems[0];
    target?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onOpenChange, open]);

  const focusRelativeItem = (direction: 1 | -1) => {
    const enabledItems = getEnabledItems(itemRefs.current);
    if (enabledItems.length === 0) return;
    const currentIndex = enabledItems.findIndex(
      (item) => item === document.activeElement,
    );
    const nextIndex =
      currentIndex < 0
        ? direction === 1
          ? 0
          : enabledItems.length - 1
        : (currentIndex + direction + enabledItems.length) %
          enabledItems.length;
    enabledItems[nextIndex]?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    pendingFocusRef.current = event.key === "ArrowUp" ? "last" : "first";
    onOpenChange(true);
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      focusRelativeItem(event.key === "ArrowDown" ? 1 : -1);
      return;
    }
    const enabledItems = getEnabledItems(itemRefs.current);
    if (event.key === "Home") {
      event.preventDefault();
      enabledItems[0]?.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      enabledItems.at(-1)?.focus();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") onOpenChange(false);
  };

  return (
    <div className={className} ref={containerRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerAriaLabel}
        className={triggerClassName}
        ref={triggerRef}
        type="button"
        onClick={() => {
          pendingFocusRef.current = "first";
          onOpenChange(!open);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {triggerContent}
      </button>
      {open ? (
        <div
          aria-label={menuLabel}
          className={menuClassName}
          id={menuId}
          role="menu"
          onKeyDown={handleMenuKeyDown}
        >
          {menuItems.map((child, index) =>
            cloneElement(child, {
              onClick: (event: MouseEvent<HTMLElement>) => {
                child.props.onClick?.(event);
                if (!event.defaultPrevented) {
                  onOpenChange(false);
                  triggerRef.current?.focus();
                }
              },
              ref: (element: HTMLElement | null) => {
                itemRefs.current[index] = element;
              },
              role: "menuitem",
              tabIndex: -1,
            } as MenuItemProps & {
              ref: (element: HTMLElement | null) => void;
            }),
          )}
        </div>
      ) : null}
    </div>
  );
}
