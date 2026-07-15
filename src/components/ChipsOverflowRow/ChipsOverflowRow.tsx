import { memo, useCallback } from "react";
import { Chip } from "../Chip";
import { OverflowRow } from "../OverflowRow";
import { useLatestRef } from "@/lib/useLatestRef";
import EllipsisIcon from "./resources/ellipsis.svg?react";
import styles from "./ChipsOverflowRow.module.css";

export type ChipData = {
  id: string | number;
  label: string;
  selected?: boolean;
};

type ChipsOverflowRowProps = {
  chips: ChipData[];
  onChange: (chips: ChipData[]) => void;
};

function ChipsOverflowRowComponent({ chips, onChange }: ChipsOverflowRowProps) {
  const chipsRef = useLatestRef(chips);

  const handleSelect = useCallback(
    (id: ChipData["id"], selected: boolean) => {
      onChange(
        chipsRef.current.map((chip) =>
          chip.id === id ? { ...chip, selected } : chip,
        ),
      );
    },
    [chipsRef, onChange],
  );

  const getKey = useCallback((chip: ChipData) => String(chip.id), []);

  const renderItem = useCallback(
    (chip: ChipData) => (
      <Chip
        label={chip.label}
        selected={Boolean(chip.selected)}
        onSelect={(selected) => handleSelect(chip.id, selected)}
      />
    ),
    [handleSelect],
  );

  const renderOverflowButton = useCallback(
    () => <Chip icon={<EllipsisIcon />} interactive={true} />,
    [],
  );

  return (
    <div className={styles.root}>
      <OverflowRow
        items={chips}
        getKey={getKey}
        renderItem={renderItem}
        renderOverflowButton={renderOverflowButton}
      />
    </div>
  );
}

export const ChipsOverflowRow = memo(ChipsOverflowRowComponent);
