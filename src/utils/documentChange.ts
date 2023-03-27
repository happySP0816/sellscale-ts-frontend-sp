import { SITE_NAME } from "@constants/data";
import { NavigateFunction } from "react-router-dom";

export function setPageTitle(title: string) {
  const newTitle = `${title} | ${SITE_NAME}`;
  if(document.title !== newTitle) {
    document.title = newTitle;
  }
}

export function navigateToPage(navigate: NavigateFunction, to: string) {
  navigate(to);
}
