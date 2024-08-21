import ICPFitPill from "@common/pipeline/ICPFitAndReason";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Flex,
  Modal,
  Stack,
  Text,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { nameToInitials, proxyURL, valueToColor } from "@utils/general";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { PersonaOverview, Prospect } from "src";
import PersonaSelect from "./PersonaSplitSelect";
import { useRecoilValue } from "recoil";
import { currentProjectState } from "@atoms/personaAtoms";
import { postBulkActionMove } from "@utils/requests/postBulkAction";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";

type PropsType = {
  selectedProspects: any[];
  backFunc: () => void;
};

export default function BulkActions(props: PropsType) {
  return (
    <MovePersonaAction
      selectedProspects={props.selectedProspects}
      backFunc={props.backFunc}
    />
  );
}

type MovePersonaActionPropsType = {
  selectedProspects: any[];
  backFunc?: () => void;
  mx?: string;
};

const MovePersonaAction = ({
  selectedProspects,
  backFunc,
  mx,
}: MovePersonaActionPropsType) => {
  const theme = useMantineTheme();
  const currentProject = useRecoilValue(currentProjectState);
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [
    movePersonaOpened,
    { open: openMovePersona, close: closeMovePersona },
  ] = useDisclosure(false);
  const [targetPersona, setTargetPersona] =
    useState<{ archetype_id: number; archetype_name: string }[]>();
  const [movableProspects, setMovableProspects] = useState<any[]>([]);
  const [shownRecords, setShownRecords] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const triggerPostBulkActionMove = async () => {
    setLoading(true);

    if (!targetPersona) {
      showNotification({
        title: "Error",
        message: "Please select a Persona to move your Prospects to",
        color: "red",
        autoClose: 5000,
      });
      setLoading(false);
      return;
    }
    const result = await postBulkActionMove(
      userToken,
      targetPersona[0].archetype_id,
      movableProspects.map((x) => x.id)
    );
    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Prospects moved successfully",
        color: "green",
        autoClose: 5000,
      });
      setLoading(false);
      backFunc?.();
      closeMovePersona();
    } else {
      showNotification({
        title: "Error",
        message: "Prospects could not be moved",
        color: "red",
        autoClose: 5000,
      });
    }

    setLoading(false);
  };

  // Only allow Prospects that are in PROSPECTED state to be moved
  useEffect(() => {
    const filteredProspects = selectedProspects; //.filter(x => x.status === 'PROSPECTED')
    setMovableProspects(filteredProspects);
    setPage(1);
    setShownRecords(filteredProspects.slice(0, 10));
  }, [selectedProspects]);

  // Page updates should update the shown records
  useEffect(() => {
    setShownRecords(movableProspects.slice((page - 1) * 10, page * 10));
  }, [page]);

  // On mount, calculate the initial shown records
  useEffect(() => {
    const filteredProspects = selectedProspects; //.filter(x => x.status === 'PROSPECTED')
    setMovableProspects(filteredProspects);
    setPage(1);
    setShownRecords(filteredProspects.slice(0, 10));
  }, []);

  return (
    <Flex mx={mx}>
      <Button size="sm" color="orange" onClick={openMovePersona}>
        Move Persona
      </Button>
      <Modal
        opened={movePersonaOpened}
        onClose={closeMovePersona}
        title="Move Persona"
        size="xl"
      >
        <Text>
          You can move your selected Prospects into a different Persona.
        </Text>
        <Flex mt="md" mb="lg">
          <PersonaSelect
            disabled={movableProspects.length === 0}
            onChange={(persona) => setTargetPersona(persona)}
            selectMultiple={false}
            label={"Select Target Persona"}
            description={"Select the Persona you wish to move contacts to"}
            exclude={[currentProject?.id as number]}
          />
        </Flex>

        {movableProspects.length === 0 ? (
          <Text color="red" mt="md">
            No Prospects in valid state to move. Please select Prospects that
            are in Prospected state.
          </Text>
        ) : (
          <DataTable
            style={{
              border: "1px dashed orange",
              borderRadius: 5,
            }}
            mt="md"
            height={"300px"}
            withBorder
            records={shownRecords || []}
            page={page}
            onPageChange={(p) => {
              const beginning = (page - 1) * 10;
              setShownRecords(
                movableProspects.slice(beginning, beginning + 10)
              );
              setPage(p);
            }}
            totalRecords={movableProspects.length}
            recordsPerPage={10}
            paginationSize="xs"
            paginationColor="orange"
            columns={[
              {
                accessor: "full_name",
                render: (x: any) => {
                  return (
                    <Flex>
                      <Avatar
                        src={proxyURL(x.img_url)}
                        alt={x.full_name}
                        color={valueToColor(theme, x.full_name)}
                        radius="lg"
                        size={30}
                      >
                        {nameToInitials(x.full_name)}
                      </Avatar>
                      <Text ml="md">{x.full_name}</Text>
                    </Flex>
                  );
                },
              },
              {
                accessor: "company",
              },
              {
                accessor: "title",
              },
              {
                accessor: "icp_fit_score",
                title: <Text>ICP Fit</Text>,
                render: ({ icp_fit_score, icp_fit_reason }) => {
                  return (
                    <>
                      <ICPFitPill
                        icp_fit_score={icp_fit_score}
                        icp_fit_reason={icp_fit_reason}
                      />
                    </>
                  );
                },
              },
            ]}
          />
        )}

        <Flex mt="md" justify="flex-end">
          <Button
            loading={loading}
            disabled={targetPersona === undefined}
            color="orange"
            onClick={triggerPostBulkActionMove}
          >
            Move Prospects
          </Button>
        </Flex>
      </Modal>
    </Flex>
  );
};
