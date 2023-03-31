import { Group, Paper, Stack, Image, Flex, Text, Button } from "@mantine/core";
import LogoImg from "@assets/images/logo.svg";
import { getBrowserExtensionURL } from "@utils/general";
import { IconCloudDownload } from "@tabler/icons";
import FlexSeparate from "./FlexSeparate";

export default function InstallExtensionCard() {
  const usingFirefox = navigator.userAgent.search("Firefox") >= 0;

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
            <Text color="#6be600" fz="sm" ta="center" fs="italic">
              Browser Extension
            </Text>
          </Stack>
          <Button
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={getBrowserExtensionURL(usingFirefox)}
            my={10}
            variant="outline"
            color="green"
            size="sm"
            rightIcon={<IconCloudDownload size="1rem" />}
          >
            Install
          </Button>
        </FlexSeparate>
        <Group>
          <Text size="sm">
            With our browser extension, you can easily sync and automate your LinkedIn account directly with SellScale!
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
