import {
  createStyles,
  Text,
  Avatar,
  Group,
  TypographyStylesProvider,
  Paper,
  Badge,
  useMantineTheme,
  Title,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import { nameToInitials, valueToColor } from "@utils/general";
import _ from "lodash";

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
    marginTop: `5px`,
    marginBottom: `5px`,
    width: 380,
  },

  body: {
    paddingTop: 5,
    fontSize: theme.fontSizes.sm,
  },

  content: {
    "& > p:last-child": {
      marginBottom: 0,
    },
  },
}));

export default function EmailThreadEntry(props: {
  subject: string;
  postedAt: string;
  snippet: string;
  threadId: string;
  prospectId: number;
}) {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  return (
    <Paper
      withBorder
      radius="md"
      className={classes.comment}
      sx={(theme) => ({
        position: "relative",
        "&:hover": {
          filter: theme.colorScheme === "dark" ? "brightness(135%)" : "brightness(95%)",
        },
        cursor: "pointer",
      })}
      onClick={() => {
        openContextModal({
          modal: "viewEmailThread",
          title: <Title order={3}>{props.subject}</Title>,
          innerProps: { prospectId: props.prospectId, threadId: props.threadId },
        });
      }}
    >
      <Title order={5}>{props.subject}</Title>
      <Text
        size="xs"
        color="dimmed"
        sx={{ position: "absolute", top: 8, right: 12 }}
      >
        {props.postedAt}
      </Text>

      <TypographyStylesProvider className={classes.body}>
        <div
          className={classes.content}
          dangerouslySetInnerHTML={{ __html: _.truncate(props.snippet, {
            'length': 100,
            'separator': ' '
          }) }}
        />
      </TypographyStylesProvider>
    </Paper>
  );
}
