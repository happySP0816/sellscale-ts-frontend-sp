import {
  Button,
  Modal,
  ModalProps,
  Text,
  Textarea,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconEdit, IconExternalLink } from "@tabler/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { FC, useEffect, useState } from "react";
import { Flex, NumberInput } from "@mantine/core";
import moment from "moment";
import { DataGrid } from "mantine-data-grid";
import { useClickOutside } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { patchWarmupSchedule } from "@utils/requests/patchWarmupSchedule";
import displayNotification from "@utils/notificationFlow";

type Props = ModalProps & {
  data: {
    labels: string[];
    volume: number[];
    dates: { start_date: string; end_date: string }[];
    ids: number[];
    linkedinSpecialNotes: string[];
  };
  backFunction: () => void;
};

const WarmupScheduleModal: FC<Props> = (props) => {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const theme = useMantineTheme();
  const [currentEditVolumeIndex, setCurrentEditVolumeIndex] = useState<
    null | number
  >(null);
  const [currentEditNotesIndex, setCurrentEditNotesIndex] = useState<
    null | number
  >(null);
  const [openedVolumeEdit, setOpenedVolumeEdit] = useState(false);
  const [openedNotesEdit, setOpenedNoteEdit] = useState(false);
  const ref = useClickOutside(() => {
    setOpenedVolumeEdit(false);
    setCurrentEditVolumeIndex(null);
    setCurrentEditNotesIndex(null);
  });

  const form = useForm({
    initialValues: {
      volume: props.data.volume,
      sendPerWeek: userData.weekly_li_outbound_target,
      linkedinSpecialNotes: props.data.linkedinSpecialNotes,
    },
  });

  // Set the form values
  useEffect(() => {
    form.setValues({
      volume: props.data.volume,
      sendPerWeek: userData.weekly_li_outbound_target,
      linkedinSpecialNotes: props.data.linkedinSpecialNotes,
    });
  }, [props.data.volume]);

  const handleSave = async () => {
    // Combine the form values with the ids
    const schedule_volume_map = props.data.ids.map((id, idx) => ({
      schedule_id: id,
      linkedin_volume: form.values.volume[idx],
      linkedin_special_notes: form.values.linkedinSpecialNotes[idx],
      updated:
        props.data.volume[idx] !== form.values.volume[idx] ||
        props.data.linkedinSpecialNotes[idx] !==
          form.values.linkedinSpecialNotes[idx],
    }));

    await displayNotification(
      "update_outbound_schedule",
      async () => {
        let result = await patchWarmupSchedule(
          userToken,
          schedule_volume_map,
          form.values.sendPerWeek
        );

        if (result.status === "success") {
          // Refresh on success
          props.backFunction();
          // Update the user data
          setUserData((prev: any) => ({
            ...prev,
            weekly_li_outbound_target: form.values.sendPerWeek,
          }));
        }

        return result;
      },
      {
        title: `Updating your Outbound schedule...`,
        message: `Working with servers...`,
        color: "teal",
      },
      {
        title: `Your Outbound schedule has been updated.`,
        message: `You can now see the changes in your dashboard.`,
        color: "teal",
      },
      {
        title: `Failed to update your Outbound schedule.`,
        message: `Please try again later.`,
        color: "red",
      }
    );
  };

  return (
    <Modal
      {...props}
      title="Linkedin Warmup Schedule"
      size={"xl"}
      styles={{
        title: {
          color: theme.colors.blue[6],
          fontWeight: 700,
          fontSize: "1.25rem",
        },
      }}
    >
      <form onSubmit={form.onSubmit((values) => console.log(values))}>
        <DataGrid
          data={props.data?.labels?.map((v, idx) => ({
            weekName: v,
            data: props.data.volume[idx],
            date: {
              start_date: props.data.dates[idx].start_date,
              end_date: props.data.dates[idx].end_date,
            },
          }))}
          highlightOnHover
          withSorting
          withBorder
          sx={{ cursor: "pointer" }}
          columns={[
            {
              accessorKey: "weekName",
              header: "Week",
              cell: (cell) => {
                return (
                  <Text fw={600} fz={"sm"}>
                    {cell.cell?.getValue<string>()}
                  </Text>
                );
              },
            },
            {
              accessorKey: "date",
              header: "Date Period",
              cell: (cell) => {
                return (
                  <Text fw={600} fz={"sm"}>
                    <Text fz={"sm"}>
                      {moment(
                        cell.cell.getValue<{
                          start_date: string;
                          end_date: string;
                        }>().start_date
                      ).format("MMMM D")}{" "}
                      -{" "}
                      {moment(
                        cell.cell.getValue<{
                          start_date: string;
                          end_date: string;
                        }>().end_date
                      ).format("MMMM D")}
                    </Text>
                  </Text>
                );
              },
            },
            {
              accessorKey: "volume",
              header: "Volume",

              cell: (cell) => {
                const endDate = cell.row.getValue<{
                  start_date: string;
                  end_date: string;
                }>("date").end_date;

                if (cell.row.index === currentEditVolumeIndex) {
                  return (
                    <Flex
                      align={"center"}
                      ref={ref}
                      onClick={() => setOpenedVolumeEdit(true)}
                    >
                      <NumberInput
                        autoFocus={openedVolumeEdit}
                        value={form.values.volume[cell.row.index]}
                        onChange={(v) => {
                          form.setValues({
                            volume: form.values.volume.map((i, idx) => {
                              if (idx === cell.row.index) {
                                if (v === 0) {
                                  return 0;
                                }
                                return Number(v);
                              }
                              return i;
                            }),
                          });
                        }}
                        min={0}
                      />
                    </Flex>
                  );
                }

                const endingDate = new Date(endDate);
                const nextMonday = moment().day(1).add(7, "days").toDate();

                return (
                  <Flex align={"center"} gap={"xs"}>
                    <Text
                      fw={600}
                      fz={"sm"}
                      color={
                        props.data.volume[cell.row.index] !=
                        form.values.volume[cell.row.index]
                          ? "green"
                          : "black"
                      }
                      onClick={() => {
                        if (endingDate < nextMonday) {
                          return;
                        }
                        setCurrentEditVolumeIndex(cell.row.index);
                      }}
                    >
                      {form.values.volume[cell.row.index]}{" "}
                      <Text
                        component="span"
                        color={
                          props.data.volume[cell.row.index] !=
                          form.values.volume[cell.row.index]
                            ? "green"
                            : "grey.6"
                        }
                      >
                        Messages
                      </Text>
                    </Text>
                    {endingDate >= nextMonday && (
                      <Tooltip
                        label={
                          endingDate < nextMonday
                            ? "Cannot edit past volume"
                            : "Edit Volume"
                        }
                      >
                        <div>
                          <Button
                            color="gray"
                            size="sm"
                            variant="subtle"
                            disabled={endingDate < nextMonday}
                            onClick={() =>
                              setCurrentEditVolumeIndex(cell.row.index)
                            }
                            compact
                            px={"0"}
                          >
                            <IconEdit size={"0.8rem"} />
                          </Button>
                        </div>
                      </Tooltip>
                    )}
                  </Flex>
                );
              },
            },
            {
              accessorKey: "linkedinSpecialNotes",
              header: "Notes",
              cell: (cell) => {
                const endDate = cell.row.getValue<{
                  start_date: string;
                  end_date: string;
                }>("date").end_date;
                const endingDate = new Date(endDate);
                const nextMonday = moment().day(1).add(7, "days").toDate();

                if (cell.row.index === currentEditNotesIndex) {
                  return (
                    <Flex
                      align={"center"}
                      ref={ref}
                      onClick={() => setOpenedNoteEdit(true)}
                    >
                      <Textarea
                        autoFocus={openedNotesEdit}
                        value={form.values.linkedinSpecialNotes[cell.row.index]}
                        onChange={(e) => {
                          form.setValues({
                            linkedinSpecialNotes:
                              form.values.linkedinSpecialNotes.map((i, idx) => {
                                if (idx === cell.row.index) {
                                  return e.target.value || "";
                                }
                                return i;
                              }),
                          });
                        }}
                        onFocus={(event) => {
                          var val = event.target.value;
                          event.target.value = "";
                          event.target.value = val;
                        }}
                      />
                    </Flex>
                  );
                }

                return (
                  <Flex
                    align={"center"}
                    gap={"xs"}
                    w="100%"
                    maw="100%"
                    wrap="wrap"
                  >
                    {form.values.linkedinSpecialNotes[cell.row.index] ? (
                      <Text
                        w="100%"
                        fw={600}
                        fz={"sm"}
                        color={
                          props.data.linkedinSpecialNotes[cell.row.index] !=
                          form.values.linkedinSpecialNotes[cell.row.index]
                            ? "green"
                            : "black"
                        }
                        onClick={() => {
                          if (endingDate < nextMonday) {
                            return;
                          }
                          setCurrentEditNotesIndex(cell.row.index);
                        }}
                      >
                        {form.values.linkedinSpecialNotes[cell.row.index]}
                      </Text>
                    ) : (
                      <></>
                    )}
                    {endingDate >= nextMonday &&
                      !(
                        props.data.linkedinSpecialNotes[cell.row.index] !=
                        form.values.linkedinSpecialNotes[cell.row.index]
                      ) && (
                        <Tooltip label={"Edit Notes"}>
                          <div>
                            <Button
                              color="gray"
                              size="sm"
                              variant="subtle"
                              disabled={endingDate < nextMonday}
                              onClick={() =>
                                setCurrentEditNotesIndex(cell.row.index)
                              }
                              compact
                              px={"0"}
                            >
                              <IconEdit size={"0.8rem"} />
                            </Button>
                          </div>
                        </Tooltip>
                      )}
                  </Flex>
                );
              },
            },
          ]}
          options={{
            enableFilters: true,
          }}
          styles={(theme) => ({
            thead: {
              height: "44px",
              backgroundColor: theme.colors.gray[0],
              "::after": {
                backgroundColor: "transparent",
              },
            },
            headerCellContent: {
              color: theme.colors.gray[8],
            },
          })}
        />
      </form>

      <Flex
        sx={(theme) => ({
          border: `1px solid ${theme.colors.yellow[6]}`,
          backgroundColor: theme.colors.yellow[0],
          borderRadius: 12,
        })}
        p={"sm"}
      >
        <Flex align={"center"} gap={"md"}>
          <Text fw={700}>Maximum Messages Sent Per Week</Text>

          <NumberInput
            min={0}
            styles={{
              input: {
                color: form.values.sendPerWeek != userData.weekly_li_outbound_target ? "green" : "black",
              },
            }}
            type="number"
            onChange={(v) => {
              // Convert to number if it's a string
              if (typeof v === "string") {
                v = Number(v);
              }

              form.setValues({
                sendPerWeek: v,
              });
            }}
            value={form.values.sendPerWeek}
          />
        </Flex>
      </Flex>

      <Flex gap={"md"} mt={"md"}>
        <Button
          variant={"outline"}
          sx={{ flex: 1 }}
          color="gray"
          onClick={() => props.onClose()}
        >
          Go Back
        </Button>
        <Button sx={{ flex: 1 }} onClick={handleSave}>
          Save
        </Button>
      </Flex>
    </Modal>
  );
};

export default WarmupScheduleModal;
