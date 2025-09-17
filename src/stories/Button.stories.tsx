import type { Meta, StoryObj } from "@storybook/react";
import { Button, type ButtonProps } from "../components/atoms/Button";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof Button> = {
  title: "Atoms/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Responsive button component supporting primary and outline variants with loading states.",
      },
    },
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["md", "lg"],
    },
    variant: {
      control: "radio",
      options: ["primary", "outline"],
    },
    loading: {
      control: "boolean",
    },
    fullWidth: {
      control: "boolean",
    },
    onClick: { action: "clicked" },
  },
  args: {
    size: "md",
    variant: "primary",
    children: "Click me",
    onClick: action("button-click"),
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};
