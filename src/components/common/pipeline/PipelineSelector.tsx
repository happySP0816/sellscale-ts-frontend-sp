import { prospectSelectorTypeState } from "@atoms/prospectAtoms";
import {
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Text,
  Button,
  Flex,
  Stack,
  Space,
} from "@mantine/core";
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilState } from "recoil";

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

export type StatGridInfo = {
  title: string;
  description: string;
  icon: any;
  value: string;
  color: string;
}

export default function PipelineSelector({ data }: { data: Map<string, StatGridInfo> }) {
  const { classes } = useStyles();
  const queryClient = useQueryClient();

  const [selectorType, setSelectorType] = useRecoilState(prospectSelectorTypeState);

  const stats = [...data.keys()].map((id) => {
    let stat = data.get(id);
    if(!stat) { return (<></>); }

    return (
      <Paper
        withBorder
        p="md"
        radius="md"
        key={stat.title}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            {stat.title}
          </Text>
        </Group>
        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          <Text size="xs" color="dimmed">
            {stat.description}
          </Text>
        </Group>
        <Button
          variant={selectorType === id ? 'filled' : 'outline'}
          onClick={() => {
            queryClient.removeQueries({ queryKey: ['query-pipeline-prospects'] });
            setSelectorType(id);
          }}
          color={stat.color}
          mt="md"
          size="xs">
          View
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
        spacing="lg"
      >
        {stats}
      </SimpleGrid>
    </div>
  );
}
