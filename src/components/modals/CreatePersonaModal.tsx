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
  Paper,
  Tabs,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconArrowLeft, IconArrowRight, IconAt, IconCircleX, IconX } from '@tabler/icons';
import { useEffect, useRef, useState } from 'react';
import { login, syncLocalStorage } from '@auth/core';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { LogoFull } from '@nav/Logo';
import { API_URL, EMAIL_REGEX } from '@constants/data';
import { navigateToPage, setPageTitle } from '@utils/documentChange';
import BasicsSection from '@common/onboarding/BasicsSection';
import ConnectionsSection from '@common/onboarding/ConnectionsSection';
import SchedulingSection from '@common/onboarding/SchedulingSection';
import { updateClientSDR } from '@utils/requests/updateClientSDR';
import { completeClientSDROnboarding } from '@utils/requests/completeClientSDROnboarding';
import { useNavigate } from 'react-router-dom';
import { ContextModalProps } from '@mantine/modals';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import ComingSoonCard from '@common/library/ComingSoonCard';
import CreatePersona from '@utils/requests/createPersona';
import FileDropAndPreview from './upload-prospects/FileDropAndPreview';
import StepOne from '@common/persona/_not_used_creation/StepOne';
import StepTwo from '@common/persona/_not_used_creation/StepTwo';
import StepThree from '@common/persona/_not_used_creation/StepThree';
import { Archetype, PersonaOverview } from 'src';
import createPersona from '@utils/requests/createPersona';
import StepFive from '@common/persona/_not_used_creation/StepFive';
import StepFour from '@common/persona/_not_used_creation/StepFour';
import { personaCreationState } from '@atoms/personaAtoms';
import { useDebouncedState, useDebouncedValue } from '@mantine/hooks';
import _ from 'lodash';

export interface ArchetypeCreation extends Archetype {
  fitReason: string;
  contactObjective: string;
  fileJSON: any[];
}

export default function CreatePersonaModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ personas: PersonaOverview[] }>) {
  const navigate = useNavigate();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [creationData, setCreationData] = useRecoilState(personaCreationState);

  // Since persona is being updated often, let's debounce it before we save to global state
  const [persona, setPersona] = useDebouncedState(_.cloneDeep(creationData.persona), 400);
  useEffect(() => {
    setCreationData((prev) => {
      return {
        step: prev.step,
        persona: _.cloneDeep(persona),
      };
    });
  }, [persona]);

  const [step, setStep] = useState(creationData.step);
  const nextStep = async () => {
    // Create persona if it doesn't exist
    if (step === 1 && persona.id === -1) {
      const response = await createPersona(userToken, persona.archetype, [], {
        fitReason: persona.fitReason,
        icpMatchingPrompt: persona.icp_matching_prompt,
        contactObjective: persona.contactObjective,
        contractSize: 10000,
      });
      if (response.status === 'success') {
        setPersona({
          ...persona,
          id: response.data,
        });
      }
    }

    setStep((current) => (current < 6 ? current + 1 : current));
  };
  const prevStep = () => setStep((current) => (current > 0 ? current - 1 : current));

  // Sync local step to global step
  useEffect(() => {
    setCreationData((prev) => {
      return {
        step: step,
        persona: prev.persona,
      };
    });
  }, [step]);

  const backExists = step > 0;
  const nextExists = step < 5;
  const backEnabled = true;
  const nextEnabled = true; //(step === 0 && personaName && personaContactObjective) || (step === 1 && true);

  const complete = async () => {
    /*
    const response = await completeClientSDROnboarding(userToken);
    if (response.status === 'success') {
      navigateToPage(navigate, '/');
    }*/
  };


  const isStepOneComplete = persona.archetype && persona.fileJSON.length > 0;
  const isStepTwoComplete = persona.fitReason && persona.icp_matching_prompt && persona.contactObjective;
  const isStepThreeComplete = true;// TODO: Pulse checking
  const isStepFourComplete = persona.ctas && persona.ctas.length > 0;
  const isStepFiveComplete = true; // TODO: 


  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
      }}
    >
      <Container mt={5}>
        <Stepper active={step} breakpoint='sm'>
          <Stepper.Step
            label='Import'
            description='General setup'
            color={isStepOneComplete ? undefined : 'red'}
            completedIcon={isStepOneComplete ? undefined : <IconX size="1.1rem" />}
          >
            <StepOne
              onChange={(data) => {
                setPersona({
                  ...persona,
                  archetype: data.name,
                  fileJSON: data.fileJSON,
                });
              }}
            />
          </Stepper.Step>
          <Stepper.Step
            label='Learn'
            description='Details & descriptions'
            color={isStepTwoComplete ? undefined : 'red'}
            completedIcon={isStepTwoComplete ? undefined : <IconX size="1.1rem" />}
          >
            {step === 1 && (
              <StepTwo
                onChange={(data) => {
                  setPersona({
                    ...persona,
                    fitReason: data.fitReason,
                    icp_matching_prompt: data.icpMatchingPrompt,
                    contactObjective: data.contactObjective,
                  });
                }}
              />
            )}
          </Stepper.Step>
          <Stepper.Step
            label='Prioritize'
            description='Prospect pulsing'
            color={isStepThreeComplete ? undefined : 'red'}
            completedIcon={isStepThreeComplete ? undefined : <IconX size="1.1rem" />}
          >
            {step === 2 && <StepThree persona={persona} />}
          </Stepper.Step>
          <Stepper.Step
            label='LinkedIn Setup'
            description='Create CTAs'
            color={isStepFourComplete ? undefined : 'red'}
            completedIcon={isStepFourComplete ? undefined : <IconX size="1.1rem" />}
          >
            {step === 3 && <StepFour persona={persona} personas={innerProps.personas} />}
          </Stepper.Step>
          <Stepper.Step
            label='Email Setup'
            description='Email descriptions'
            color={isStepFiveComplete ? undefined : 'red'}
            completedIcon={isStepFiveComplete ? undefined : <IconX size="1.1rem" />}
          >
            {step === 4 && <StepFive onChange={(data) => {}} />}
          </Stepper.Step>

          <Stepper.Completed>
            <>
            Complete!
            </>
          </Stepper.Completed>
        </Stepper>
      </Container>

      <Container>
        <Group position='center' mt='xl'>
          {
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
              {step === 5 ? (
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
          }
        </Group>
      </Container>
    </Paper>
  );
}
