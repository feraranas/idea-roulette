import type { Meta, StoryObj } from "@storybook/react";
import Page from "../app/page";

const meta: Meta<typeof Page> = {
  title: "Page/Main",
  component: Page,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Page>;

export const Default: Story = {};
