import { navigateToPage } from "@utils/documentChange";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isFreeUser, isLoggedIn } from "./core";
import { useRecoilValue } from "recoil";
import { userDataState } from "@atoms/userAtoms";

export default function RestrictedRoute(props: { page: React.ReactNode }) {
  const navigate = useNavigate();
  const userData = useRecoilValue(userDataState);

  useEffect(() => {
    setTimeout(() => {
      if (!isLoggedIn()) {
        navigateToPage(navigate, "/login");
      }
      // else if(userData && !userData.onboarded){
      //   navigateToPage(navigate, '/onboarding');
      // }
    });
  }, []);

  if (isLoggedIn()) {
    return <>{props.page}</>;
  } else {
    return <></>;
  }
}
