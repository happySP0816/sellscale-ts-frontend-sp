import {
  Button,
  Flex,
  Text,
  Card,
  Switch,
  Checkbox,
  Grid,
} from "@mantine/core";

export const PersonalizationCard: React.FC<{
  title: string;
  checked: boolean;
  items: { title: string; checked: boolean; disabled: boolean }[];
  onToggle: (value: boolean) => void;
  onPressItem: (
    item: { title: string; checked: boolean; disabled: boolean },
    checked: boolean
  ) => void;
}> = ({ title, checked, onToggle, items, onPressItem }) => {
  return (
    <Card withBorder mb={"1rem"}>
      <Card.Section>
        <Flex
          align={"center"}
          justify={"space-between"}
          bg={checked ? "blue.1" : "gray.2"}
          py={"0.5rem"}
          px={"1rem"}
          gap={"0.5rem"}
        >
          <Text fw={"600"} fz={"0.75rem"} color={checked ? "blue" : "gray"}>
            {title}
          </Text>
          <Switch
            disabled
            checked={checked}
            onChange={({ currentTarget: { checked } }) => onToggle(checked)}
          />
        </Flex>
      </Card.Section>
      <Grid gutter={"1.5rem"} py={"1rem"}>
        {items.map((item) => {
          return (
            <Grid.Col xs={12} md={6} xl={4} key={item.title}>
              <Flex align={"center"} gap={"0.25rem"}>
                <Checkbox
                  size={"xs"}
                  label={item.title}
                  checked={item.checked}
                  disabled={item.disabled}
                  onChange={(event) =>
                    onPressItem(item, event.currentTarget.checked)
                  }
                  color="blue"
                  variant="outline"
                />
                {/* {item.disabled && (
                  <Button
                    h="auto"
                    variant="light"
                    size="xs"
                    color="red"
                    radius="xl"
                    fz={"0.5rem"}
                    fw={"700"}
                    tt={"uppercase"}
                    py={"0.25rem"}
                    px={"0.5rem"}
                  >
                    Disabled
                  </Button>
                )} */}
              </Flex>
            </Grid.Col>
          );
        })}
      </Grid>
    </Card>
  );
};
