import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("рендерит статичный chip без семантики кнопки", () => {
    render(<Chip label="Static" />);

    expect(screen.getByText("Static")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("становится кнопкой при onSelect и переключает selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<Chip label="Alpha" onSelect={onSelect} />);

    const button = screen.getByRole("button", { name: "Alpha" });

    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(true);
  });

  it("отдаёт selected-состояние через aria-pressed", () => {
    const { container } = render(<Chip label="Selected" selected />);
    const root = container.firstElementChild;

    expect(root).toHaveAttribute("aria-pressed", "true");
  });

  it("переключает selection через Enter и Space при onSelect", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<Chip label="Alpha" selected onSelect={onSelect} />);

    const button = screen.getByRole("button", { name: "Alpha" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    button.focus();

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(false);

    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith(false);
  });

  it("становится фокусируемой кнопкой при interactive без onSelect", async () => {
    const user = userEvent.setup();
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <Chip icon={<span>…</span>} interactive />
      </div>,
    );

    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("tabIndex", "0");
    expect(button).toHaveAttribute("aria-pressed", "false");

    await user.click(button);
    expect(parentClick).toHaveBeenCalledTimes(1);

    button.focus();
    await user.keyboard("{Enter}");
    expect(parentClick).toHaveBeenCalledTimes(2);

    await user.keyboard(" ");
    expect(parentClick).toHaveBeenCalledTimes(3);
  });
});
