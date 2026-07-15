import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ChipsOverflowRow, type ChipData } from "./ChipsOverflowRow";

vi.mock("../OverflowRow", () => ({
  OverflowRow: ({
    items,
    getKey,
    renderItem,
  }: {
    items: ChipData[];
    getKey: (item: ChipData) => string;
    renderItem: (item: ChipData) => ReactNode;
  }) => (
    <div>
      {items.map((item) => (
        <div key={getKey(item)}>{renderItem(item)}</div>
      ))}
    </div>
  ),
}));

const chips: ChipData[] = [
  { id: 1, label: "Alpha" },
  { id: 2, label: "Beta", selected: true },
  { id: 3, label: "Gamma" },
];

describe("ChipsOverflowRow", () => {
  it("рендерит подписи chips", () => {
    render(<ChipsOverflowRow chips={chips} onChange={() => {}} />);

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("вызывает onChange с иммутабельным переключением кликнутого chip", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ChipsOverflowRow chips={chips} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Alpha" }));

    expect(onChange).toHaveBeenCalledTimes(1);

    const nextChips = onChange.mock.calls[0][0] as ChipData[];

    expect(nextChips).not.toBe(chips);
    expect(nextChips[0]).toEqual({ id: 1, label: "Alpha", selected: true });
    expect(nextChips[0]).not.toBe(chips[0]);
    expect(nextChips[1]).toBe(chips[1]);
    expect(nextChips[2]).toBe(chips[2]);
  });

  it("работает как controlled multi-select список", async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState(chips);
      return <ChipsOverflowRow chips={value} onChange={setValue} />;
    }

    render(<Harness />);

    const alpha = () => screen.getByRole("button", { name: "Alpha" });
    const beta = () => screen.getByRole("button", { name: "Beta" });

    expect(alpha()).toHaveAttribute("aria-pressed", "false");
    expect(beta()).toHaveAttribute("aria-pressed", "true");

    await user.click(alpha());

    expect(alpha()).toHaveAttribute("aria-pressed", "true");
    expect(beta()).toHaveAttribute("aria-pressed", "true");

    await user.click(beta());

    expect(alpha()).toHaveAttribute("aria-pressed", "true");
    expect(beta()).toHaveAttribute("aria-pressed", "false");
  });
});
