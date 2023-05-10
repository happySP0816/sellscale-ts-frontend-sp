import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Box,
  Button,
  Container,
  LoadingOverlay,
  Card,
  TextInput,
} from "@mantine/core";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";

export default function SellScaleBrainUserTab() {
  const [userToken] = useRecoilState(userTokenState);
  const [fetchingUserInfo, setFetchingUserInfo] = React.useState(false);
  const [fullName, setFullName] = React.useState("");
  const [title, setTitle] = React.useState("");

  const [fetchedUser, setFetchedUser] = React.useState(false);
  const [needsSave, setNeedsSave] = React.useState(false);

  const fetchUser = async () => {
    setFetchingUserInfo(true);
    const response = await fetch(`${API_URL}/client/sdr`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();
    setFullName(data.sdr_info.sdr_name);
    setTitle(data.sdr_info.sdr_title);
    setFetchingUserInfo(false);
    setNeedsSave(false);
  };

  const saveUser = async () => {
    setFetchingUserInfo(true);
    const response = await fetch(`${API_URL}/client/sdr`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        name: fullName,
        title: title,
      }),
    });
    fetchUser();
  };

  useEffect(() => {
    if (!fetchedUser) {
      fetchUser();
      setFetchedUser(true);
    }
  }, [fetchedUser]);

  return (
    <Box>
      <Container>
        <Card>
          <LoadingOverlay visible={fetchingUserInfo} />
          <TextInput
            label="Your Full Name"
            value={fullName}
            onChange={(event) => {
              setFullName(event.currentTarget.value);
              setNeedsSave(true);
            }}
            mb="sm"
          />
          <TextInput
            label="Your Public Title"
            value={title}
            onChange={(event) => {
              setTitle(event.currentTarget.value);
              setNeedsSave(true);
            }}
            mb="sm"
          />
          <Button
            color="blue"
            variant="light"
            mt="md"
            disabled={!needsSave}
            onClick={() => saveUser()}
          >
            Save User Information
          </Button>
          <Button
            color="red"
            variant="outline"
            mt="md"
            ml="lg"
            onClick={fetchUser}
            hidden={!needsSave}
          >
            Cancel Edits
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
