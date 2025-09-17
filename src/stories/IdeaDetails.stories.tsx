import type { Meta, StoryObj } from "@storybook/react";
import { IdeaDetails } from "../components/organisms/IdeaDetails";
import type { Idea } from "../types/idea";

const idea: Idea = {
  title: "Sample Idea",
  summary: "### Summary\nBrief markdown summary for the idea.",
  one_pager: "# One Pager\nDetailed plan for the sample idea.",
};

const meta: Meta<typeof IdeaDetails> = {
  title: "Organisms/IdeaDetails",
  component: IdeaDetails,
  tags: ["autodocs"],
  args: {
    idea,
  },
};

export default meta;
type Story = StoryObj<typeof IdeaDetails>;

export const Collapsed: Story = {};

export const Expanded: Story = {
  args: {
    defaultExpanded: true,
  },
};
