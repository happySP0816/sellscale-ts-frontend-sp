import { MantineTheme } from "@mantine/core";
import { DynamicInsert } from "./DynamicRichTextArea";
import { mergeAttributes, Mark } from "@tiptap/react";
import { ReactNode } from "react";
import ReactDOM from "react-dom";
import { IconRobot } from "@tabler/icons";

const preCompiledRobot = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-robot" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 7h10a2 2 0 0 1 2 2v1l1 1v3l-1 1v3a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-3l-1 -1v-3l1 -1v-1a2 2 0 0 1 2 -2z"></path><path d="M10 16h4"></path><circle cx="8.5" cy="11.5" r="0.5" fill="currentColor"></circle><circle cx="15.5" cy="11.5" r="0.5" fill="currentColor"></circle><path d="M9 7l-1 -4"></path><path d="M15 7l1 -4"></path></svg>`;

interface InsertOptions {
  HTMLAttributes: Record<string, any>;
}

let CustomInserts: Mark<InsertOptions, any>[] = [];

export function getCustomInserts(
  theme: MantineTheme,
  inserts: DynamicInsert[]
) {
  if (CustomInserts.length === 0) {
    CustomInserts = inserts.map((insert) => addCustomInsert(theme, insert));
  }
  return CustomInserts;
}

export const getSVGContent = (icon: ReactNode, color: string) => {
  const tempElement = document.createElement("div");
  // const root = createRoot(tempElement);
  // root.render(<>{icon}</>);
  ReactDOM.render(<>{icon}</>, tempElement);
  const svgContent = tempElement.innerHTML;
  tempElement.remove();
  return svgContent.replaceAll("currentColor", color);
};

function addCustomInsert(theme: MantineTheme, insert: DynamicInsert) {
  const Insert = Mark.create<InsertOptions>({
    name: `insert-${insert.key}`,

    addOptions() {
      return {
        HTMLAttributes: {
          //contenteditable: "false",
        },
      };
    },

    renderHTML({ HTMLAttributes }) {
      return [
        "button",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          class: "dynamic-insert",
          type: "button",
          "data-button": true,
          "data-insert-key": insert.key,
          "data-insert-color": insert.color,
          // style: `position: relative; background-color: ${
          //   theme.colors[insert.color][0]
          // }; color: ${theme.colors[insert.color][5]}`,
        }),
        [
          "div",
          mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
          // [
          //   "img",
          //   mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          //     src: `data:image/svg+xml;utf8,${encodeURIComponent(
          //       getSVGContent(insert.icon, theme.colors[insert.color][5]) ||
          //         preCompiledRobot.replaceAll(
          //           "currentColor",
          //           theme.colors[insert.color][5]
          //         )
          //     )}`,
          //     style:
          //       "position: absolute; top: 2px; left: 5px; height: 1.3rem; width: 1.3rem;",
          //   }),
          // ],
          // [
          //   "span",
          //   mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          //     style:
          //       "margin-left: 1.4rem; display: flex; align-items: center; height: 100%; white-space: nowrap; overflow: hidden; font-size: 0.8rem;",
          //     name: "insert-label-span",
          //   }),
          //   0,
          // ],
        ],
      ];
    },

    parseHTML() {
      return [
        {
          tag: "div",
          getAttrs: (node) =>
            (node as HTMLElement).getAttribute("data-insert-key") ===
              insert.key && null,
        },
      ];
    },
  });

  return Insert;
}
