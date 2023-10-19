import {
  ActionIcon,
  Text,
  Card,
  Button,
  Tooltip,
  Switch,
  Flex,
  MantineColor,
  Badge,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons";

interface Tag {
  label: string;
  highlight?: string;
  color: MantineColor;
  hovered?: string;
  variant: "subtle" | "filled" | "light";
}

export interface TabOption {
  id: number;
  label: string;
  description: string;
  checked: boolean;
  tags: Tag[];
  outlined?: boolean;

  type: string;
}

export const CTAOption: React.FC<{
  data: TabOption;
  onToggle: (value: boolean) => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
  autoMarkScheduling?: boolean;
  acceptance: {
    percentage: number;
    total_responded?: number;
    total_count?: number;
  };
}> = ({
  data,
  onToggle,
  onClickEdit,
  onClickDelete,
  autoMarkScheduling,
  acceptance,
}) => {
  return (
    <Card
      radius={"md"}
      py={"1rem"}
      pos={"relative"}
      sx={(theme) => ({
        border: "1px dashed " + theme.colors.gray[2],
        overflow: "unset",
      })}
    >
      <Badge
        fw={700}
        color={"green"}
        variant="light"
        pos={"absolute"}
        top={-10}
        style={{ zIndex: 10 }}
      >
        {data.type ? data.type.replace("-", " ") : "CTA Type"}
      </Badge>
      <Flex direction={"row"} w={"100%"} gap={"0.75rem"}>
        <Flex wrap={"wrap"} gap={"0.5rem"} align={"center"}>
          <Tooltip
            label={
              "Prospects: " +
              acceptance.total_responded +
              "/" +
              acceptance.total_count
            }
            withArrow
            withinPortal
          >
            <Flex
              bg={"blue.1"}
              p={"0.5rem"}
              direction="column"
              align="center"
              style={{ borderRadius: 12 }}
            >
              <Text color={"blue.6"} fw={700} fz={20}>
                {acceptance.percentage}%
              </Text>
              <Text color="blue.4" size={"sm"}>
                Acceptance
              </Text>
            </Flex>
          </Tooltip>
          {/* {data.tags.map((e) => (
              <Tooltip
                disabled={!e.hovered}
                label={e.hovered}
                withArrow
                withinPortal
              >
                <Button
                  key={e.label}
                  variant={e.variant}
                  size="xs"
                  color={e.color}
                  radius="xl"
                  h="auto"
                  fz={"0.75rem"}
                  py={"0.125rem"}
                  px={"0.25rem"}
                  fw={"400"}
                >
                  {e.label}
                  {e.highlight && (
                    <strong style={{ paddingLeft: 5 }}> {e.highlight}</strong>
                  )}
                </Button>
              </Tooltip>
            ))}
            {autoMarkScheduling && (
              <Tooltip
                label="Accepted invite will automatically classify prospect as 'scheduling'"
                withArrow
              >
                <Text sx={{ cursor: "pointer" }} size="sm">
                  🛎
                </Text>
              </Tooltip>
            )} */}
        </Flex>
        <Flex align={"center"}>
          <Text color={"gray.8"} fw={500}>
            {data.label}
            <Button
              size="compact-xs"
              variant="light"
              leftIcon={<IconEdit size={14} />}
              fz="xs"
              radius="lg"
              ml={"0.25rem"}
              onClick={onClickEdit}
            >
              Edit CTA
            </Button>
          </Text>
        </Flex>
        <Flex gap={"0.5rem"} align={"center"} ml={"auto"}>
          <Switch
            checked={data.checked}
            color={"green"}
            size="md"
            onChange={({ currentTarget: { checked } }) => onToggle(checked)}
          />
          <ActionIcon radius="xl" onClick={onClickDelete}>
            <IconTrash />
          </ActionIcon>
        </Flex>
      </Flex>
    </Card>
  );
};
