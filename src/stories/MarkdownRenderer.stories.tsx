import type { Meta, StoryObj } from "@storybook/react";
import { MarkdownRenderer } from "../components/atoms/MarkdownRenderer";

const meta: Meta<typeof MarkdownRenderer> = {
  title: "Atoms/MarkdownRenderer",
  component: MarkdownRenderer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof MarkdownRenderer>;

const sampleMarkdown = `# Heading One

## Subheading Two

Paragraph text with [link](https://example.com) and some \

	snippet code.

- List item one
- List item two

> Blockquote example.
`;

export const Default: Story = {
  args: {
    markdown: sampleMarkdown,
    className: "max-w-xl",
  },
};

export const LongContent: Story = {
  args: {
    markdown: `${sampleMarkdown.repeat(4)}`,
    className: "max-w-xl max-h-96 overflow-auto",
  },
};
