import { Group, Paper, Stack, Image, Flex, Text, Button } from "@mantine/core";
import LogoImg from "@assets/images/logo.svg";
import { getBrowserExtensionURL } from "@utils/general";
import { IconCloudDownload } from "@tabler/icons";
import FlexSeparate from "./FlexSeparate";

export default function ConnectEmailCard() {

  return (
    <Paper withBorder px="xs" pt={0} pb="xs" radius="md">
      <Stack spacing={5}>
        <FlexSeparate>
          <Stack spacing={0}>
            <Flex
              wrap="nowrap"
              onClick={() => {
                window.location.href = "/";
              }}
              pt="xs"
              className="cursor-pointer"
              sx={{ userSelect: "none" }}
            >
              <Image
                height={26}
                fit="contain"
                src={LogoImg}
                alt="SellScale Sight"
              />
            </Flex>
            <Text color="#6be600" fz="sm" ta="center" fs="italic" pl={15}>
              Email Sync
            </Text>
          </Stack>
        </FlexSeparate>
        <Group>
          <Text size="sm">
            You do not have your email connected to SellScale. In order to view replies and keep track of prospects, please connect it by visiting your settings page.
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
