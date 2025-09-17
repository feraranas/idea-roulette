import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "../components/atoms/Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Atoms/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Accessible loading indicator respecting reduced motion preferences.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: "md",
  },
};

export const ReducedMotion: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  render: () => (
    <div className="motion-reduce:animate-none">
      <Spinner size="md" />
    </div>
  ),
};
