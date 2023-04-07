import { createStyles, Avatar, Text, Group, useMantineTheme } from "@mantine/core";
import {
  IconPhoneCall,
  IconAt,
  IconBriefcase,
  IconMail,
  IconSocial,
  IconBuildingStore,
} from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";

const useStyles = createStyles((theme) => ({
  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

type ProspectDetailsSummaryProps = {
  fullName: string;
  title: string | null;
  email: string | null;
  linkedin: string | null;
  profilePic: string | null;
  companyName: string | null;
  companyURL?: string;
};

export default function ProspectDetailsSummary(
  props: ProspectDetailsSummaryProps
) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const companyURL =
    props.companyName && !props.companyURL
      ? `https://www.google.com/search?q=${encodeURIComponent(
          props.companyName
        )}`
      : props.companyURL;

  return (
    <Group noWrap align="flex-start" pb="xs">
      <Avatar
        src={props.profilePic}
        alt={props.fullName}
        color={valueToColor(theme, props.fullName)}
        radius="md"
        size={94}
      >
        {nameToInitials(props.fullName)}
      </Avatar>
      <div>
        <Group noWrap spacing={10} mt={3}>
          <IconBriefcase stroke={1.5} size={16} className={classes.icon} />
          <Text size="xs" color="dimmed">
            {props.title}
          </Text>
        </Group>

        {props.email && (
          <Group noWrap spacing={10} mt={5}>
            <IconMail stroke={1.5} size={16} className={classes.icon} />
            <Text
              size="xs"
              color="dimmed"
              component="a"
              href={`mailto:${props.email}`}
            >
              {props.email}
            </Text>
          </Group>
        )}

        {props.linkedin && (
          <Group noWrap spacing={10} mt={5}>
            <IconSocial stroke={1.5} size={16} className={classes.icon} />
            <Text
              size="xs"
              color="dimmed"
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://${props.linkedin}`}
            >
              {props.linkedin}
            </Text>
          </Group>
        )}

        {props.companyName && (
          <Group noWrap spacing={10} mt={5}>
            <IconBuildingStore
              stroke={1.5}
              size={16}
              className={classes.icon}
            />
            <Text
              size="xs"
              color="dimmed"
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={companyURL}
            >
              {props.companyName}
            </Text>
          </Group>
        )}
      </div>
    </Group>
  );
}
