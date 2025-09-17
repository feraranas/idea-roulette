import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "../components/atoms/Card";

const meta: Meta<typeof Card> = {
  title: "Atoms/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="text-sm text-neutral-600">
          Lightweight container with rounded corners and border for grouping content.
        </p>
      </div>
    ),
  },
};
