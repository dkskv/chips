import { memo, type KeyboardEvent, type ReactNode } from "react";
import CheckIcon from "./resources/check.svg?react";
import styles from "./Chip.module.css";

type ChipProps = {
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  /** Делает чип кнопкой (role/tabIndex) без onSelect */
  interactive?: true;
} & (
  | {
      label: ReactNode;
      icon?: ReactNode;
    }
  | {
      label?: ReactNode;
      icon: ReactNode;
    }
);

function ChipComponent({
  label,
  icon,
  selected = false,
  onSelect,
  interactive,
}: ChipProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(!selected);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();

    if (onSelect) {
      onSelect(!selected);
      return;
    }

    // синтетический click, чтобы сработал trigger на родителе
    event.currentTarget.click();
  };

  return (
    <span
      className={styles.root}
      aria-pressed={selected}
      {...(interactive || Boolean(onSelect)
        ? {
            role: "button",
            tabIndex: 0,
            onClick: handleClick,
            onKeyDown: handleKeyDown,
          }
        : undefined)}
    >
      {selected ? (
        <span className={`${styles.icon} ${styles.check}`} aria-hidden="true">
          <CheckIcon />
        </span>
      ) : null}
      {icon ? (
        <span className={styles.icon} aria-hidden={label ? true : undefined}>
          {icon}
        </span>
      ) : null}
      {label ? <span>{label}</span> : null}
    </span>
  );
}

export const Chip = memo(ChipComponent);
