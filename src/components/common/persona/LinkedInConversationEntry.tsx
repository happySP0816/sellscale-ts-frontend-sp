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
} from '@mantine/core';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import { nameToInitials, valueToColor } from '@utils/general';
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
  const theme = useMantineTheme();
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
  cta?: string;
  badgeBFTitle?: boolean;
}) {
  const theme = useMantineTheme();
  return (
    <HoverCard
      withinPortal
      position={props.direction}
      width={320}
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
              props.bumpFrameworkTitle && props.bumpFrameworkTitle.length > 20 ?  props.bumpFrameworkTitle.slice(0, 20) + "..." : props.bumpFrameworkTitle || 'AI'
            ) : (
              'AI'
            )
          }
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Group>
          <Avatar radius='xl' color='blue' size='md'>
            <IconInfoCircleFilled size='1.9rem' />
          </Avatar>
          <Stack spacing={5}>
            <Text size='sm' weight={700} sx={{ lineHeight: 1 }}>
              Automatic Generated {props.cta ? 'Message' : 'Response'}
            </Text>
            <Text color='dimmed' size='xs' sx={{ lineHeight: 1 }}>
              These data points where chosen by AI 🤖
            </Text>
          </Stack>
        </Group>

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
