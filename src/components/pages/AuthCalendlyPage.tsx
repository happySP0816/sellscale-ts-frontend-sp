import { userDataState, userTokenState } from "@atoms/userAtoms";
import { authorize } from "@auth/core";
import {
  LoadingOverlay,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { navigateToPage } from "@utils/documentChange";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import PageFrame from "../common/PageFrame";
import { API_URL } from "@constants/data";


export default function AuthCalendlyPage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useRecoilState(userDataState);
  const [userToken, setUserToken] = useRecoilState(userTokenState);

  useEffect(() => {
    setTimeout(() => {
      const tokenType = searchParams.get('stytch_token_type');
      const authToken = searchParams.get('token');
      const email = searchParams.get('email') || userData.sdr_email;

      const redirect = searchParams.get('redirect') ? `/${searchParams.get('redirect')}` : '/';

      
    });
  }, []);

  return (
    <PageFrame>
      <LoadingOverlay visible={true} overlayBlur={2} />
    </PageFrame>
  );
}
