import { sequenceDrawerOpenState } from "@atoms/sequenceAtoms";
import {
  Drawer,
  LoadingOverlay,
  ScrollArea,
  Title,
  Badge,
  Flex,
  useMantineTheme,
  Tabs,
  Divider,
  Spoiler,
  Text,
  Paper,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import { useRecoilState, useRecoilValue } from "recoil";
import { Sequence } from "src";

export default function ViewSequenceDrawer(props: { sequence: Sequence | null }) {

  const [opened, setOpened] = useRecoilState(sequenceDrawerOpenState);

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Title order={2}>{props.sequence?.title}</Title>
      }
      padding="xl"
      size="lg"
      position="right"
    >
      <ScrollArea
        style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
      >
        {props.sequence?.data.map((step, i) => (
          <Paper key={i} withBorder px="md" py={0} my={10} radius="md">
            <Spoiler my='md' maxHeight={160} showLabel="Show more" hideLabel="Hide">
              <Badge color="gray" size="lg" variant="outline" my={4}>Step {i+1}</Badge>
              <Title order={4}>{step.subject}</Title>
              <Divider />
              <ReactMarkdown components={{
                p: ({node, ...props}) => <p style={{fontSize: 14}} {...props} />
              }}>{step.body}</ReactMarkdown>
            </Spoiler>
          </Paper>
        ))}
      </ScrollArea>
    </Drawer>
  );
  
}
