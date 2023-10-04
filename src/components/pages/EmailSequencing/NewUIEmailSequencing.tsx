import { SCREEN_SIZES } from "@constants/data";
import {
  Flex,
  Box,
  ScrollArea,
  Group,
  NumberInput,
  Button,
  Loader,
  Text,
  Drawer,
  Divider,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import EmailSequenceStepModal from "@modals/EmailSequenceStepModal";
import { IconPlus } from "@tabler/icons";
import { createEmailSequenceStep } from "@utils/requests/emailSequencing";
import React, { FC, MutableRefObject, ReactNode } from "react";
import DetailEmailSequencing from "./DetailEmailSequencing";
import EmailSequenceStepCard from "./EmailSequenceStepCard";
import { EmailSequenceStep, MsgResponse, SubjectLineTemplate } from "src";
type EmailSequenceStepBuckets = {
  PROSPECTED: {
    total: number;
    templates: EmailSequenceStep[];
  };
  ACCEPTED: {
    total: number;
    templates: EmailSequenceStep[];
  };
  BUMPED: Record<
    string,
    {
      total: number;
      templates: EmailSequenceStep[];
    }
  >;
  ACTIVE_CONVO: {
    total: number;
    templates: EmailSequenceStep[];
  };
};

const Sidebar: React.FC<{
  userToken: string;
  archetypeID: number;
  templateBuckets: MutableRefObject<EmailSequenceStepBuckets>;
  setTemplates: (templates: EmailSequenceStep[]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  addNewSequenceStepOpened: boolean;
  loading: boolean;
  dataChannels?: MsgResponse | undefined;
  triggerGetEmailSequenceSteps: () => void;
  closeSequenceStep: () => void;
  openSequenceStep: () => void;
}> = ({
  userToken,
  archetypeID,
  templateBuckets,
  setTemplates,
  activeTab,
  setActiveTab,

  addNewSequenceStepOpened,
  loading,
  dataChannels,
  triggerGetEmailSequenceSteps,
  closeSequenceStep,
  openSequenceStep,
}) => (
    <Flex direction="column" mt="md">
      <EmailSequenceStepCard
        title="First Email"
        afterCreate={triggerGetEmailSequenceSteps}
        afterEdit={triggerGetEmailSequenceSteps}
        content="Cold outreach sent to the prospect"
        active={activeTab == "PROSPECTED"}
        templateTitle="Initial Email"
        onClick={() => {
          setTemplates(templateBuckets?.current?.PROSPECTED.templates)
          setActiveTab("PROSPECTED")
        }}
      />

      <Divider
        label="After opening email"
        labelPosition="center"
        mt="xl"
        mb="xl"
      />

      {!loading ? (
        <ScrollArea w="100%">
          <Flex direction="column" gap={"0.5rem"}>
            {/* Accepted */}
            <EmailSequenceStepCard
              active={activeTab == "ACCEPTED"}
              sequenceBucket={templateBuckets?.current?.ACCEPTED}
              title={"Second Email"}
              templateTitle={"Prospects who have not received any followup."}
              dataChannels={dataChannels}
              afterCreate={triggerGetEmailSequenceSteps}
              afterEdit={triggerGetEmailSequenceSteps}
              onClick={() => {
                setTemplates(templateBuckets?.current?.ACCEPTED.templates)
                setActiveTab("ACCEPTED")
              }}
              footer={
                <Group spacing={2}>
                  <Text fz={14} fw={500}>
                    wait for
                  </Text>
                  <NumberInput
                    placeholder="# Days"
                    variant="filled"
                    hideControls
                    sx={{
                      border: "solid 1px #777; border-radius: 4px;",
                    }}
                    m={3}
                    min={2}
                    max={99}
                    size="xs"
                    onChange={async (value) => { }}
                  />
                  <Text fz={14} fw={500}>
                    days, then:
                  </Text>
                </Group>
              }
            />

            {/* Bumped (map) */}
            {Object.keys(templateBuckets?.current?.BUMPED).map((bumpCount) => {
              const bumpCountInt = parseInt(bumpCount);
              const sequenceBucket =
                templateBuckets?.current?.BUMPED[bumpCountInt];

              const bumpToFollowupMap: Record<string, string> = {
                "1": "Third",
                "2": "Fourth",
                "3": "Fifth",
                "4": "Sixth",
                "5": "Seventh",
                "6": "Eighth",
                "7": "Ninth",
                "8": "Tenth",
              };
              const followupString = bumpToFollowupMap[bumpCount];
              if (followupString == undefined) {
                return;
              }

              if (bumpCount === "0" || !sequenceBucket) {
                return;
              }
              return (
                <Flex mt="md" w="100%">
                  <EmailSequenceStepCard
                    onClick={() => {
                      setActiveTab("BUMPED-" + bumpCount)
                      setTemplates(sequenceBucket.templates)
                    }}
                    active={false}
                    sequenceBucket={sequenceBucket}
                    title={`${followupString} Email`}
                    templateTitle={`Prospects who have not responded to ${bumpCount} followups.`}
                    dataChannels={dataChannels}
                    afterCreate={triggerGetEmailSequenceSteps}
                    afterEdit={triggerGetEmailSequenceSteps}
                    bumpedCount={bumpCountInt}
                    footer={
                      <Group spacing={2}>
                        <Text fz={14} fw={500}>
                          wait for
                        </Text>
                        <NumberInput
                          placeholder="# Days"
                          variant="filled"
                          hideControls
                          sx={{
                            border: "solid 1px #777; border-radius: 4px;",
                          }}
                          m={3}
                          min={2}
                          max={99}
                          size="xs"
                          onChange={async (value) => { }}
                        />
                        <Text fz={14} fw={500}>
                          days, then:
                        </Text>
                      </Group>
                    }
                  />
                </Flex>
              );
            })}

            {/* Add another to sequence */}
            <Flex justify="center">
              <Button
                radius="md"
                mt="md"
                size="lg"
                w="100%"
                onClick={openSequenceStep}
                disabled={
                  Object.keys(templateBuckets?.current?.BUMPED).length > 10
                }
                leftIcon={<IconPlus />}
              >
                Add Step
              </Button>
              <EmailSequenceStepModal
                modalOpened={addNewSequenceStepOpened}
                openModal={openSequenceStep}
                closeModal={closeSequenceStep}
                type={"CREATE"}
                backFunction={triggerGetEmailSequenceSteps}
                dataChannels={dataChannels}
                status={"BUMPED"}
                showStatus={false}
                archetypeID={archetypeID}
                bumpedCount={
                  Object.keys(templateBuckets?.current?.BUMPED).length + 1
                }
                onFinish={async (
                  title,
                  sequence,
                  isDefault,
                  status,
                  substatus
                ) => {
                  const result = await createEmailSequenceStep(
                    userToken,
                    archetypeID,
                    status ?? "",
                    title,
                    sequence,
                    Object.keys(templateBuckets?.current?.BUMPED).length + 1,
                    isDefault,
                    substatus
                  );
                  return result.status === "success";
                }}
              />
              {Object.keys(templateBuckets?.current?.BUMPED).length > 10 && (
                <Text color="red" mt="md" mb="md">
                  You have reached the maximum number of sequence steps.
                </Text>
              )}
            </Flex>
          </Flex>
        </ScrollArea>
      ) : (
        <Flex justify="center">
          <Loader />
        </Flex>
      )}
    </Flex>
  );

const NewUIEmailSequencing: FC<{
  userToken: string;
  archetypeID: number | null;
  templateBuckets: MutableRefObject<EmailSequenceStepBuckets>;
  subjectLines: SubjectLineTemplate[];

  loading: boolean;
  addNewSequenceStepOpened: boolean;
  dataChannels?: MsgResponse | undefined;
  triggerGetEmailSequenceSteps: () => void;
  closeSequenceStep: () => void;
  openSequenceStep: () => void;

}> = ({
  userToken,
  archetypeID,
  templateBuckets,
  subjectLines,

  loading,
  addNewSequenceStepOpened,
  dataChannels,
  triggerGetEmailSequenceSteps,
  openSequenceStep,
  closeSequenceStep,
}) => {
    const [opened, { open, close, toggle }] = useDisclosure(false);
    const lgScreenOrLess = useMediaQuery(
      `(max-width: ${SCREEN_SIZES.LG})`,
      false,
      { getInitialValueInEffect: true }
    );

    const [selectedTemplates, setSelectedTemplates] = React.useState<EmailSequenceStep[]>(templateBuckets?.current?.PROSPECTED.templates);
    const [activeTab, setActiveTab] = React.useState("PROSPECTED");

    console.log("templateBuckets", templateBuckets)

    return (
      <Flex gap="1rem">
        {lgScreenOrLess ? (
          <Drawer
            opened={opened}
            onClose={close}
            withCloseButton={false}
            w={"35vw"}
            h={"100vh"}
            overlayProps={{ blur: 4 }}
          >
            <Sidebar
              userToken={userToken}
              archetypeID={archetypeID as number}
              setTemplates={(templates: EmailSequenceStep[]) => setSelectedTemplates(templates)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}

              addNewSequenceStepOpened={addNewSequenceStepOpened}
              closeSequenceStep={closeSequenceStep}
              dataChannels={dataChannels}
              loading={loading}
              openSequenceStep={openSequenceStep}
              templateBuckets={templateBuckets}
              triggerGetEmailSequenceSteps={triggerGetEmailSequenceSteps}
            />
          </Drawer>
        ) : (
          <Box w={"30%"}>
            <Sidebar
              userToken={userToken}
              archetypeID={archetypeID as number}
              setTemplates={(templates: EmailSequenceStep[]) => setSelectedTemplates(templates)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}

              addNewSequenceStepOpened={addNewSequenceStepOpened}
              closeSequenceStep={closeSequenceStep}
              dataChannels={dataChannels}
              loading={loading}
              openSequenceStep={openSequenceStep}
              templateBuckets={templateBuckets}
              triggerGetEmailSequenceSteps={triggerGetEmailSequenceSteps}
            />
          </Box>
        )}

        <Box w={lgScreenOrLess ? "100%" : "70%"}>
          <DetailEmailSequencing
            toggleDrawer={toggle}
            currentTab={activeTab}
            templates={selectedTemplates}
            subjectLines={subjectLines}
          />
          <Flex mt={"md"} gap={"1rem"}>
            <Button
              leftIcon={<IconPlus />}
              //  onClick={openSequenceStep}
              radius={"md"}
            >
              Create New Template
            </Button>

            <Tooltip label={"Coming Soon!"} withArrow withinPortal>
              <Button variant="default" radius={"md"} disabled>
                Browser Templates
              </Button>
            </Tooltip>
          </Flex>
        </Box>
      </Flex>
    );
  };

export default NewUIEmailSequencing;
