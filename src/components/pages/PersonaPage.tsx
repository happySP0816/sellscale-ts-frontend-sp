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
import { useForceUpdate, useMediaQuery } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import PageTitle from "@nav/PageTitle";
import { IconCornerRightUp, IconUserPlus } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import getPersonas, {
  getAllUploads,
  getPersonasOverview,
} from "@utils/requests/getPersonas";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype, PersonaOverview } from "src";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";
import PersonaCard from "../common/persona/PersonaCard";
import PersonaUploadDrawer from "../drawers/PersonaUploadDrawer";
import { useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { currentProjectState } from "@atoms/personaAtoms";

export default function PersonaPage() {
  setPageTitle(`Personas`);

  const forceUpdate = useForceUpdate();
  const userToken = useRecoilValue(userTokenState);

  const currentProject = useRecoilValue(currentProjectState);

  const loaderData: any = useLoaderData();
  const personaId = loaderData?.personaId;

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonasOverview(userToken);
      const result =
        response.status === "success"
          ? (response.data as PersonaOverview[])
          : [];
      if (personaId) {
        return result.filter((p) => p.id === parseInt(personaId));
      }

      return result;
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;
    (async () => {
      for (let persona of data) {
        if (persona.active) {
          const uploadsResponse = await getAllUploads(userToken, persona.id);
          persona.uploads =
            uploadsResponse.status === "success" ? uploadsResponse.data : [];
        }
      }
      forceUpdate();
    })();
  }, [data]);

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
                {/* Unassigned Persona First */}
                {data
                  ?.filter((p) => p.is_unassigned_contact_archetype)
                  .map((persona) => {
                    return (
                      <PersonaCard
                        key={persona.id}
                        personaOverview={persona}
                        refetch={refetch}
                        unassignedPersona
                        allPersonas={data || []}
                      />
                    );
                  })}
                {/* Active Normal Personas */}
                {data
                  ?.filter(
                    (p) => p.active && !p.is_unassigned_contact_archetype
                  )
                  .map((persona) => {
                    return (
                      <PersonaCard
                        key={persona.id}
                        personaOverview={persona}
                        refetch={refetch}
                        unassignedPersona={false}
                        allPersonas={data || []}
                      />
                    );
                  })}
                {/* Inactive Normal Personas */}
                {data
                  ?.filter(
                    (p) => !p.active && !p.is_unassigned_contact_archetype
                  )
                  .map((persona) => (
                    <PersonaCard
                      key={persona.id}
                      personaOverview={persona}
                      refetch={refetch}
                      unassignedPersona={false}
                      allPersonas={data || []}
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
      <PersonaDetailsDrawer personaOverviews={data} />
      <PersonaUploadDrawer personaOverviews={data} afterUpload={refetch}/>
      <UploadDetailsDrawer />
    </>
  );
}
