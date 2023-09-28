import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { Box, Button, Divider, Modal, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCircleX } from "@tabler/icons-react";
import { withdrawInvitations } from "@utils/requests/withdrawInvitations";
import { DataGridRowSelectionState } from "mantine-data-grid";
import { useRecoilValue } from "recoil";

interface IWithdrawInvitesModalProps {
  opened: boolean;
  close: () => void;
  count: number;
  selectedRows: DataGridRowSelectionState;
  data: {
    "company": string,
    "full_name": string,
    "icp_fit_reason": string,
    "icp_fit_score": number,
    "id": number,
    "industry": string,
    "linkedin_url": string,
    "title": string,
  }[];
  refresh: () => void;
}

const WithdrawInvitesModal = ({
  opened,
  close,
  count,
  selectedRows,
  data,
  refresh,
}: IWithdrawInvitesModalProps) => {
  const userToken = useRecoilValue(userTokenState);
  
  const triggerWithdrawInvites = async () => {

    const prospects = data.filter((_, index) => {
      return selectedRows[index] === true;
    })
    const prospectIDs = prospects.map((prospect) => {
      return prospect.id;
    })

    const response = await withdrawInvitations(
      userToken,
      prospectIDs
    )

    if (response.status === "success") {
      showNotification({
        title: "Invitations Withdrawn",
        message: "Invitations are being withdrawn, please allow up to a day for this to complete.",
        color: "green",
      })
      refresh();
      close();
    } else {
      showNotification({
        title: "Error",
        message: "There was an error withdrawing invitations.",
        color: "red",
      })
    }

    return;
  }

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
          <Button fullWidth color="red" onClick={triggerWithdrawInvites}>
            Withdraw
          </Button>
        </Box>
      </Modal.Content>
    </Modal.Root>
  );
};

export default WithdrawInvitesModal;
