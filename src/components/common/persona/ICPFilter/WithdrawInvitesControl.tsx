import {
  Box,
  Select,
  Title,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

interface IWithdrawInvitesControlProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const WithdrawInvitesControl = ({
  count,
  onConfirm,
  onCancel,
}: IWithdrawInvitesControlProps) => {
  const theme = useMantineTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <Title size={"14px"} fw={600}>
        {count} Selected
      </Title>
      <Select
        placeholder="Select action"
        value={"Withdraw Invites"}
        data={["Withdraw Invites"]}
        clearable
        styles={{
          input: {
            backgroundColor: "rgb(231, 245, 255)",
            color: theme.colors.blue[6],
            fontWeight: 600,
            border: `1px solid ${theme.colors.blue[6]}`,
          },
        }}
      />
      <UnstyledButton
        sx={{
          backgroundColor: "rgba(235, 251, 238, 1)",
          borderRadius: "2px",
          paddingTop: "0.2rem",
          paddingBottom: "0rem",
          paddingLeft: "0.2rem",
          paddingRight: "0.2rem",
        }}
        onClick={onConfirm}
      >
        <IconCheck color="green" size={16} />
      </UnstyledButton>
      <UnstyledButton
        sx={{
          backgroundColor: "rgba(255, 245, 245, 1)",
          borderRadius: "2px",
          paddingTop: "0.2rem",
          paddingBottom: "0rem",
          paddingLeft: "0.2rem",
          paddingRight: "0.2rem",
        }}
        onClick={onCancel}
      >
        <IconX color="red" size={16} />
      </UnstyledButton>
    </Box>
  );
};

export default WithdrawInvitesControl;
