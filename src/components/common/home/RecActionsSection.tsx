import { userDataState } from "@atoms/userAtoms";
import ComingSoonCard from "@common/library/ComingSoonCard";
import InstallExtensionCard from "@common/library/InstallExtensionCard";
import { Stack, Title, Group, Container, Button, Flex } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { useRecoilValue } from "recoil";

export default function RecActionsSection() {
  const userData = useRecoilValue(userDataState);

  return (
    <Stack>
      <div>
        <Title order={3}>To-Do's</Title>
        <Group>
          <ComingSoonCard h={300} />
        </Group>
      </div>
      <div>
        <Title order={3}>Quick Actions</Title>
        <Group>
          <Flex wrap="wrap">
            <div style={{ flex: "1 0 0" }}>
              <Container m="xs" p={0} w={"100%"}>
                <Stack spacing="xs">
                  {!userData.li_voyager_connected && <InstallExtensionCard />}
                  <Button
                    variant="light"
                    color="teal"
                    radius="md"
                    size="md"
                    fullWidth
                    onClick={() => {
                      openContextModal({
                        modal: "uploadProspects",
                        title: <Title order={3}>Upload Prospects</Title>,
                        innerProps: { mode: "ADD-ONLY" },
                      });
                    }}
                  >
                    Upload More Prospects
                  </Button>
                  <Button
                    variant="light"
                    color="teal"
                    radius="md"
                    size="md"
                    fullWidth
                    onClick={() => {
                      openContextModal({
                        modal: "sequenceWriter",
                        title: <Title order={3}>Sequence Writer</Title>,
                        innerProps: {},
                      });
                    }}
                  >
                    Create Sequence with AI
                  </Button>
                </Stack>
              </Container>
            </div>
          </Flex>
        </Group>
      </div>
    </Stack>
  );
}
