import { userTokenState } from '@atoms/userAtoms';
import TextWithNewline from '@common/library/TextWithNewlines';
import {
  createStyles,
  Text,
  Avatar,
  Group,
  TypographyStylesProvider,
  Paper,
  Badge,
  useMantineTheme,
  HoverCard,
  Stack,
  List,
  Flex,
  Tooltip,
} from '@mantine/core';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import { nameToInitials, valueToColor } from '@utils/general';
import { getSingleBumpFramework } from '@utils/requests/getBumpFrameworks';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { LinkedInMessage } from 'src';

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
  },

  body: {
    paddingLeft: 54,
    paddingTop: 5,
    fontSize: theme.fontSizes.sm,
  },

  content: {
    '& > p:last-child': {
      marginBottom: 0,
    },
  },
}));

interface CommentHtmlProps {
  postedAt: string;
  body: string;
  name: string;
  image: string;
  isLatest?: boolean;
  aiGenerated: boolean;
  bumpFrameworkId?: number;
  bumpFrameworkTitle?: string;
  bumpFrameworkDescription?: string;
  bumpFrameworkLength?: string;
  accountResearchPoints?: string[];
  cta?: string;
  badgeBFTitle?: boolean;
}

export function LinkedInConversationEntry({
  postedAt,
  body,
  name,
  image,
  isLatest,
  aiGenerated,
  bumpFrameworkId,
  bumpFrameworkTitle,
  bumpFrameworkDescription,
  bumpFrameworkLength,
  accountResearchPoints,
  cta,
  badgeBFTitle,
}: CommentHtmlProps) {
  const { classes } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const [bumpNumberConverted, setBumpNumberConverted] = useState<number | undefined>(undefined);
  const [bumpNumberUsed, setBumpNumberUsed] = useState<number | undefined>(undefined);

  const triggerGetSingleBumpFramework = async (id: number) => {
    const result = await getSingleBumpFramework(userToken, id);
    if (result) {
      console.log(result.data)
      setBumpNumberConverted(result.data.bump_framework.etl_num_times_converted);
      setBumpNumberUsed(result.data.bump_framework.etl_num_times_used);
    }
  }

  useEffect(() => {
    if (bumpFrameworkId) {
      triggerGetSingleBumpFramework(bumpFrameworkId);
    }
  }, [])

  return (
    <Paper withBorder radius='md' className={classes.comment} p='lg' mb='xs'>
      <Group sx={{ position: 'relative' }}>
        <Avatar src={image} radius='xl' alt={name} color={valueToColor(theme, name)}>
          {nameToInitials(name)}
        </Avatar>
        <div>
          <Text size='sm'>{name}</Text>
          <Text size='xs' color='dimmed'>
            {postedAt}
          </Text>
        </div>
        {isLatest && <Badge sx={{ position: 'absolute', top: 0, right: 0 }}>Latest Message</Badge>}
        {aiGenerated && (
          <AiMetaDataBadge
            location={{ position: 'absolute', top: 0, right: 0 }}
            direction='top'
            bumpFrameworkId={bumpFrameworkId || 0}
            bumpFrameworkTitle={bumpFrameworkTitle || ''}
            bumpFrameworkDescription={bumpFrameworkDescription || ''}
            bumpFrameworkLength={bumpFrameworkLength || ''}
            bumpNumberConverted={bumpNumberConverted}
            bumpNumberUsed={bumpNumberUsed}
            accountResearchPoints={accountResearchPoints || []}
            cta={cta || ''}
            badgeBFTitle={badgeBFTitle}
          />
        )}
      </Group>

      <TypographyStylesProvider className={classes.body}>
        <TextWithNewline className={classes.content}>{body}</TextWithNewline>
      </TypographyStylesProvider>
    </Paper>
  );
}

export function AiMetaDataBadge(props: {
  location: { position: 'relative' | 'absolute'; top?: number; bottom?: number; left?: number; right?: number };
  direction?: 'left' | 'right' | 'top' | 'bottom';
  bumpFrameworkId: number;
  bumpFrameworkTitle: string;
  bumpFrameworkDescription: string;
  bumpFrameworkLength: string;
  accountResearchPoints: string[];
  bumpNumberUsed?: number;
  bumpNumberConverted?: number;
  cta?: string;
  badgeBFTitle?: boolean;
}) {
  const theme = useMantineTheme();

  const [bumpConversionRate, setBumpConversionRate] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (props.bumpNumberUsed && props.bumpNumberConverted) {
      setBumpConversionRate(props.bumpNumberUsed / props.bumpNumberConverted * 100)
    }
    console.log('here', props.bumpNumberUsed, props.bumpNumberConverted)
  }, [props.bumpNumberUsed, props.bumpNumberConverted])

  return (
    <HoverCard
      withinPortal
      position={props.direction}
      width={500}
      shadow='md'
      withArrow
      openDelay={200}
      closeDelay={400}
    >
      <HoverCard.Target>
        <Badge
          style={{
            position: props.location.position,
            top: props.location.top,
            right: props.location.right,
            bottom: props.location.bottom,
            left: props.location.left,
            cursor: 'pointer',
          }}
        >
          {
            props.badgeBFTitle ? (
              props.bumpFrameworkTitle && props.bumpFrameworkTitle.length > 20 ? props.bumpFrameworkTitle.slice(0, 20) + "..." : props.bumpFrameworkTitle || 'AI'
            ) : (
              'AI'
            )
          }
        </Badge>
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

        {props.bumpFrameworkId ? (
          <>
            <Text size='sm' mt='md'>
              <span style={{ fontWeight: 550 }}>Framework:</span> {props.bumpFrameworkTitle}
            </Text>
            <TextWithNewline style={{ fontSize: '14px' }} breakheight='10px'>
              {props.bumpFrameworkDescription}
            </TextWithNewline>

            {props.bumpFrameworkLength && (
              <Badge color={valueToColor(theme, props.bumpFrameworkLength)} size='xs' variant='filled'>
                {props.bumpFrameworkLength}
              </Badge>
            )}

            <Text size='sm' mt='md'>
              <span style={{ fontWeight: 550 }}>Account Research:</span>
            </Text>
            <List>
              {props.accountResearchPoints?.map((point, index) => (
                <List.Item key={index}>
                  <Text size='xs'>{point}</Text>
                </List.Item>
              ))}
            </List>
          </>
        ) : (
          <>
            {props.cta ? (
              <>
                <Text size='sm' mt='md'>
                  <span style={{ fontWeight: 550 }}>Call to Action:</span> {props.cta}
                </Text>
              </>
            ) : (
              <Text size='sm' mt='md' fs={'italic'}>
                This message was generated before June 26th, 2023, prior to metadata capture.
              </Text>
            )}
          </>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
