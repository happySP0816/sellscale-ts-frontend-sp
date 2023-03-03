import {
  LoadingOverlay,
  Modal,
  Text,
  Divider,
  Button,
  TextInput,
  Center,
  Container,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconAt } from "@tabler/icons";
import { useEffect, useState } from "react";
import { login } from "@auth/core";
import { useRecoilState } from "recoil";
import { userEmailState } from "@atoms/userAtoms";
import { LogoFull } from "@nav/Logo";
import { EMAIL_REGEX } from "@constants/data";
import { setPageTitle } from "@utils/documentChange";

async function sendLogin(email: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/client/send_magic_link_login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_sdr_email: email,
      }),
    }
  );

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
  const [userEmail, setUserEmail] = useRecoilState(userEmailState);

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
      login(values.email, setUserEmail);
      setCheckEmail(true);
    } else if (res?.status === 404) {
      setError(res.message);
    } else {
      setError("Error logging in");
    }
  };

    return (
      <Modal opened={true} withCloseButton={false} onClose={() => {}} size="sm">
        <LogoFull size={35} />
        <Text c="dimmed" fs="italic" ta="center" size="sm">
          View your prospects, outbound analytics, and personas all in one place.
        </Text>
        <Divider my="sm" label="Login" labelPosition="center" />

        <Container>
          {!checkEmail && (
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <LoadingOverlay visible={loading} overlayBlur={2} />

              <TextInput
                mt="md"
                required
                placeholder={`Client Email`}
                icon={<IconAt size={16} stroke={1.5} />}
                {...form.getInputProps("email")}
              />

              {error && (
                <Text color="red" size="sm" mt="sm">
                  {error}
                </Text>
              )}

              {
                <Center m={"sm"}>
                  <Button variant="outline" radius="md" type="submit">
                    Login
                  </Button>
                </Center>
              }
            </form>
          )}
          {checkEmail && (
          <>
            <Text ta="center">A login link has been sent to your email.</Text>
            <Text ta="center" fs="italic" c="dimmed">You may close this tab now.</Text>
          </>
          )}
        </Container>
      </Modal>
    );
}
