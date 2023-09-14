import { userDataState } from "@atoms/userAtoms";
import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Container,
  Flex,
  Image,
  Text,
  Title,
} from "@mantine/core";
import { IconFolderShare, IconReload } from "@tabler/icons-react";
import { useRecoilValue } from "recoil";
import BlueBackground from '@assets/images/light-blue-background.jpg';
import { proxyURL } from "@utils/general";


const Overview = () => {

  const userData = useRecoilValue(userDataState);

  return (
    <Flex direction='column' p='md' maw='100%'>
      <Title order={3} mb={"0.25rem"}>
        LinkedIn Integration
      </Title>
      <Text c={"gray.6"} fz={"0.75rem"} mb={"1rem"}>
        By being connected to LinkedIn, SellScale is able to send connections,
        read, and respond to your conversations.
      </Text>
      <Flex direction='row'>
        <Card withBorder w='60%' mr={"1rem"}>
          <Card.Section
            sx={{
              display: "flex",
              position: "relative",
              justifyContent: "center",
            }}
            mb={"3rem"}
          >
            <Image
              src={userData?.li_cover_img_url || BlueBackground}
              height={75}
            />
            <Avatar
              sx={{ position: "absolute", bottom: "-2.5rem" }}
              size={"5rem"}
              radius={"2.5rem"}
              src={proxyURL(userData?.img_url)}
            />
          </Card.Section>

          <Flex
            align={"center"}
            gap={"0.75rem"}
            sx={{
              flexDirection: "column",
            }}
          >
            <Flex
              align={"center"}
              sx={{
                position: "relative",
              }}
              px={"0.5rem"}
            >
              <Text fw={"bold"} fz={"1rem"} ta={"center"} lh="1.25rem">
                {userData?.sdr_name}
              </Text>
            </Flex>

            <Text c={"gray.6"} fz={"0.75rem"} ta={"center"}>
              {userData?.sdr_title}
            </Text>
            {/* <Button
              variant="light"
              radius="xl"
              leftIcon={<IconReload size="1rem" />}
            >
              Reconnect
            </Button> */}
          </Flex>
        </Card>
        <Card withBorder w='40%' p={"1.5rem"}>
          <Flex
            align={"center"}
            sx={{
              flexDirection: "column",
            }}
            gap={"0.75rem"}
          >
            <Text
              fw={"bold"}
              fz={"1rem"}
              tt={"uppercase"}
              ta={"center"}
              lh="1.25rem"
            >
              LINKEDIN HEALTH
            </Text>
            <Text c={"gray.6"} fz={"0.75rem"} ta={"center"}>
              {
                userData.li_health < 100 ? 
                "Improve your score for better deliverability & reply-rate."
                :
                "Your LinkedIn profile is in great health!"
              }
            </Text>
            <Button
              variant="light"
              color={userData.li_health < 100 ? "orange" : "green"} 
              h={"auto"}
              radius="lg"
              fz={"3rem"}
              py={"1rem"}
              fw={"bold"}
            >
              {userData.li_health}%
            </Button>
            {/* <Button
              variant="outline"
              color="green"
              radius="xl"
              fullWidth
              fw={"bold"}
            >
              Improve Your Score
            </Button> */}
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
};

export default Overview;
