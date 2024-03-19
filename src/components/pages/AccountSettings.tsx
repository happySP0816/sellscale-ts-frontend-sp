import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Text,
  Title,
  LoadingOverlay,
  Divider,
  TextInput,
  Flex,
} from "@mantine/core";
import {
  IconFile,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
} from "@tabler/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { showNotification } from "@mantine/notifications";
import { getUserInfo, logout } from "@auth/core";

const AccountSettings: React.FC = () => {
  const [userData, setUserData] = useRecoilState(userDataState);
  const [sdrActive, setSdrActive] = useState<boolean>(userData?.active);
  const [loading, setLoading] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(true);
  const [editAccount, setEditAccount] = useState({
    full_name: userData.sdr_name,
    public_title: userData.sdr_title,
    email: userData.sdr_email,
  });

  const userToken = useRecoilValue(userTokenState);

  const fetchUserInfo = async () => {
    const info = await getUserInfo(userToken);
    setUserData(info);
    setSdrActive(info.active);
  };

  const handleActivate = async (userToken: string) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/client/sdr/activate_seat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    showNotification({
      title: json.status,
      message: json.message,
    });

    fetchUserInfo();
    setLoading(false);
  };

  const handleDeactivate = async (userToken: string) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/client/sdr/deactivate_seat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();
    showNotification({
      title: json.status,
      message: json.message,
    });

    fetchUserInfo();

    setLoading(false);
  };
  const handleSave = () => {
    setEdit(true);
    console.log("editAccount================", editAccount);
  };
  console.log("qweqweqweqwe", edit);
  return (
    <>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3}>Account Settings</Title>
        <Flex direction="column" gap={"sm"} mt={"md"}>
          <TextInput
            label="Your Full Name"
            value={editAccount.full_name}
            placeholder="your full name"
            onChange={(e) => {
              setEditAccount({ ...editAccount, full_name: e.target.value });
              setEdit(false);
            }}
          />
          <TextInput
            label="Your Public Title"
            value={editAccount.public_title}
            placeholder="your public title"
            onChange={(e) => {
              setEditAccount({ ...editAccount, public_title: e.target.value });
              setEdit(false);
            }}
          />
          <TextInput
            label="Email"
            value={editAccount.email}
            placeholder="Your email"
            onChange={(e) => {
              setEditAccount({ ...editAccount, email: e.target.value });
              setEdit(false);
            }}
          />
          <Flex gap={"md"} align={"center"} mt={"md"}>
            <Button w={"fit-content"} onClick={handleSave} disabled={edit}>
              Save Account Info
            </Button>
            {!edit && (
              <Button
                onClick={() => {
                  setEdit(true);
                  setEditAccount({
                    full_name: userData.sdr_name,
                    public_title: userData.sdr_title,
                    email: userData.sdr_email,
                  });
                }}
                color="red"
                variant="outline"
              >
                Cancel Edit
              </Button>
            )}
          </Flex>
        </Flex>
      </Card>
      <Card shadow="sm" p="lg" radius="md" withBorder mt={"md"}>
        <Box>
          <LoadingOverlay visible={loading} />
          <Title order={4}>Danger Zone: Toggle Seat</Title>
          <Text color="dimmed" size="sm" mt="sm">
            Deactivate the SDR seat to prevent any future AI activity.
            Reactivate it when you’re ready to resume AI activity.
          </Text>
          <Box mt="md">
            {sdrActive ? (
              <Button
                color="red"
                onClick={() => handleDeactivate(userToken)}
                disabled={loading}
                leftIcon={<IconPlayerPause size={18} />}
              >
                Deactivate SDR
              </Button>
            ) : (
              <Button
                color="green"
                onClick={() => handleActivate(userToken)}
                disabled={loading}
                leftIcon={<IconPlayerPlay size={18} />}
              >
                Activate SDR
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default AccountSettings;
