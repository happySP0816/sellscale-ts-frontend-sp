import {
  LoadingOverlay,
  Modal,
  Text,
  Divider,
  Button,
  TextInput,
  Center,
  Container,
  Box,
  Flex,
  Image,
  BackgroundImage,
  Paper,
  useMantineTheme,
} from "@mantine/core";
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
import LoginAsset from "@assets/images/login_asset.png";
import WhiteLogo from "@assets/images/whitelogo.png";
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
  const theme = useMantineTheme();

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
    <Flex h={"100%"}>
      <Flex className="absolute z-10" w={"50%"} h={"100%"} bg={"white"} style={{ borderTopRightRadius: "16px", borderBottomRightRadius: "16px" }}>
        <Flex direction={"column"} gap={"md"} mx={100} justify={"center"} w={"100%"} h={"100%"}>
          <img src={WhiteLogo} className="bg-[#e25dee] w-10 p-2 rounded-full" />
          <Box>
            <Text fw={700} fz={22}>
              Login to your SellScale account
            </Text>
            <Text size={"xs"} color="gray" fw={500}>
              Welcome back! Please enter your details.
            </Text>
          </Box>
          <TextInput size="md" mt={"xl"} placeholder="name@xyz.com" label="Enter your Email" />
          <TextInput size="md" label="Enter your Password" />
          <Text size={"sm"} color="gray" fw={500} align="end">
            Forgot Password?
          </Text>
          <Button size="lg" className="bg-[#e25dee]">
            Login
          </Button>
          <Divider label="Or" labelPosition="center" />
          <Flex align={"center"} justify={"center"} gap={"sm"}>
            <Text color="gray" size={"sm"} fw={500}>
              Don't have an account?
            </Text>
            <Text size={"sm"} fw={500} className="text-[#e25dee]">
              Register
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Flex w={"51%"} className="absolute top-0 bottom-0 right-0">
        <BackgroundImage h={"100%"} src={LoginAsset} />
      </Flex>
    </Flex>
    // <Box maw={"100%"} h={"100%"}>
    //   <BackgroundImage h={"100%"} src={Background}>
    //     <Modal opened={true} centered withCloseButton={false} onClose={() => {}} size="md">
    //       <Flex px={"md"} py={"md"} gap={"md"} direction={"column"}>
    //         <Image height={40} sx={{ minWidth: "100px" }} fit="contain" src={Logo} alt="SellScale Sight" />
    //         <Text ta={"center"} fz={22} fw={600}>
    //           SellScale Sight
    //         </Text>
    //         <Text c="dimmed" ta="center" size="sm">
    //           Work with your Sales AGI to access your contacts, campaigns, analytics, and more.
    //         </Text>
    //         <Divider w={"100%"} />
    //         <Box>
    //           {!checkEmail && (
    //             <form onSubmit={form.onSubmit(handleSubmit)}>
    //               <Text fw={600} align="center">
    //                 Log in to get started
    //               </Text>
    //               <LoadingOverlay visible={loading} overlayBlur={2} />

    //               <TextInput required placeholder={`Enter your email address`} {...form.getInputProps("email")} mt={"sm"} />

    //               {error && (
    //                 <Text color="red" size="sm" mt="sm">
    //                   {error}
    //                 </Text>
    //               )}

    //               <Button mt={"sm"} radius="md" type="submit" fullWidth>
    //                 Next
    //               </Button>
    //             </form>
    //           )}
    //           {checkEmail && (
    //             <>
    //               <Text ta="center" fw={500}>
    //                 A login link has been sent to your email.
    //               </Text>
    //               <Text ta="center" c="dimmed">
    //                 You may close this tab now.
    //               </Text>
    //             </>
    //           )}
    //         </Box>
    //         <Text size={"xs"} color="gray" align="center">
    //           SellScale Inc., 2024
    //         </Text>
    //       </Flex>
    //     </Modal>
    //   </BackgroundImage>
    // </Box>
  );
}
