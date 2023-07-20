import TextWithNewline from '@common/library/TextWithNewlines';
import { HoverCard, Text, Avatar, Flex, ActionIcon, Badge, useMantineTheme, List, Tooltip } from '@mantine/core';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import { valueToColor } from '@utils/general';
import { useEffect, useState } from 'react';


export default function AutoBumpFrameworkInfo(props: {
  bump_title: string;
  bump_description: string;
  bump_length: string;
  account_research_points: string[];
  bump_number_sent?: number;
  bump_number_converted?: number;
}) {
  const theme = useMantineTheme();
  const [bumpConversionRate, setBumpConversionRate] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (props.bump_number_sent && props.bump_number_converted) {
      setBumpConversionRate(props.bump_number_converted / props.bump_number_sent * 100)
    }
  }, [props.bump_number_sent, props.bump_number_converted])

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
        <HoverCard.Dropdown miw='500px'>
          <Flex justify='space-between'>
            <Flex>
              <Avatar radius='xl' color='blue' size='sm'>
                <IconInfoCircleFilled size='1.9rem' />
              </Avatar>
              <Flex direction='column' ml='sm'>
                <Text size='sm' weight={700} sx={{ lineHeight: 1 }}>
                  Automatic Generated Response
                </Text>
                <Text color='dimmed' size='xs' sx={{ lineHeight: 1 }}>
                  These data points were chosen by AI 🤖
                </Text>
              </Flex>
            </Flex>
            <Tooltip
              label={bumpConversionRate ? `${bumpConversionRate.toFixed(2)}% of prospects converted` : 'No conversion data available, yet.'}
            >
            <Badge>
              {(bumpConversionRate && bumpConversionRate.toFixed(2)) || "UNKOWN "}%
            </Badge>
            </Tooltip>
          </Flex>

          <Text size='sm' mt='md'>
            <span style={{ fontWeight: 550 }}>Framework:</span> {props.bump_title}
          </Text>
          <TextWithNewline style={{ fontSize: '14px' }} breakheight='10px'>
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
