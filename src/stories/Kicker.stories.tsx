import type { Meta, StoryObj } from "@storybook/react";
import { Kicker } from "../components/atoms/Kicker";

const meta: Meta<typeof Kicker> = {
  title: "Atoms/Kicker",
  component: Kicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Kicker>;

export const Default: Story = {
  args: {
    children: "Single-page prototype only",
  },
};
