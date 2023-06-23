import GeneratedByAI from '@common/library/GeneratedByAI';
import { Badge, useMantineTheme, Popover, Divider, Text, Container, MantineColor } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconCrown, IconDots, IconHandGrab, IconLoader, IconMoodSmile, IconQuestionMark, IconThumbDown, IconX } from '@tabler/icons';
import { IconCircle4Filled, IconCircle3Filled, IconCircle2Filled, IconCircle1Filled, IconStarFilled, IconCircle5Filled, IconCircle6Filled, IconCircle7Filled, IconCircle9Filled, IconCircle8Filled, IconHelpCircleFilled } from '@tabler/icons-react';
import { valueToColor } from '@utils/general';

type PropsType = {
  icp_fit_score: number;
  icp_fit_reason: string;
  archetype: string;
};

const icpFitScoreMap = new Map<string, string>([
  ['-3', 'QUEUED'],
  ['-2', 'CALCULATING'],
  ['-1', 'ERROR'],
  ['0', 'VERY LOW'],
  ['1', 'LOW'],
  ['2', 'MEDIUM'],
  ['3', 'HIGH'],
  ['4', 'VERY HIGH'],
]);
const icpFitColorMap = new Map<string, MantineColor>([
  ['-3', 'grape'],
  ['-2', 'grape'],
  ['-1', 'gray'],
  ['0', 'red'],
  ['1', 'orange'],
  ['2', 'yellow'],
  ['3', 'green'],
  ['4', 'blue'],
]);

export function icpFitToLabel(icp_fit: number) {
  return icpFitScoreMap.get(icp_fit+'') || 'N/A';
}

export function icpFitToColor(icp_fit: number) {
  return icpFitColorMap.get(icp_fit+'') || 'gray';
}

export function icpFitToIcon(icp_fit: number, size: string = '0.7rem') {
  switch (icp_fit) {
    case -5:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle9Filled size={size} />
        </Text>
      );
    case -4:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle8Filled size={size} />
        </Text>
      );
    case -3:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle7Filled size={size} />
        </Text>
      );
    case -2:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle6Filled size={size} />
        </Text>
      );
    case -1:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle5Filled size={size} />
        </Text>
      );
    case 0:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle4Filled size={size} />
        </Text>
      );
    case 1:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle3Filled size={size} />
        </Text>
      );
    case 2:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle2Filled size={size} />
        </Text>
      );
    case 3:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconCircle1Filled size={size} />
        </Text>
      );
    case 4:
      return (
        <Text color={icpFitColorMap.get(icp_fit+'')}>
          <IconStarFilled size={size} />
        </Text>
      );
    default:
      return (
        <Text color='black'>
          <IconDots size={size} />
        </Text>
      );
  }
}

export default function ICPFitPill(props: PropsType) {
  const { hovered, ref } = useHover();

  return (
    <Popover position='right' withArrow shadow='md' opened={hovered}>
      <Popover.Target>
        <Badge color={icpFitToColor(props.icp_fit_score)} ref={ref}>
          {icpFitToLabel(props.icp_fit_score)}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown>
        <ICPFitContents {...props} />
      </Popover.Dropdown>
    </Popover>
  );
}

export function ICPFitContents(props: PropsType) {

  const theme = useMantineTheme();

  return (
    <Container w={400}>
      <Text size='md' weight='800'>
        Prospect Analysis
      </Text>
      <Divider mb='xs' mt='xs' />
      {props.archetype && (
        <Text size='sm' weight='700'>
          Persona:
        </Text>
      )}
      {props.archetype && (
        <Badge
          p='xs'
          variant='outline'
          radius='sm'
          size='xs'
          color={valueToColor(theme, props.archetype || 'Persona Unassigned')}
        >
          {props.archetype || 'Persona Unassigned'}
        </Badge>
      )}

      <Text size='sm' weight='700' mt='md'>
        ICP Fit Score:
      </Text>
      <Badge color={icpFitToColor(props.icp_fit_score)}>
        {icpFitToLabel(props.icp_fit_score)}
      </Badge>

      <Text size='sm' weight='700' mt='md'>
        ICP Fit Score Explanation:
      </Text>
      <Text size='sm' italic>
        {props.icp_fit_reason}
      </Text>

      <GeneratedByAI />
    </Container>
  );
}
