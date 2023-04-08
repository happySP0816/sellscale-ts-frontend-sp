import { currentPersonaIdState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import FlexSeparate from "@common/library/FlexSeparate";
import PersonaDetailsDrawer from "@drawers/PersonaDetailsDrawer";
import UploadDetailsDrawer from "@drawers/UploadDetailsDrawer";
import {
  List,
  ThemeIcon,
  Text,
  Container,
  Stack,
  Flex,
  Title,
  useMantineTheme,
  Drawer,
  Group,
  Divider,
  Paper,
  LoadingOverlay,
  Button,
  Avatar,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import PageTitle from "@nav/PageTitle";
import { IconCornerRightUp, IconUserPlus } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import getPersonas, { getAllUploads } from "@utils/requests/getPersonas";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import PersonaCard from "../common/persona/PersonaCard";
import PersonaUploadDrawer from "../drawers/PersonaUploadDrawer";

export default function PersonaPage() {
  setPageTitle(`Personas`);

  const userToken = useRecoilValue(userTokenState);

  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.extra as Archetype[]) : [];

      for (let persona of result) {
        const uploadsResponse = await getAllUploads(userToken, persona.id);
        persona.uploads =
          uploadsResponse.status === "success" ? uploadsResponse.extra : [];
      }

      // const activePersonas = result.filter((p) => p.active);
      // if (activePersonas.length === 1) {
      //   setCurrentPersonaId(activePersonas[0].id);
      // }

      // Sort by number of prospects
      return result.sort((a, b) => {
        const b_total_prospects = b.performance ? b.performance.total_prospects : 0;
        const a_total_prospects = a.performance ? a.performance.total_prospects : 0;
        return b_total_prospects - a_total_prospects;
      });
    },
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <PageFrame>
        <LoadingOverlay visible={isFetching} overlayBlur={2} />
        <FlexSeparate alignItems="flex-end">
          <PageTitle title="Personas" mb={false} />
          <Button
            mx="sm"
            rightIcon={<IconUserPlus size="1rem" />}
            variant="outline"
            radius="lg"
            color="teal"
            size="xs"
            onClick={() => {
              openContextModal({
                modal: "uploadProspects",
                title: <Title order={3}>Create Persona</Title>,
                innerProps: { mode: "CREATE-ONLY" },
              });
            }}
          >
            Create New Persona
          </Button>
        </FlexSeparate>
        {data && (
          <>
            {data?.length && data?.length > 0 ? (
              <div>
                {data
                  ?.filter((p) => p.active)
                  .map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      archetype={persona}
                      refetch={refetch}
                    />
                  ))}
                {data
                  ?.filter((p) => !p.active)
                  .map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      archetype={persona}
                      refetch={refetch}
                    />
                  ))}
              </div>
            ) : (
              <Paper withBorder m="xl" p="md" radius="md">
                <FlexSeparate>
                  <Group>
                    <Title order={3}>Create Your First Persona</Title>
                    <Text fs="italic">
                      A persona is a way to structure your contacts into various
                      ‘ICPs’ (ideal customer profiles).
                    </Text>
                  </Group>
                  <Avatar
                    size={70}
                    styles={{
                      placeholder: {
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    <IconCornerRightUp size="10rem" stroke={1} />
                  </Avatar>
                </FlexSeparate>
              </Paper>
            )}
          </>
        )}
      </PageFrame>
      <PersonaDetailsDrawer personas={data} />
      <PersonaUploadDrawer personas={data} />
      <UploadDetailsDrawer />
    </>
  );
}
