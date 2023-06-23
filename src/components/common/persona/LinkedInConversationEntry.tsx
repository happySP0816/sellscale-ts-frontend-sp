import TextWithNewline from "@common/library/TextWithNewlines";
import {
  createStyles,
  Text,
  Avatar,
  Group,
  TypographyStylesProvider,
  Paper,
  Badge,
  useMantineTheme,
} from "@mantine/core";
import { nameToInitials, valueToColor } from "@utils/general";

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
    "& > p:last-child": {
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
}

export function LinkedInConversationEntry({
  postedAt,
  body,
  name,
  image,
  isLatest,
  aiGenerated,
}: CommentHtmlProps) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  return (
    <Paper withBorder radius="md" className={classes.comment} p="lg" mb="xs">
      <Group sx={{ position: "relative" }}>
        <Avatar
          src={image}
          radius="xl"
          alt={name}
          color={valueToColor(theme, name)}
        >
          {nameToInitials(name)}
        </Avatar>
        <div>
          <Text size="sm">{name}</Text>
          <Text size="xs" color="dimmed">
            {postedAt}
          </Text>
        </div>
        {isLatest && (
          <Badge sx={{ position: "absolute", top: 0, right: 0 }}>
            Latest Message
          </Badge>
        )}
        {aiGenerated && (
          <Badge sx={{ position: "absolute", top: 0, right: 0 }}>
            AI
          </Badge>
        )}
      </Group>

      <TypographyStylesProvider className={classes.body}>
        <TextWithNewline className={classes.content}>{body}</TextWithNewline>
      </TypographyStylesProvider>
    </Paper>
  );
}
