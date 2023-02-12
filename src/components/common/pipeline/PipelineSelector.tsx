import {
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Button,
} from "@mantine/core";
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons";

const useStyles = createStyles((theme) => ({

  root: {},

  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

export const icons = {
  all_prospects: IconUserPlus,
  accepted_only: IconDiscount2,
  bumped_only: IconReceipt2,
  active_convo_only: IconCoin,
  demo_set_only: IconCoin,
};

interface StatsGridProps {
  data: {
    title: string;
    description: string;
    icon: any;
    value: string;
    color: string;
  }[];
}

export default function PipelineSelector({ data }: StatsGridProps) {
  const { classes } = useStyles();
  const stats = data.map((stat) => {
    const Icon = stat.icon;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            {stat.title}
          </Text>
        </Group>

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
        </Group>

        <Text size="xs" color="dimmed" mt={7}>
          {stat.description}
        </Text>
        <Button variant="outline" color={stat.color} mt="md" size="xs">
          View Contacts
        </Button>
      </Paper>
    );
  });
  return (
    <div className={classes.root}>
      <SimpleGrid
        cols={5}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {stats}
      </SimpleGrid>
    </div>
  );
}
