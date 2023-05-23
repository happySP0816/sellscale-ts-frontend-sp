import { userDataState, userTokenState } from '@atoms/userAtoms';
import { authorize } from '@auth/core';
import { LoadingOverlay } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { navigateToPage } from '@utils/documentChange';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import PageFrame from '../common/PageFrame';
import { API_URL } from '@constants/data';
import { updateCalendlyAccessToken } from '@utils/requests/updateCalendlyAccessToken';
import { useDebouncedValue, useDidUpdate } from '@mantine/hooks';

export default function AuthCalendlyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useRecoilState(userDataState);
  const [userToken, setUserToken] = useRecoilState(userTokenState);

  const code = searchParams.get('code');
  const codeCallRef = useRef(true);

  useEffect(() => {
    if (code && codeCallRef.current) {
      codeCallRef.current = false;
      (async () => {
        const response = await updateCalendlyAccessToken(userToken, code);
        if(response.status === 'success'){
          navigateToPage(navigate, '/');
        }
      })();
    }
  }, []);

  return (
    <PageFrame>
      <LoadingOverlay visible={true} overlayBlur={2} />
    </PageFrame>
  );
}
