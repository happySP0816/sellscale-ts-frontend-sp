import { Box, Button, Divider, Modal, Text, Title } from "@mantine/core";
import { IconCircleX } from "@tabler/icons-react";

interface IWithdrawInvitesModalProps {
  opened: boolean;
  close: () => void;
  count: number;
}

const WithdrawInvitesModal = ({
  opened,
  close,
  count,
}: IWithdrawInvitesModalProps) => {
  return (
    <Modal.Root opened={opened} onClose={close} size={"md"}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header bg={"red"}>
          <Modal.Title fw={700}>
            <Title color="white" size={"md"}>
              Withdrawing Invites
            </Title>
          </Modal.Title>
          <IconCircleX
            color="white"
            size={24}
            onClick={close}
            style={{ cursor: "pointer" }}
          />
        </Modal.Header>
        <Modal.Body
          sx={{
            textAlign: "center",
            marginTop: "1rem",
            padding: "1rem 4rem !important",
          }}
        >
          <Title size={"18px"} fw={700}>
            You're about to withdraw {count} invites!
          </Title>

          <Text color="#868e96">
            You won't be able to reconnect with these contacts for 2 weeks.
            <Text td="underline" color="red" span fw="600">
              Are you sure?
            </Text>
          </Text>
        </Modal.Body>
        <Divider my={5} />

        <Box
          p={"1rem"}
          sx={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}
        >
          <Button color="gray" variant="outline" fullWidth onClick={close}>
            Cancel
          </Button>
          <Button fullWidth color="red" onClick={close}>
            Withdraw
          </Button>
        </Box>
      </Modal.Content>
    </Modal.Root>
  );
};

export default WithdrawInvitesModal;
