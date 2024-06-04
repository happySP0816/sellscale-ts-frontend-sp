import { LoadingOverlay, Modal, Text, Divider, Button, TextInput, Center, Container, Box, Flex, Image, BackgroundImage } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconAt } from "@tabler/icons";
import { useEffect, useState } from "react";
import { login } from "@auth/core";
import { useRecoilState } from "recoil";
import { userDataState } from "@atoms/userAtoms";
import { LogoFull } from "@nav/Logo";
import { API_URL, EMAIL_REGEX } from "@constants/data";
import { setPageTitle } from "@utils/documentChange";
import Logo from "@assets/images/logo.png";
import Background from "@assets/images/login_bg.png";

async function sendLogin(email: string) {
  const response = await fetch(`${API_URL}/client/send_magic_link_login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_sdr_email: email,
    }),
  });

  let result = await response.text().catch((err) => {
    console.error("Failed to read response as plain text", err);
    showNotification({
      id: "auth-error",
      title: "Error",
      message: `Error: ${err}`,
      color: "red",
      autoClose: false,
    });
    return null;
  });

  return { status: response.status, message: result };
}

export default function LoginPage() {
  setPageTitle(`Login`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [checkEmail, setCheckEmail] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    handleLogin(values);
  };

  const handleLogin = async (values: typeof form.values) => {
    if (!values.email.match(EMAIL_REGEX)) {
      setError("Not a valid email address!");
      return;
    }

    setLoading(true);

    // Make request to backend to login (see: api/auth/login.py)
    const res = await sendLogin(values.email);

    setLoading(false);

    if (res?.status === 200) {
      login(values.email, setUserData);
      setCheckEmail(true);
    } else if (res?.status === 404) {
      setError(res.message);
    } else {
      setError("Error logging in");
    }
  };

  return (
    <Box maw={"100%"} h={"100%"}>
      <BackgroundImage h={"100%"} src={Background}>
        <Modal opened={true} centered withCloseButton={false} onClose={() => {}} size="md">
          <Flex px={"md"} py={"md"} gap={"md"} direction={"column"}>
            <Image height={40} sx={{ minWidth: "100px" }} fit="contain" src={Logo} alt="SellScale Sight" />
            <Text ta={"center"} fz={22} fw={600}>
              SellScale Sight
            </Text>
            <Text c="dimmed" ta="center" size="sm">
              Work with your Sales AGI to access your contacts, campaigns, analytics, and more.
            </Text>
            <Divider w={"100%"} />
            <Box>
              {!checkEmail && (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Text fw={600} align="center">
                    Log in to get started
                  </Text>
                  <LoadingOverlay visible={loading} overlayBlur={2} />

                  <TextInput required placeholder={`Enter your email address`} {...form.getInputProps("email")} mt={"sm"} />

                  {error && (
                    <Text color="red" size="sm" mt="sm">
                      {error}
                    </Text>
                  )}

                  <Button mt={"sm"} radius="md" type="submit" fullWidth>
                    Next
                  </Button>
                </form>
              )}
              {checkEmail && (
                <>
                  <Text ta="center" fw={500}>
                    A login link has been sent to your email.
                  </Text>
                  <Text ta="center" c="dimmed">
                    You may close this tab now.
                  </Text>
                </>
              )}
            </Box>
            <Text size={"xs"} color="gray" align="center">
              SellScale Inc., 2024
            </Text>
          </Flex>
        </Modal>
      </BackgroundImage>
    </Box>
  );
}
