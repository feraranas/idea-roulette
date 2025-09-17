import type { Meta, StoryObj } from "@storybook/react";
import { IdeaSlotMachine } from "../components/organisms/IdeaSlotMachine";
import type { Idea } from "../types/idea";

const ideas: Idea[] = [
  {
    title: "Test Idea A",
    summary: "Summary A",
    one_pager: "Details for idea A",
  },
  {
    title: "Test Idea B",
    summary: "Summary B",
    one_pager: "Details for idea B",
  },
  {
    title: "Test Idea C",
    summary: "Summary C",
    one_pager: "Details for idea C",
  },
];

const meta: Meta<typeof IdeaSlotMachine> = {
  title: "Organisms/IdeaSlotMachine",
  component: IdeaSlotMachine,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof IdeaSlotMachine>;

export const Default: Story = {
  args: {
    ideas,
    durationMs: 1500,
  },
};

export const ReducedMotion: Story = {
  args: {
    ideas,
    durationMs: 500,
  },
  parameters: {
    controls: { exclude: ["onDone"] },
  },
};
