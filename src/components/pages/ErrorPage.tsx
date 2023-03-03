import { setPageTitle } from "@utils/documentChange";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  // @ts-ignore
  setPageTitle(`Error ${error.status}`);

  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>{/* @ts-ignore */}
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}