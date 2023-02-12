import { createStyles, Avatar, Text, Group } from "@mantine/core";
import {
  IconPhoneCall,
  IconAt,
  IconBriefcase,
  IconMail,
  IconSocial,
} from "@tabler/icons";

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
  full_name: string;
  status: string;
  title: string;
  profile_pic: string | null;
};

export default function ProspectDetailsSummary(
  props: ProspectDetailsSummaryProps
) {
  const { classes } = useStyles();
  return (
    <div>
      <Group noWrap>
        <Avatar
          src={
            props.profile_pic
              ? props.profile_pic
              : "https://99designs-blog.imgix.net/blog/wp-content/uploads/2018/12/Gradient_builder_2.jpg?auto=format&q=60&w=1815&h=1200&fit=crop&crop=faces"
          }
          size={94}
          radius="md"
        />
        <div>
          <Text
            size="xs"
            sx={{ textTransform: "uppercase" }}
            weight={700}
            color="dimmed"
          >
            {props.status.replaceAll("_", " ")}
          </Text>

          <Text size="lg" weight={500} className={classes.name}>
            {props.full_name}
          </Text>

          <Group noWrap spacing={10} mt={3}>
            <IconBriefcase stroke={1.5} size={16} className={classes.icon} />
            <Text size="xs" color="dimmed">
              {props.title}
            </Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <IconMail stroke={1.5} size={16} className={classes.icon} />
            <Text size="xs" color="dimmed">
              email goes here
            </Text>
          </Group>

          <Group noWrap spacing={10} mt={5}>
            <IconSocial stroke={1.5} size={16} className={classes.icon} />
            <Text size="xs" color="dimmed">
              www.linkedin.com/in/aaadesara
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
}
