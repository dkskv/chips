import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "storybook/preview-api";
import { Chip } from "./Chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  args: {
    label: "New",
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Selectable: Story = {
  args: {
    selected: false,
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <Chip
        {...args}
        selected={args.selected}
        onSelect={(selected) => updateArgs({ selected })}
      />
    );
  },
};

export const InteractiveIconOnly: Story = {
  args: {
    label: undefined,
    interactive: true,
  },
  render: (args) => (
    <Chip
      {...args}
      icon={
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="3" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="13" cy="8" r="1.5" fill="currentColor" />
        </svg>
      }
    />
  ),
};
