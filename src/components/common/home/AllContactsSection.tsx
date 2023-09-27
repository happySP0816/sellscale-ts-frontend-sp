import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Container,
  Flex,
  Group,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconUpload, IconUserPlus } from "@tabler/icons";
import { useMediaQuery } from "@mantine/hooks";
import { API_URL, SCREEN_SIZES } from "@constants/data";
import PipelineSelector, { icons } from "../pipeline/PipelineSelector";
import ProspectTable_old from "../pipeline/ProspectTable_old";
import PageFrame from "@common/PageFrame";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { useLoaderData, useNavigate } from "react-router-dom";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectShowPurgatoryState,
} from "@atoms/prospectAtoms";
import { useEffect, useState } from "react";
import {
  currentProjectState,
  uploadDrawerOpenState,
} from "@atoms/personaAtoms";
import PersonaUploadDrawer from "@drawers/PersonaUploadDrawer";
import { getAllUploads } from "@utils/requests/getPersonas";
import {
  prospectUploadDrawerIdState,
  prospectUploadDrawerOpenState,
} from "@atoms/uploadAtoms";
import UploadDetailsDrawer from "@drawers/UploadDetailsDrawer";
import { navigateToPage } from "@utils/documentChange";
import { ProjectSelect } from "@common/library/ProjectSelect";

function getPipelineSelectorData(data: any) {
  return new Map()
    .set("all", {
      title: "All Prospects",
      description: "All prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.SENT_OUTREACH || "-",
      color: "blue",
    })
    .set("accepted", {
      title: "Accepted",
      description: "Accepted prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.ACCEPTED || "-",
      color: "green",
    })
    .set("bumped", {
      title: "Bumped",
      description: "Bumped prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.BUMPED || "-",
      color: "orange",
    })
    .set("active", {
      title: "Active Convos",
      description: "Active conversations in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.ACTIVE_CONVO || "-",
      color: "yellow",
    })
    .set("demo", {
      title: "Demo Set",
      description: "Demo set prospects in the pipeline",
      icon: IconUserPlus,
      value: data?.pipeline_data?.SELLSCALE.DEMO || "-",
      color: "grape",
    });
}

export default function AllContactsSection(props: { all?: boolean }) {
  const [currentProject, setCurrentProject] =
    useRecoilState(currentProjectState);
  const { prospectId } = useLoaderData() as {
    prospectId: string;
  };
  const [showPipelineSelector, setShowPipelineSelector] = useState(false);
  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);
  useEffect(() => {
    if (prospectId && prospectId.trim().length > 0) {
      setProspectId(+prospectId.trim());
      setOpened(true);
    }
  }, [prospectId]);

  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );
  const openUploadProspects = () => {
    setUploadDrawerOpened(true);
  };

  const userToken = useRecoilValue(userTokenState);
  const showPurgatory = useRecoilValue(prospectShowPurgatoryState);
  const [loadingData, setLoadingData] = useState(false);

  const [uploads, setUploads] = useState<any[]>([]);
  const [fetchedUploads, setFetchedUploads] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-pipeline-details`, { showPurgatory }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { showPurgatory }] = queryKey;

      setLoadingData(true);
      const response = await fetch(
        `${API_URL}/analytics/pipeline/all_details?include_purgatory=${showPurgatory}`,
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

      setLoadingData(false);

      return res;
    },
    refetchOnWindowFocus: false,
  });

  const navigate = useNavigate();
  const [prospectUploadDrawerOpened, setProspectUploadDrawerOpened] =
    useRecoilState(prospectUploadDrawerOpenState);
  const [prospectUploadDrawerId, setProspectUploadDrawerId] = useRecoilState(
    prospectUploadDrawerIdState
  );
  const isUploading =
    currentProject?.uploads &&
    currentProject?.uploads.length > 0 &&
    currentProject?.uploads[0].stats.in_progress > 0;

  const openUploadHistory = () => {
    setProspectUploadDrawerId(
      currentProject?.uploads && currentProject?.uploads[0].id
    );
    setProspectUploadDrawerOpened(true);
  };

  const fetchUploads = () => {
    if (fetchedUploads) return;
    if (!currentProject) return;
    getAllUploads(userToken, currentProject?.id).then((res) => {
      setCurrentProject(Object.assign({ uploads: res.data }, currentProject));
    });
    setFetchedUploads(true);
  };
  fetchUploads();

  const PIPELINE_SELECTOR_DATA = getPipelineSelectorData(data);
  return (
    <div>
      <PersonaUploadDrawer
        personaOverviews={currentProject ? [currentProject] : []}
        afterUpload={() => {}}
      />

      <Collapse in={showPipelineSelector}>
        <PipelineSelector
          data={PIPELINE_SELECTOR_DATA}
          loadingData={loadingData}
        />
      </Collapse>

      <Group position="apart" mt="sm">
        <Box>
          <ProjectSelect onClick={(persona) => {
            navigateToPage(navigate, `/prioritize` + (persona ? `/${persona.id}` : ''));
          }} />
        </Box>
        <Box>
          <Box>
            <Button
              variant="subtle"
              color="gray"
              size="sm"
              mr="md"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setShowPipelineSelector(!showPipelineSelector);
              }}
            >
              {showPipelineSelector ? "Hide" : "Show"} Pipeline Selector +
            </Button>
          </Box>
          <Box>
            <Flex direction="row">
              {currentProject?.uploads && currentProject?.uploads.length > 0 ? (
                <>
                  <Button
                    variant="outline"
                    color="dark"
                    size="sm"
                    mr="md"
                    onClick={openUploadHistory}
                  >
                    {isUploading ? "Upload in Progress..." : "Latest Upload"}
                  </Button>
                </>
              ) : (
                ""
              )}
              {currentProject?.id && (
                <Button
                  variant="filled"
                  color="teal"
                  radius="md"
                  ml="auto"
                  mr="0"
                  rightIcon={<IconUpload size={14} />}
                  onClick={openUploadProspects}
                >
                  Upload New Prospects
                </Button>
              )}
            </Flex>
          </Box>
        </Box>
      </Group>

      <div style={{ paddingTop: 15 }}>
        <ProspectTable_old
          personaSpecific={props.all ? undefined : currentProject?.id}
        />
      </div>
      <UploadDetailsDrawer />
    </div>
  );
}
