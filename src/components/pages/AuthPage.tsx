import { userEmailState } from "@atoms/userAtoms";
import {
  LoadingOverlay,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import PageFrame from "../common/PageFrame";

async function sendAuthToken(token: string, email: string) {

  const response = await fetch(`${process.env.REACT_APP_API_URI}/client/approve_auth_token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_sdr_email': email,
      'token': token,
    })
  });
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

  const [searchParams] = useSearchParams();
  const userEmail = useRecoilValue(userEmailState);

  useEffect(() => {
    const tokenType = searchParams.get('stytch_token_type');
    const token = searchParams.get('token');

    if (tokenType !== 'magic_links'){
      showNotification({
        id: 'auth-invalid-token-type',
        title: 'Invalid token type',
        message: `Token type "${tokenType}" was not expected!`,
        color: 'red',
        autoClose: false,
      });
      console.error('Invalid token type', tokenType);
      return;
    }
    if (!token){
      showNotification({
        id: 'auth-invalid-token',
        title: 'Invalid token',
        message: `Token "${token}" is invalid!`,
        color: 'red',
        autoClose: false,
      });
      console.error('Invalid token', tokenType);
      return;
    }

    sendAuthToken(token, userEmail).then((response) => {
      console.log(response.status);
    });

  }, [searchParams, userEmail]);

  return (
    <PageFrame>
      <LoadingOverlay visible={true} overlayBlur={2} />
    </PageFrame>
  );
}
