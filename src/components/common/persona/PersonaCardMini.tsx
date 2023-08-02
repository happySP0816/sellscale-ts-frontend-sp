import React from 'react';
import {
  Button,
  Avatar,
  Title,
  Text,
  Stack,
  Group,
  Progress,
  MantineTheme,
  Switch,
  useMantineTheme,
  Container,
  Paper,
  ActionIcon,
  Collapse,
  Flex,
  Tabs,
  Center,
  Loader,
  Box,
  Divider,
  TabsValue,
  Badge,
} from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconAddressBook,
  IconAnalyze,
  IconArrowsSplit,
  IconBrain,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconFileUpload,
  IconFilter,
  IconHistory,
  IconPower,
  IconPresentationAnalytics,
  IconRefresh,
  IconTool,
  IconTools,
  IconUpload,
  IconX,
} from '@tabler/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Archetype, PersonaOverview } from 'src';
import { uploadDrawerOpenState, detailsDrawerOpenState, currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { useQueryClient } from '@tanstack/react-query';
import FlexSeparate from '@common/library/FlexSeparate';
import { prospectUploadDrawerIdState, prospectUploadDrawerOpenState } from '@atoms/uploadAtoms';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { API_URL, SCREEN_SIZES } from '@constants/data';
import { useEffect, useState } from 'react';
import ProspectTable_old from '@common/pipeline/ProspectTable_old';
import { prospectSelectorTypeState } from '@atoms/prospectAtoms';
import Pulse from './Pulse';
import PersonaTools from './PersonaTools';
import PersonaAnalyze from './PersonaAnalyze';
import PersonaSplit from './PersonaSplit';
import PersonaBrain from './PersonaBrain';
import PersonaFilters from './PersonaFilters';
import PersonaLiSetup from './PersonaLiSetup';
import PersonaEmailSetup from './PersonaEmailSetup';
import PersonaUploadDrawer from '@drawers/PersonaUploadDrawer';

async function togglePersona(archetype_id: number, userToken: string) {
  const response = await fetch(`${API_URL}/client/archetype/toggle_active`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_archetype_id: archetype_id,
    }),
  });
  return response;
}

export default function PersonaCardMini(props: {
  personaOverview: PersonaOverview;
  refetch: () => void;
  unassignedPersona: boolean;
  allPersonas: PersonaOverview[];
  onClick: () => void;
}) {
  const theme = useMantineTheme();
  const mdScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.MD})`);
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();

  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(uploadDrawerOpenState);
  const [detailsDrawerOpened, setDetailsDrawerOpened] = useRecoilState(detailsDrawerOpenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [opened, { open, close }] = useDisclosure(true);
  const [selectorType, setSelectorType] = useRecoilState(prospectSelectorTypeState);

  const [tabValue, setTabValue] = useState<TabsValue>(props.unassignedPersona ? 'analyze' : 'contacts');

  useEffect(() => {
    if (true) {
      open();
    } else {
      close();
    }
  }, [currentProject]);

  // Temp Fix: Make sure the prospect table selector is set to all when the persona is opened - to prevent ProspectTable bug
  useEffect(() => {
    setSelectorType('all');
  }, [opened]);

  const isUploading =
    props.personaOverview.uploads &&
    props.personaOverview.uploads.length > 0 &&
    props.personaOverview.uploads[0].stats.in_progress > 0;
  const [prospectUploadDrawerOpened, setProspectUploadDrawerOpened] = useRecoilState(prospectUploadDrawerOpenState);
  const [prospectUploadDrawerId, setProspectUploadDrawerId] = useRecoilState(prospectUploadDrawerIdState);

  const activeBackgroundSX = (theme: MantineTheme) => ({
    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
    borderRadius: '8px',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
  });

  const WARNING_PERCENTAGE = 25;
  const getStatusUsedPercentage = () => {

    let unusedVal = props.personaOverview.num_unused_li_prospects

    let m = 100 / props.personaOverview.num_prospects;
    let percentData = [];
    const label = `${Math.round(unusedVal * m)}%, ${unusedVal} prospects left`;
    if (unusedVal * m > 0) {
      percentData.push({
        value: unusedVal * m,
        color:
          unusedVal * m < WARNING_PERCENTAGE
            ? 'red.9'
            : unusedVal * m < WARNING_PERCENTAGE * 2
              ? 'orange.9'
              : unusedVal * m < WARNING_PERCENTAGE * 3
                ? 'yellow.9'
                : 'teal.9',
        label: label,
        tooltip: label,
      });
    }
    return percentData;
  };

  const openUploadHistory = () => {
    setProspectUploadDrawerId(props.personaOverview.uploads && props.personaOverview.uploads[0].id);
    setProspectUploadDrawerOpened(true);
  };

  const openUploadProspects = () => {
    setUploadDrawerOpened(true);
  };

  return (
    <Paper p='xs' my={20} radius='md' sx={{
      cursor: 'pointer',
      backgroundColor: theme.fn.lighten(
        theme.fn.variant({ variant: "filled", color: "dark" }).background!,
        0.1
      ),
      position: 'relative',
    }}>
      <Box onClick={props.onClick}>
        <Flex align='center' justify='center'>
          <Group>
            <Badge
              size="xs"
              variant="outline"
              color={props.personaOverview.active ? 'teal' : 'red'}
              sx={{
                position: 'absolute',
                top: 10,
                left: 10,
                fontSize: 6,
              }}
            >{props.personaOverview.active ? 'Active' : 'Inactive'}</Badge>
            <Text fz={17} fw={400} c='gray.0'>
              {props.personaOverview.name}
            </Text>
          </Group>
        </Flex>
        {false ? (
          <Loader variant='dots' color='green' />
        ) : (
          <Progress mt={10} size={17} sections={getStatusUsedPercentage()} animate={isUploading} opacity={0.8} styles={{
            root: {
              backgroundColor: theme.fn.lighten(
                theme.fn.variant({ variant: "filled", color: "dark" }).background!,
                0.15
              ),
            }
          }} />
        )}
      </Box>

      {mdScreenOrLess ? (
        <ActionIcon color='teal' radius='xl' onClick={openUploadProspects}>
          <IconUpload size={14} />
        </ActionIcon>
      ) : (
        <Button
          variant='outline'
          color='teal'
          mt='md'
          w='100%'
          radius='md'
          rightIcon={<IconUpload size={14} />}
          onClick={openUploadProspects}
          sx={{
            '&:hover': {
              backgroundColor: 'initial'
            },
          }}
        >
          Upload More Prospects
        </Button>
      )}
      <PersonaUploadDrawer personaOverviews={currentProject ? [currentProject] : []} afterUpload={() => { }} />
    </Paper>
  );
}
