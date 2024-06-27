import { Button, Flex, Paper, TextInput } from "@mantine/core";

export default function StrategyCreateModal() {
  return (
    <Paper>
      <TextInput label="Strategy Name" placeholder="Eg. Product managers in chicago" />
      <TextInput label="Attach Campaigns" placeholder="Search campaigns" mt={20} />
      <Flex gap={"xl"} mt={40}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button fullWidth>Create Strategy</Button>
      </Flex>
    </Paper>
  );
}
