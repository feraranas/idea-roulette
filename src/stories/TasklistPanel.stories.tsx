import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { TasklistPanel } from "../components/organisms/TasklistPanel";

const markdown = `1. **Prototype overview** — describe single page usage.

- [ ] Build atoms in src/components/atoms.
- [ ] Compose organisms in src/components/organisms.
- [ ] Assemble page in app/page.tsx.
- [ ] Write Storybook coverage.
`;

const meta: Meta<typeof TasklistPanel> = {
  title: "Organisms/TasklistPanel",
  component: TasklistPanel,
  tags: ["autodocs"],
  args: {
    markdown,
    onCopy: action("copy"),
  },
};

export default meta;
type Story = StoryObj<typeof TasklistPanel>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    markdown: "",
  },
};
