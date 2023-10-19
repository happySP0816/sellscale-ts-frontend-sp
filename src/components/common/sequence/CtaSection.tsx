import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import {
  Box,
  Title,
  Button,
  useMantineTheme,
  LoadingOverlay,
  Stack,
  Flex,
  Text,
  ScrollArea,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { valueToColor } from "@utils/general";
import toggleCTA from "@utils/requests/toggleCTA";
import _ from "lodash";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { CTA } from "src";
import { showNotification } from "@mantine/notifications";
import { deleteCTA } from "@utils/requests/createCTA";
import { CTAOption } from "./CTAOption";
import { IconChevronDown, IconChevronsUp } from "@tabler/icons";

export const CtaSection = (props: {
  onCTAsLoaded: (ctas: CTA[]) => void;
  outlineCTA?: string;
}) => {
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);
  const [ctaActiveStatusesToShow, setCtaActiveStatusesToShow] = useState<
    boolean[]
  >([true]);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-cta-data-${currentProject?.id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(
        `${API_URL}/client/archetype/${currentProject?.id}/get_ctas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.ctas) {
        return [];
      }

      let pageData = (res.ctas as CTA[]).map((cta) => {
        return {
          ...cta,
          percentage: cta.performance?.total_count
            ? Math.round(
                (cta.performance?.num_converted / cta.performance?.num_sent) *
                  100
              )
            : 0,
          total_responded: cta.performance?.num_converted,
          total_count: cta.performance?.num_sent,
        };
      });
      props.onCTAsLoaded(pageData);
      if (!pageData) {
        return [];
      } else {
        return _.sortBy(pageData, ["active", "percentage", "id"]).reverse();
      }
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject,
  });

  return (
    <Box pt="md" sx={{ position: "relative" }}>
      <LoadingOverlay visible={isFetching} zIndex={10} />

      <Box
        pb={"lg"}
        sx={(theme) => ({
          border: `1px solid ${theme.colors.blue[2]}`,
          borderRadius: 12,
        })}
      >
        <Flex
          bg={"blue"}
          p={"lg"}
          justify={"space-between"}
          style={{
            borderStartEndRadius: 12,
            borderStartStartRadius: 12,
          }}
        >
          <Text color="white" fw={600} size={"md"}>
            CTA Settings
          </Text>

          <ThemeIcon>
            <IconChevronsUp />
          </ThemeIcon>
        </Flex>
        <Box px={"lg"}>
          <ScrollArea h={"30vh"}>
            <Stack spacing="lg" pt={20} pr="lg">
              {ctaActiveStatusesToShow.map((ctaActive) => {
                return (
                  data &&
                  data
                    .filter((e) => e.active == ctaActive)
                    .map((e, index) => (
                      <CTAOption
                        acceptance={{
                          percentage: e.percentage,
                          total_responded: e.total_responded,
                          total_count: e.total_count,
                        }}
                        data={{
                          id: e.id,
                          label: e.text_value,
                          description: "",
                          checked: e.active,
                          type: e.cta_type,
                          outlined:
                            !!props.outlineCTA &&
                            props.outlineCTA === e.text_value,

                          tags: [
                            {
                              label: "Acceptance:",
                              highlight: e.percentage + "%",
                              color: "blue",
                              variant: "subtle",
                              hovered:
                                "Prospects: " +
                                e.total_responded +
                                "/" +
                                e.total_count,
                            },
                            {
                              label: e.cta_type,
                              highlight: "",
                              color: valueToColor(theme, e.cta_type),
                              variant: "light",
                            },
                          ],
                        }}
                        autoMarkScheduling={
                          e.auto_mark_as_scheduling_on_acceptance
                        }
                        key={index}
                        onToggle={async (enabled) => {
                          const result = await toggleCTA(userToken, e.id);
                          if (result.status === "success") {
                            await refetch();
                          }
                        }}
                        onClickEdit={() => {
                          openContextModal({
                            modal: "editCTA",
                            title: <Title order={3}>Edit CTA</Title>,
                            innerProps: {
                              personaId: currentProject?.id,
                              cta: e,
                            },
                          });
                        }}
                        onClickDelete={async () => {
                          const response = await deleteCTA(userToken, e.id);
                          if (response.status === "success") {
                            showNotification({
                              title: "Success",
                              message: "CTA has been deleted",
                              color: "blue",
                            });
                          }
                          refetch();
                        }}
                      />
                    ))
                );
              })}
            </Stack>
          </ScrollArea>
          {/* Active CTAs Only */}

          <Divider
            my="lg"
            role="button"
            style={{ cursor: "pointer" }}
            onClick={() => {
              if (ctaActiveStatusesToShow.length > 1) {
                setCtaActiveStatusesToShow([true]);
              } else {
                setCtaActiveStatusesToShow([true, false]);
              }
            }}
            variant="solid"
            labelPosition="center"
            label={
              <>
                <Box mr={10}>
                  <Text fw={700} color="gray.5" size={"sm"}>
                    {ctaActiveStatusesToShow.length > 1
                      ? "Hide Inactive CTAs"
                      : "Show " +
                        data?.filter((e) => !e.active).length +
                        " Inactive CTAs"}
                  </Text>
                </Box>
                <ThemeIcon variant="light" color="gray" radius="lg">
                  <IconChevronDown size={12} />
                </ThemeIcon>
              </>
            }
          />

          <Flex justify={"center"}>
            <Button
              variant={"light"}
              size="sm"
              w={"50%"}
              color={"green"}
              radius="xl"
              fw={"700"}
              leftIcon={<IconPlus />}
              onClick={() => {
                openContextModal({
                  modal: "createNewCTA",
                  title: <Title order={3}>Create CTA</Title>,
                  innerProps: {
                    personaId: currentProject?.id,
                  },
                });
              }}
            >
              Add More CTAs
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};
