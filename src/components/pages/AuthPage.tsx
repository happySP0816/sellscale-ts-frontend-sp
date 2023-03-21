import { userDataState, userTokenState } from "@atoms/userAtoms";
import { authorize } from "@auth/core";
import {
  LoadingOverlay,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect, useLayoutEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import PageFrame from "../common/PageFrame";

async function sendAuthToken(authToken: string, email: string) {

  const response = await fetch(`${process.env.REACT_APP_API_URI}/client/approve_auth_token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_sdr_email': email,
      'token': authToken,
    })
  });
  if(response.status !== 200){
    showNotification({
      id: 'auth-not-okay',
      title: 'Error',
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: 'red',
      autoClose: false,
    });
  }
  return await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: 'auth-error',
      title: 'Error',
      message: `Error: ${error}`,
      color: 'red',
      autoClose: false,
    });
  });

}

export default function AuthPage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useRecoilState(userDataState);
  const [userToken, setUserToken] = useRecoilState(userTokenState);

  useLayoutEffect(() => {
    setTimeout(() => {
      const tokenType = searchParams.get('stytch_token_type');
      const authToken = searchParams.get('token');
      const email = searchParams.get('email') || userData.sdr_email;

      if (!authToken){
        showNotification({
          id: 'auth-invalid-token',
          title: 'Invalid token',
          message: `Token "${authToken}" is invalid!`,
          color: 'red',
          autoClose: false,
        });
        console.error('Invalid token', tokenType);
        return;
      }

      if(tokenType === 'magic_links'){
        sendAuthToken(authToken, email).then(async (response) => {
          await authorize(response.token, setUserToken, setUserData);
          navigate(`/`);
        });
      } else if(tokenType === 'direct'){
        (async () => {
          await authorize(authToken, setUserToken, setUserData);
          navigate(`/`);
        })();
      } else {
        showNotification({
          id: 'auth-invalid-token-type',
          title: 'Invalid token type',
          message: `Token type "${tokenType}" was not expected!`,
          color: 'red',
          autoClose: false,
        });
        console.error('Invalid token type', tokenType);
      }
    });
  }, []);

  return (
    <PageFrame>
      <LoadingOverlay visible={true} overlayBlur={2} />
    </PageFrame>
  );
}
