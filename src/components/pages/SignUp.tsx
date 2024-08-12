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
import { notifications, showNotification } from "@mantine/notifications";
import { IconAt, IconInfoCircle } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { userDataState } from "@atoms/userAtoms";
import { LogoFull } from "@nav/Logo";
import { API_URL, EMAIL_REGEX } from "@constants/data";
import { setPageTitle } from "@utils/documentChange";
import Logo from "@assets/images/logo.png";
import LoginAsset from "@assets/images/login_asset.png";
import WhiteLogo from "@assets/images/whitelogo.png";
import Background from "@assets/images/login_bg.png";

export default function SignupPage() {
  setPageTitle(`SignUp`);
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const form = useForm({
    initialValues: {
      fullName: "",
      email: "",
    },
    validate: {
      fullName: (value) =>
        value.trim().length > 0 ? null : "Full name is required",
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  async function sendSignup(fullName: string, email: string) {
    const response = await fetch(`${API_URL}/client/selix_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
      }),
    });
  
    let result = await response.json().catch((err) => {
      console.error("Failed to parse response as JSON", err);
      showNotification({
        id: "auth-error",
        title: "Error",
        message: `Error: ${err}`,
        color: "red",
        autoClose: false,
      });
      // return null;
    });
  
    if (response.status === 200 && result?.data?.auth_token) {
      window.location.href = `https://app.sellscale.com/authenticate?stytch_token_type=direct&token=${result.data.auth_token}&redirect=selix_onboarding`;
    } else {
      console.error("Signup error:", result);
      // showNotification({
      //   id: "auth-error",
      //   title: "Error",
      //   message: `Error: ${result?.message || "An unexpected error occurred"}`,
      //   color: "red",
      //   autoClose: false,
      // });
      return { status: response.status, message: result?.data.message };
    }
  
    return { status: response.status, message: result?.message };
  }

  const handleSubmit = async (values: typeof form.values) => {
    if (form.validate().hasErrors) {
      return;
    }
    setError(null);
    handleSignup(values);
  };

  const handleSignup = async (values: typeof form.values) => {

    showNotification({
      color: "gray",
      title: "Creating Account...",
      message: "Hang tight, this may take a little while but it's worth the wait!",
    });

    setLoading(true);

    try {
      const { status, message } = await sendSignup(values.fullName, values.email);
      const res = { status, message };

      if (res?.status === 200) {
        console.log(status, message);
        console.log('res is', res);
        if (res?.message === "User already exists. Please log in instead.") {
          setShowLoginModal(true);
          return;
        }

        showNotification({
          color: "green",
          title: "Signup Successful",
          message: "Redirecting to onboarding...",
        });
        navigate("/selix_onboarding");
      } else {
        setError(res?.message || "Error signing up");
        showNotification({
          color: "red",
          title: "Error signing up",
          message: res?.message || "An unexpected error occurred",
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred");
      showNotification({
        color: "red",
        title: "Error signing up",
        message: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex h={"100%"}>

      <Modal
        opened={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="User already exists"
        size={"md"}
      >
        <Text>
          It looks like you already have an account with this email address. Please login to continue or try a different email.
        </Text>
        <Flex mt="md" gap="md">
          <Button
            onClick={() => {
              setShowLoginModal(false);
              navigate("/login");
            }}
          >
            Login
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowLoginModal(false)}
          >
            Try a Different Email
          </Button>
        </Flex>
      </Modal>


      <Flex
        className="absolute z-10"
        w={"50%"}
        h={"100%"}
        bg={"white"}
        style={{
          borderTopRightRadius: "16px",
          borderBottomRightRadius: "16px",
        }}
      >
        <Flex
          direction={"column"}
          gap={"md"}
          mx={100}
          justify={"center"}
          w={"100%"}
          h={"100%"}
        >
          <img src={WhiteLogo} className="bg-[#e25dee] w-10 p-2 rounded-full" />
          <Box>
            <Text fw={700} fz={22}>
              Create a SellScale account
            </Text>
            <Text size={"xs"} color="gray" fw={500}>
              Create an account to start chatting with Selix
            </Text>
          </Box>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              size="md"
              mt={"xl"}
              placeholder="John Doe"
              label="Full Name"
              {...form.getInputProps("fullName")}
              required
            />
            <TextInput
              size="md"
              mt={"xl"}
              placeholder="name@xyz.com"
              label="Email"
              {...form.getInputProps("email")}
              required
            />
            {error && (
              <Text color="red" size="sm" mt="sm">
                {error}
              </Text>
            )}
            <Button
              mt="md"
              size="lg"
              fullWidth
              className="bg-[#e25dee]"
              type="submit"
              loading={loading}
            >
              Create Account
            </Button>
          </form>
        </Flex>
      </Flex>
      <Flex w={"51%"} className="absolute top-0 bottom-0 right-0">
        <BackgroundImage h={"100%"} src={LoginAsset} />
      </Flex>
    </Flex>
  );
}