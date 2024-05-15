import { currentProjectState } from '@atoms/personaAtoms';
import { prospectDrawerOpenState, prospectDrawerIdState } from '@atoms/prospectAtoms';
import { userDataState } from '@atoms/userAtoms';
import PageFrame from '@common/PageFrame';
import AllContactsSection from '@common/home/AllContactsSection';
import SequenceBuilderV3 from '@common/internal_tools/sequence_builder_v3/SequenceBuilderV3';
import {
  Box,
  Card,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Image,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { setPageTitle } from '@utils/documentChange';
import { useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import AccessDenyGuy from '@assets/images/access-deny-guy.png';
import SequenceStreaming from '@common/internal_tools/sequence_builder_v3/SequenceStreaming';

// Add yours tools here
const TOOL_MAP: Record<string, { title: string; description: string; component: React.ReactNode }> =
  {
    'sequence-builder-v3': {
      title: 'Sequence Builder',
      description: 'Automatically creates sequences for campaigns.',
      component: <SequenceBuilderV3 />,
    },
    'sequence-stream': {
      title: 'Sequence Stream',
      description: 'Automatically streams sequences pieces for campaigns.',
      component: <SequenceStreaming />,
    },
  };

export default function InternalToolsPage() {
  setPageTitle('Internal Tools');

  const { routedToolId } = useLoaderData() as {
    routedToolId: string;
  };

  const userData = useRecoilValue(userDataState);
  if (userData.client.id !== 1) {
    return (
      <PageFrame>
        <Paper h={'90vh'} p='xl' withBorder style={{ backgroundColor: '#f1f3f5' }}>
          <Card p='xl' style={{ backgroundColor: '#f8f9fa' }}>
            <div>
              <Image maw={240} mx='auto' radius='md' src={AccessDenyGuy} alt='No Access' />
            </div>
            <Text color='gray' fs='xl' pt={15} ta='center'>
              You do not have access to this page.
            </Text>
          </Card>
        </Paper>
      </PageFrame>
    );
  }

  // Route directly to the tool
  if (routedToolId) {
    return (
      <Box>
        {TOOL_MAP[routedToolId]?.component ?? (
          <Text color='gray' fs='italic' size='sm'>
            Tool not found
          </Text>
        )}
      </Box>
    );
  }

  return (
    <PageFrame>
      <Paper h={'90vh'} p='xl' withBorder style={{ backgroundColor: '#f1f3f5' }}>
        <SimpleGrid cols={4}>
          {Object.entries(TOOL_MAP).map(([toolId, { title, description }]) => (
            <ToolContainer
              key={toolId}
              toolId={toolId}
              title={title}
              description={description}
              component={TOOL_MAP[toolId].component}
            />
          ))}
        </SimpleGrid>
      </Paper>
    </PageFrame>
  );
}

function ToolContainer(props: {
  toolId: string;
  title: string;
  description: string;
  component: React.ReactNode;
}) {
  const theme = useMantineTheme();
  const { hovered, ref } = useHover<HTMLAnchorElement>();

  return (
    <UnstyledButton
      ref={ref}
      p='sm'
      style={{
        borderRadius: theme.radius.md,
        backgroundColor: '#f8f9fa',
        transition: 'box-shadow 150ms ease, transform 100ms ease;',
        boxShadow: hovered ? theme.shadows.md : undefined,
        transform: hovered ? 'scale(1.02)' : undefined,
      }}
      component='a'
      href={`/internal-tools/${props.toolId}`}
    >
      <Stack mih={150}>
        <Title order={5}>{props.title}</Title>
        <Text fz='sm'>{props.description}</Text>
      </Stack>
    </UnstyledButton>
  );
}
