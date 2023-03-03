import { SITE_NAME } from "@constants/data";

export function setPageTitle(title: string) {
  const newTitle = `${title} | ${SITE_NAME}`;
  if(document.title !== newTitle) {
    document.title = newTitle;
  }
}
