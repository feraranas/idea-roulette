import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { CopyButton } from "../components/atoms/CopyButton";

const meta: Meta<typeof CopyButton> = {
  title: "Atoms/CopyButton",
  component: CopyButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const CopySuccess: Story = {
  args: {
    children: "Copy",
    getText: () => "Sample text",
    onCopied: action("copied"),
  },
};
