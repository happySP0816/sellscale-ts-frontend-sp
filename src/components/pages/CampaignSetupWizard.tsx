import ComingSoonCard from "@common/library/ComingSoonCard";
import {
  Button,
  Group,
  Stepper,
  Card,
  Checkbox,
  Title,
  Divider,
  Flex,
  TextInput,
  Text,
  Textarea,
} from "@mantine/core";
import { Input } from "postcss";
import React, { useState } from "react";
import { PersonaOverview } from "src";
import SegmentV2 from "./SegmentV2/SegmentV2";
import SequenceBuilderV3ClientFacing from "@common/internal_tools/sequence_builder_v3/SequenceBuilderV3ClientFacing";
import { CampaignDetail } from "./CampaignDetail";
import CampaignChannelPage from "./CampaignChannelPage";
import { IconCheck } from "@tabler/icons";

type PropsType = {
  campaign?: PersonaOverview | null;
};

type StepProps = {
  campaign?: PersonaOverview | null;
  setLinkedin: (value: boolean) => void;
  setEmail: (value: boolean) => void;
  linkedin: boolean;
  email: boolean;
};

function CampaignDetailsStep(props: StepProps) {
  const { setLinkedin, setEmail, linkedin, email } = props;
  return (
    <Card w="400px" ml="auto" mr="auto" withBorder>
      <TextInput
        placeholder="Campaign Name"
        label="Campaign Name"
        mb="xs"
        value={props.campaign?.name}
      />
      <Textarea
        placeholder="Campaign Description"
        label="Who are you targeting?"
        mb="xs"
        rows={3}
        value={props.campaign?.icp_matching_prompt}
      />

      <Textarea
        placeholder="What do you want to say?"
        label="What do you want to say?"
        mb="xs"
        rows={3}
        value={props.campaign?.persona_contact_objective}
      />
      <Text fw="500" size="sm">
        Channels
      </Text>
      <Text color="gray" size="xs" mb="xs">
        Select the channels you want to use for this campaign
      </Text>
      <Flex direction="row" gap="md">
        <Checkbox
          label="LinkedIn"
          checked={linkedin}
          onChange={(event) => setLinkedin(event.currentTarget.checked)}
        />
        <Checkbox
          label="Email"
          checked={email}
          onChange={(event) => setEmail(event.currentTarget.checked)}
        />
      </Flex>
    </Card>
  );
}

function ContactSelectorStep(props: PropsType) {
  return <SegmentV2 />;
}

function LinkedinSetup(props: PropsType) {
  return <ComingSoonCard />;
}

function EmailSetup(props: PropsType) {
  return <ComingSoonCard />;
}

function ReviewLaunchStep(props: StepProps) {
  return (
    <CampaignChannelPage
      campaignId={props.campaign?.id}
      hideHeader
      hideEmail={!props.email}
      hideLinkedIn={!props.linkedin}
      hideAssets
    />
  );
}

function SequenceStep(props: PropsType) {
  return <ComingSoonCard />;
}

function StepWrapper(props: { children: React.ReactNode }) {
  return <Card mah="550px" sx={{ overflowY: "auto" }} p="md" {...props} />;
}

export default function CampaignSetupWizard(props: PropsType) {
  const [active, setActive] = useState(0);
  const [linkedinChannel, setLinkedinChannel] = useState(false);
  const [emailChannel, setEmailChannel] = useState(false);

  const maxSteps = 2 + (linkedinChannel ? 1 : 0) + (emailChannel ? 1 : 0);

  const nextStep = () =>
    setActive((current) => (current < maxSteps ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Card m="md" withBorder>
      <>
        <Title order={3} align="center" mb="md">
          Campaign Setup Wizard
        </Title>
        <Stepper
          size="xs"
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
        >
          <Stepper.Step label="Setup" description="Create an account">
            <StepWrapper>
              <CampaignDetailsStep
                setLinkedin={setLinkedinChannel}
                setEmail={setEmailChannel}
                linkedin={linkedinChannel}
                email={emailChannel}
                campaign={props.campaign}
              />
            </StepWrapper>
          </Stepper.Step>

          <Stepper.Step label="Contacts" description="Select contacts">
            <StepWrapper>
              <ContactSelectorStep />
            </StepWrapper>
          </Stepper.Step>

          {linkedinChannel && (
            <Stepper.Step label="LinkedIn" description="Setup LinkedIn">
              <StepWrapper>
                <SequenceBuilderV3ClientFacing
                  campaign={props.campaign}
                  sequenceType="LINKEDIN-TEMPLATE"
                  currentStep={active}
                />
              </StepWrapper>
            </Stepper.Step>
          )}

          {emailChannel && (
            <Stepper.Step label="Email" description="Setup Email">
              <StepWrapper>
                <SequenceBuilderV3ClientFacing
                  campaign={props.campaign}
                  sequenceType="EMAIL"
                  currentStep={active}
                />
              </StepWrapper>
            </Stepper.Step>
          )}

          {!linkedinChannel && !emailChannel && (
            <Stepper.Step label="Sequence" description="Setup sequence">
              <SequenceStep />
            </Stepper.Step>
          )}

          <Stepper.Step label="Review & Launch" description="Review campaign">
            <StepWrapper>
              <Card withBorder>
                <ReviewLaunchStep
                  campaign={props.campaign}
                  linkedin={linkedinChannel}
                  email={emailChannel}
                  setLinkedin={() => {}}
                  setEmail={() => {}}
                />
              </Card>
            </StepWrapper>
          </Stepper.Step>

          <Stepper.Completed>
            Completed, click back button to get to previous step
          </Stepper.Completed>
        </Stepper>

        <Divider />

        <Group mt="xl">
          <Button variant="default" onClick={prevStep}>
            Back
          </Button>
          {maxSteps >= active + 1 && (
            <Button
              onClick={nextStep}
              ml="auto"
              disabled={!linkedinChannel && !emailChannel}
            >
              Next step
            </Button>
          )}
          {maxSteps === active && (
            <Button
              onClick={nextStep}
              ml="auto"
              color="green"
              rightIcon={<IconCheck size="0.9rem"></IconCheck>}
            >
              Finish Setup
            </Button>
          )}
        </Group>
      </>
    </Card>
  );
}
