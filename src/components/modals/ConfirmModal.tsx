import {
  Button,
  Text,
  Paper,
  useMantineTheme,
  Box,
  Stack,
  Center,
  Group,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";

export default function ConfirmModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  description: string;
  confirmBtn?: string;
  rejectBtn?: string;
  onConfirm?: () => Promise<void>;
  onReject?: () => Promise<void>;
}>) {
  const theme = useMantineTheme();

  return (
    <Paper
      p={0}
      h={"30vh"}
      style={{
        position: "relative",
      }}
    >
      <Group sx={{ flexDirection: 'column' }} position="apart" h='100%'>
        <Text>{innerProps.description}</Text>
        <Box m="sm">
          <Center>
            <Group>
              {innerProps.confirmBtn && (
                <Button
                  variant="light"
                  onClick={async () => {
                    innerProps.onConfirm && (await innerProps.onConfirm());
                    context.closeModal(id);
                  }}
                >
                  {innerProps.confirmBtn}
                </Button>
              )}
              {innerProps.rejectBtn && (
                <Button
                  variant="light"
                  color="red"
                  onClick={async () => {
                    innerProps.onReject && (await innerProps.onReject());
                    context.closeModal(id);
                  }}
                >
                  {innerProps.rejectBtn}
                </Button>
              )}
            </Group>
          </Center>
        </Box>
      </Group>
    </Paper>
  );
}
