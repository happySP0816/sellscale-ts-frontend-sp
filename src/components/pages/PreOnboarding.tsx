import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import react from 'react';
import { useRecoilValue } from 'recoil';

export function getPreOnboardingData(userToken: string, onComplete: (data: any) => void) {
  fetch(`${API_URL}/client/pre_onboarding_survey`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
    },
  }).then((res) => {
    if (res.status === 200) {
      res.json().then((data) => {
        onComplete(data);
      });
    } else {
      console.log('Error getting pre-onboarding data');
    }
  });
}

export default function PersonaOnboarding() {
  const userToken = useRecoilValue(userTokenState);

  return (
    <div>
      <iframe 
        src={'https://sellscale.retool.com/embedded/public/ccd2d653-d080-492f-8497-26276d9954ab#authToken=' + userToken}
        style={{
          width: '100%',
          height: window.innerHeight - 40,
          border: 'none',
        }}>

      </iframe>
    </div>
  );
}