import { userDataState, userTokenState } from "@atoms/userAtoms";
import { authorize } from "@auth/core";
import {
  LoadingOverlay,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { navigateToPage } from "@utils/documentChange";
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import PageFrame from "../common/PageFrame";
import { API_URL } from "@constants/data";
import { updateCalendlyAccessToken } from "@utils/requests/updateCalendlyAccessToken";


export default function AuthCalendlyPage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useRecoilState(userDataState);
  const [userToken, setUserToken] = useRecoilState(userTokenState);

  const code = searchParams.get('code');
  const codeRef = useRef('');

  if(code){
    codeRef.current = code;
    (async () => {
      const response = await updateCalendlyAccessToken(userToken, codeRef.current);
      console.log(codeRef.current);
      console.log(response);
      if(response.status === 'success'){
        navigateToPage(navigate, '/');
      }
    })();
  }

  return (
    <PageFrame>
      <LoadingOverlay visible={true} overlayBlur={2} />
    </PageFrame>
  );
}
