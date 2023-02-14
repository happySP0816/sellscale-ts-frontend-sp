import {
  LoadingOverlay, Modal, Title, useMantineTheme, Text, Group, Button, TextInput, Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconAt } from "@tabler/icons";
import { useEffect, useState } from "react";
import { login } from "src/auth/core";

async function sendLogin(email: string) {

  const response = await fetch(`${process.env.REACT_APP_API_URI}/client/send_magic_link_login`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'client_sdr_email': email,
    })
  });
  return await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: 'auth-error',
      title: 'Error',
      message: `Error: ${error}`,
      color: 'red',
      autoClose: false,
    });
  });

}

const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

export default function LoginPage() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useMantineTheme();

  const form = useForm({
    initialValues: {
      email: '',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    handleLogin(values);
  }

  const handleLogin = async (values: typeof form.values) => {

    if(!values.email.match(emailRegex)){
      setError('Not a valid email address!');
      return;
    }

    setLoading(true);

    // Make request to backend to login (see: api/auth/login.py)
    const res = await sendLogin(values.email);

    setLoading(false);

    // TODO: Pass in res data to login function
    //login();

  };

  return (
    <Modal
      opened={true}
      withCloseButton={false}
      onClose={() => {}}
      size="lg"
    >
      <Title order={2}>Login to SellScale Sight</Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <LoadingOverlay visible={loading} />

        <TextInput
          mt="md"
          required
          placeholder={`Email`}
          label={`Email`}
          icon={<IconAt size={16} stroke={1.5} />}
          {...form.getInputProps('email')}
        />


        {error && (
          <Text color="red" size="sm" mt="sm">
            {error}
          </Text>
        )}

        {(
          <Center m={'sm'}>
            <Button variant="outline" radius="md" type="submit">
              Login
            </Button>
          </Center>
        )}
      </form>
      
  </Modal>
  );
}
