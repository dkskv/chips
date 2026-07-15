import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "storybook/preview-api";
import { useCallback } from "react";
import { ChipsOverflowRow, type ChipData } from "./ChipsOverflowRow";

const initialChips: ChipData[] = Array.from({ length: 13 }, (_, index) => ({
  id: index + 1,
  label: `Чипс ${index + 1}`,
  selected: false,
}));

const meta = {
  title: "UI/ChipsOverflowRow",
  component: ChipsOverflowRow,

  argTypes: {
    chips: {
      control: "object",
    },
    onChange: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof ChipsOverflowRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chips: initialChips,
    onChange: () => {},
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    const handleChange = useCallback(
      (chips: ChipData[]) => updateArgs({ chips }),
      [updateArgs],
    );

    return <ChipsOverflowRow chips={args.chips} onChange={handleChange} />;
  },
};
