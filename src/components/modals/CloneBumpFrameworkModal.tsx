import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";

import { Modal, Text, Flex, Select, Button, useMantineTheme, Card, Loader, Badge, Tooltip } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons";
import { valueToColor } from "@utils/general";
import { cloneBumpFramework } from "@utils/requests/cloneBumpFramework";
import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import { forwardRef, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { BumpFramework } from "src";

interface BumpItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  persona: string;
  acceptance: string;
  isSamePersona: boolean;
}

const SelectBumpItem = forwardRef<HTMLDivElement, BumpItemProps>(
  ({ label, persona, acceptance, isSamePersona, ...others }, ref) => (
    <div ref={ref} {...others}>
      <Flex justify={'space-between'}>
        <Flex>
          {label}
          <Badge
            ml='sm'
            size='xs'
            color={valueToColor(useMantineTheme(), persona)}
          >
            {persona}
          </Badge>
          {
            isSamePersona &&
            <Tooltip label='This framework is from your current archetype and would be a duplicate.' withinPortal withArrow>
              <Flex ml='sm'>
                <IconAlertTriangle size='.8rem' />
              </Flex>
            </Tooltip>
          }
        </Flex>
        <Flex>
          {acceptance}
        </Flex>
      </Flex>

    </div>
  )
)


interface CloneBumpFramework extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  archetypeID: number;
  status: string;
  showStatus?: boolean;
  bumpedCount?: number | null;
}

export default function CloneBumpFrameworkModal(props: CloneBumpFramework) {
  const [userToken] = useRecoilState(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [loading, setLoading] = useState(false);

  const [colloquialStatus, setColloquialStatus] = useState<string | null>(null);
  const [selectedBumpFramework, setSelectedBumpFramework] = useState<BumpFramework | undefined>(undefined);
  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);

  const triggerGetBumpFrameworkForSelect = async () => {
    setLoading(true);

    const result = await getBumpFrameworks(
      userToken,
      [props.status],
      [],
      [],
      [],
      false,
      true,
      props.bumpedCount as number,
    )

    if (result.status === 'success') {
      setBumpFrameworks(result.data.bump_frameworks);
    }

    setLoading(false);
  }

  const triggerCloneBumpFramework = async () => {
    setLoading(true);

    if (!selectedBumpFramework) {
      showNotification({
        title: "Error",
        message: "Please select a framework to clone.",
        color: "red",
        autoClose: 3000,
        icon: <IconX />,
      });
      setLoading(false);
      return;
    }

    const result = await cloneBumpFramework(userToken, props.archetypeID, selectedBumpFramework.id)
    if (result.status === 'success') {
      showNotification({
        title: "Success",
        message: "Framework cloned successfully.",
        color: "green",
        autoClose: 3000,
        icon: <IconCheck />,
      });
      props.backFunction();
      props.closeModal();
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
        autoClose: 3000,
        icon: <IconX />,
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    triggerGetBumpFrameworkForSelect();

    if (props.status === 'ACCEPTED') {
      setColloquialStatus('First / Initial Followup')
    } else if (props.status === 'BUMPED' && props.bumpedCount === 1) {
      setColloquialStatus('Second Followup')
    } else if (props.status === 'BUMPED' && props.bumpedCount === 2) {
      setColloquialStatus('Third Followup')
    } else if (props.status === 'BUMPED' && props.bumpedCount === 3) {
      setColloquialStatus('Fourth Followup')
    } else {
      setColloquialStatus(null)
    }
  }, []);

  return (
    <Modal
      opened={props.modalOpened}
      onClose={props.closeModal}
      title="Clone an existing Framework"
      size='lg'
    >
      {
        colloquialStatus ? (
          <>
            <Text>
              We have found the following frameworks across all your other personas in the <span style={{ fontWeight: 600 }}>{colloquialStatus}</span> step.
              Please select the framework you would like to clone.
            </Text>

            {/* SELECT */}
            <Select
              mt='md'
              itemComponent={SelectBumpItem}
              data={
                bumpFrameworks?.map((bumpFramework) => {
                  let acceptance = 0;
                  if (bumpFramework.etl_num_times_used && bumpFramework.etl_num_times_converted) {
                    acceptance = Math.round((bumpFramework.etl_num_times_converted / bumpFramework.etl_num_times_used) * 100);
                  }
                  return {
                    value: bumpFramework.id + '',
                    label: bumpFramework.title,
                    persona: bumpFramework.client_archetype_archetype,
                    acceptance: acceptance + '%',
                    isSamePersona: bumpFramework.client_archetype_archetype === currentProject?.name,
                  }
                })
              }
              value={selectedBumpFramework?.id.toString() || ''}
              onChange={(value) => {
                setSelectedBumpFramework(bumpFrameworks.find((bumpFramework) => bumpFramework.id === parseInt(value as string)));
              }}
              placeholder='Select a framework to clone'
              withinPortal
              searchable
              disabled={loading || bumpFrameworks.length === 0}
            />

            {/* PREVIEW */}
            {selectedBumpFramework !== undefined ?
              (
                <Card
                  mt='md'
                  withBorder
                >
                  <Text>
                    <span style={{ fontWeight: 600 }}>Title:</span> {selectedBumpFramework.title}
                  </Text>
                  <Text mt='sm' fw={600}>Description:</Text>
                  <Text>{selectedBumpFramework.description}</Text>
                  <Text mt='sm'>
                    <span style={{ fontWeight: 600 }}>Length:</span> {selectedBumpFramework.bump_length} ({
                      selectedBumpFramework.bump_length === 'SHORT' ? '1-2 sentences' : selectedBumpFramework.bump_length === 'MEDIUM' ? '3-4 sentences' : '2 paragraphs'
                    })
                  </Text>
                  <Text mt='sm'><span style={{ fontWeight: 600 }}>Delay:</span> {selectedBumpFramework.bump_delay_days} day wait</Text>
                  {
                    selectedBumpFramework.client_archetype_archetype === currentProject?.name &&
                    <Flex align='center' mt='sm'>
                      <IconAlertTriangle color='red' size='1.2rem'/> 
                      <Text ml='4px' color='red' fw='bold'>
                        This framework is from the same persona as the current project.
                      </Text>
                    </Flex>
                  }
                </Card>
              ) : (
                <Card
                  mt='md'
                  withBorder
                >
                  <Flex align='center' justify='center'>
                    {
                      loading ? (
                        <Loader variant='dots' />
                      ) : (
                        bumpFrameworks.length === 0 ? (
                          <Text>No frameworks found for this step. Please create one.</Text>
                        ) : (
                          <Text>Please select a framework to preview.</Text>
                        )
                      )
                    }
                  </Flex>
                </Card>
              )
            }


            <Flex
              mt='md'
              justify='right'
            >
              <Button
                onClick={triggerCloneBumpFramework}
                disabled={selectedBumpFramework === undefined}
              >
                Clone
              </Button>
            </Flex>

          </>
        ) : (
          <Text>
            Something has gone wrong, please try again or contact support.
          </Text>
        )
      }

    </Modal>
  )
}