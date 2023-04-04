import { Center, Paper, Title } from "@mantine/core";

export default function ComingSoonCard(props: { h?: number }) {
  return (
    <Paper withBorder p="md" radius="md" w="100%" h={props.h ?? "100%"}>
      <Center h={props.h ? props.h - 60 : "90%"}>
        <Title order={2} fs="italic">Coming Soon!</Title>
      </Center>
    </Paper>
  );
}
