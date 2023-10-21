import { userTokenState } from "@atoms/userAtoms";
import { Switch, Text, Title } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { activatePersona } from "@utils/requests/postPersonaActivation";
import { deactivatePersona } from "@utils/requests/postPersonaDeactivation";
import { useRecoilValue } from "recoil";

const UserStatusToggle: React.FC<{
  projectId?: number;
  isActive?: boolean;
  onChangeUserStatusSuccess: (status: boolean) => void;
}> = ({ projectId, isActive = false, onChangeUserStatusSuccess }) => {
  const token = useRecoilValue(userTokenState);

  const triggerBasicPersonaDeactivation = async () => {
    if (!projectId) {
      alert("No current project");
      return;
    }

    const result = await deactivatePersona(token, projectId, false);
    if (result.status === "success") {
      onChangeUserStatusSuccess?.(false);
      showNotification({
        title: "Persona Deactivated",
        message: "Your persona has been deactivated.",
        color: "blue",
      });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error deactivating your persona.",
        color: "red",
      });
    }
  };

  const triggerHardPersonaDeactivation = async () => {
    if (projectId == null) {
      alert("No current project");
      return;
    }

    const result = await deactivatePersona(token, projectId, true);
    if (result.status === "success") {
      onChangeUserStatusSuccess?.(false);
      showNotification({
        title: "Persona Deactivated",
        message: "Your persona has been deactivated.",
        color: "blue",
      });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error deactivating your persona.",
        color: "red",
      });
    }
  };

  const triggerActivatePersona = async () => {
    if (!projectId) {
      alert("No current project");
      return;
    }

    const result = await activatePersona(token, projectId);
    if (result.status === "success") {
      onChangeUserStatusSuccess?.(true);
      showNotification({
        title: "Persona Activated",
        message: "Your persona has been activated.",
        color: "green",
      });
    } else {
      showNotification({
        title: "Error",
        message: "There was an error activating your persona.",
        color: "red",
      });
    }
  };

  const handleUserStatusChanges = async () => {
    if (isActive) {
      openConfirmModal({
        title: <Title order={3}>Deactivate Persona</Title>,
        children: (
          <>
            <Text fs="italic">
              Please read the deactivation options below carefully.
            </Text>
            <Text mt="md">
              <b>Basic Deactivate:</b> Deactivating this persona will prevent
              any new message generation, but Prospects still in the pipeline
              will continue to receive messages.
            </Text>
            <Text mt="xs">
              <b>Hard Deactivate:</b> Hard deactivating this persona will wipe
              all messages from the pipeline and stop any and all contact with
              Prospects. Hard deactivating may take a few minutes.
            </Text>
          </>
        ),
        labels: {
          confirm: "Basic Deactivate",
          cancel: "Hard Deactivate",
        },
        cancelProps: { color: "red", variant: "outline" },
        confirmProps: { color: "red" },
        onCancel: () => {
          triggerHardPersonaDeactivation();
        },
        onConfirm: () => {
          triggerBasicPersonaDeactivation();
        },
      });
    } else {
      await triggerActivatePersona();
    }
  };

  return (
    <>
      <Switch
        checked={isActive}
        size="md"
        styles={(theme) => ({
          thumb: {
            backgroundColor: theme.colors.blue[6],
          },
          track: {
            backgroundColor: `${
              isActive ? "#FFFFFF" : theme.colors.gray[1]
            } !important`,
          },
          trackLabel: {
            backgroundColor: `${
              isActive ? "#FFFFFF" : theme.colors.gray[1]
            } !important`,
          },
        })}
        onClick={handleUserStatusChanges}
      />
    </>
  );
};

export default UserStatusToggle;
