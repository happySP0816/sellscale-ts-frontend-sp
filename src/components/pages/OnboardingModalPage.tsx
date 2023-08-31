import {
  LoadingOverlay,
  Modal,
  Text,
  Title,
  Button,
  TextInput,
  Center,
  Container,
  Stepper,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconArrowLeft, IconArrowRight, IconAt } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { login, syncLocalStorage } from '@auth/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { LogoFull } from '@nav/old/Logo';
import { API_URL, EMAIL_REGEX } from '@constants/data';
import { navigateToPage, setPageTitle } from '@utils/documentChange';
import BasicsSection from '@common/onboarding/BasicsSection';
import ConnectionsSection from '@common/onboarding/ConnectionsSection';
import SchedulingSection from '@common/onboarding/SchedulingSection';
import { updateClientSDR } from '@utils/requests/updateClientSDR';
import { completeClientSDROnboarding } from '@utils/requests/completeClientSDROnboarding';
import { useNavigate } from 'react-router-dom';

export default function OnboardingModalPage() {
  setPageTitle(`Onboarding`);

  const navigate = useNavigate();
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);


  const [fullName, setFullName] = useState(userData.sdr_name);
  const [publicTitle, setPublicTitle] = useState(userData.sdr_title);

  const [step, setStep] = useState(0);
  const nextStep = async () => {

    if(step === 0) {
      if(userData.sdr_name !== fullName || userData.sdr_title !== publicTitle) {
        const response = await updateClientSDR(userToken, fullName, publicTitle);
        if(response.status === 'success'){
          setUserData({...userData, sdr_name: fullName, sdr_title: publicTitle});
        }
      }
    }

    await syncLocalStorage(userToken, setUserData);

    setStep((current) => (current < 3 ? current + 1 : current));
  };
  const prevStep = () => setStep((current) => (current > 0 ? current - 1 : current));

  const backExists = step > 0;
  const nextExists = step < 2;
  const backEnabled = true;
  const nextEnabled = (
    step === 0 && fullName && publicTitle
  ) || (
    step === 1 && true
  );

  const complete = async () => {
    const response = await completeClientSDROnboarding(userToken);
    if(response.status === 'success'){
      await syncLocalStorage(userToken, setUserData);
      navigateToPage(navigate, '/');
    }
  };

  return (
    <Modal opened={true} withCloseButton={false} onClose={() => {}} size='xl'>
      <Title ta='center' order={2}>
        Setup your Account
      </Title>
      <Container mt={10}>
        <Stepper active={step} breakpoint='sm'>
          <Stepper.Step label='Basics' description='General info'>
            <BasicsSection
              fullName={fullName}
              setFullName={setFullName}
              publicTitle={publicTitle}
              setPublicTitle={setPublicTitle}
            />
          </Stepper.Step>
          <Stepper.Step label='Connections' description='Link your accounts'>
            {step === 1 && <ConnectionsSection />}
          </Stepper.Step>
          <Stepper.Step label='Scheduling' description='Set your availability'>
            {step === 2 && <SchedulingSection />}
          </Stepper.Step>

          <Stepper.Completed>
          </Stepper.Completed>
        </Stepper>
      </Container>

      <Container>
        <Group position='center' mt='xl'>
          {step !== 3 && (
            <>
              <Button
                variant='default'
                radius='md'
                onClick={prevStep}
                disabled={!backEnabled || !backExists}
                leftIcon={<IconArrowLeft size='1rem' />}
              >
                Back
              </Button>
              {step === 2 ? (
                <Button loading={false} onClick={complete} color='blue' variant='outline' radius='md'>
                  Complete
                </Button>
              ) : (
                <Button
                  color='blue'
                  radius='md'
                  onClick={nextStep}
                  disabled={!nextEnabled || !nextExists}
                  rightIcon={<IconArrowRight size='1rem' />}
                >
                  Next
                </Button>
              )}
            </>
          )}
        </Group>
      </Container>
    </Modal>
  );
}
