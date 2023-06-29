import TextWithNewline from '@common/library/TextWithNewlines';
import { HoverCard, Text, Avatar, Group, Stack, Anchor, ActionIcon, Badge, useMantineTheme, List } from '@mantine/core';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import { valueToColor } from '@utils/general';

export default function AutoBumpFrameworkInfo(props: {
  bump_title: string;
  bump_description: string;
  bump_length: string;
  account_research_points: string[];
}) {
  const theme = useMantineTheme();

  return (
    <div
      style={{
        position: 'absolute',
        top: -12,
        left: -12,
      }}
    >
      <HoverCard withinPortal width={320} shadow='md' withArrow openDelay={200} closeDelay={400}>
        <HoverCard.Target>
          <ActionIcon radius='xl' color='blue' size='lg'>
            <IconInfoCircleFilled size='1.625rem' />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Group>
            <Avatar radius='xl' color='blue' size='md'>
              <IconInfoCircleFilled size='1.9rem' />
            </Avatar>
            <Stack spacing={5}>
              <Text size='sm' weight={700} sx={{ lineHeight: 1 }}>
                Automatic Generated Response
              </Text>
              <Text color='dimmed' size='xs' sx={{ lineHeight: 1 }}>
                These data points where chosen by AI 🤖
              </Text>
            </Stack>
          </Group>

          <Text size='sm' mt='md'>
            <span style={{ fontWeight: 550 }}>Framework:</span> {props.bump_title}
          </Text>
          <TextWithNewline style={{fontSize: '14px'}} breakheight='10px'>
            {props.bump_description}
          </TextWithNewline>
          <Badge color={valueToColor(theme, props.bump_length)} size='xs' variant='filled'>
            {props.bump_length}
          </Badge>

          <Text size='sm' mt='md'>
            <span style={{ fontWeight: 550 }}>Account Research:</span>
          </Text>
          <List>
            {props.account_research_points.map((point, index) => (
              <List.Item key={index}><Text size='xs'>{point}</Text></List.Item>
            ))}
          </List>
        </HoverCard.Dropdown>
      </HoverCard>
    </div>
  );
}
