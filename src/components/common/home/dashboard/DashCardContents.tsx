import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import {
  Avatar,
  Flex,
  Text,
  Indicator,
  Group,
  Button,
  Collapse,
  Skeleton,
  Loader,
  LoadingOverlay,
  Stack,
  TextInput,
  Checkbox,
  Switch,
  Select,
  ScrollArea,
  Container,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Prospect } from "src";
import { showNotification } from "@mantine/notifications";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import { IconSend } from "@tabler/icons";
import { sendLinkedInMessage } from "@utils/requests/sendMessage";
import { addProspectNote } from "@utils/requests/addProspectNote";
import { updateChannelStatus } from "@common/prospectDetails/ProspectDetailsChangeStatus";
import { useQueryClient } from "@tanstack/react-query";
import { convertDateToLocalTime } from "@utils/general";
import { prospectDrawerIdState, prospectDrawerOpenState } from "@atoms/prospectAtoms";

export default function DashCardContents(props: {
  prospect: Prospect;
  includeNote?: boolean;
  includeQualified?: boolean;
  includeSchedule?: boolean;
}) {
  const userToken = useRecoilValue(userTokenState);
  const queryClient = useQueryClient();
  const [opened, setOpened] = useState(false);

  const [loading, setLoading] = useState(false);

  const [response, setResponse] = useState<string>("");
  const [purgatory, setPurgatory] = useState<boolean>(true);

  const li_convo =
    props.prospect.recent_messages.li_convo?.filter(
      (msg: any) => msg.thread_urn_id !== null
    ) ?? [];
  const latest_msgs = li_convo.sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latest_msg = latest_msgs[0];

  // Msgs scroll view
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (opened) {
      viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
    }
  }, [opened]);

  // Optional props
  const [note, setNote] = useState<string>("");
  const [qualified, setQualified] = useState<boolean>(true);
  const [schedule, setSchedule] = useState<string>("");

  // Prospect Drawer
  const [_opened, setDrawerOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const getMessage = (
    full_name: string,
    img_url: string,
    message: string,
    date: string
  ) => (
    <Flex justify="space-between" sx={{ position: "relative" }}>
      <div>
        <Indicator
          dot
          inline
          size={12}
          offset={5}
          position="top-end"
          color="violet"
          withBorder
        >
          <Avatar size="md" radius="xl" src={img_url} />
        </Indicator>
      </div>
      <div style={{ flexGrow: 1, marginLeft: 10 }}>
        <Text fw={700} fz="sm">
          {full_name}
        </Text>
        <Text fz="sm">{message.trim()}</Text>
      </div>
      <Text
        fz={10}
        fs="italic"
        c="dimmed"
        sx={{ position: "absolute", top: 0, right: 0 }}
      >
        {convertDateToLocalTime(new Date(date))}
      </Text>
    </Flex>
  );

  if(!latest_msg){
    return <></>;
  }

  return (
    <>
      {opened ? (
        <ScrollArea h={200} viewportRef={viewport}>
          {latest_msgs.reverse().map((msg: any, i: number) => (
            <Container px={0} py={10} key={i}>
              {getMessage(
                msg.author,
                msg.img_url,
                msg.message,
                msg.date
              )}
            </Container>
          ))}
        </ScrollArea>
      ) : (
        <>
          {getMessage(
            latest_msg.author,
            latest_msg.img_url,
            latest_msg.message,
            latest_msg.date
          )}
        </>
      )}
      <div>
        <Group position="right" mt={5}>
          <Button
            color="green"
            radius="xl"
            size="sm"
            compact
            variant={opened ? "filled" : "light"}
            onClick={() => {
              setProspectId(props.prospect.id);
              setDrawerOpened(true);
            }}
          >
            Open
          </Button>
          {/*
          <Button
            color="green"
            radius="xl"
            size="xs"
            compact
            variant={opened ? "filled" : "light"}
            onClick={() => setOpened((prev) => !prev)}
          >
            Respond
          </Button>
          <Button
            color="green"
            radius="xl"
            size="xs"
            compact
            variant="subtle"
            component="a"
            href={`/home/${props.prospect.id}`}
          >
            See details
          </Button>
          <Button
            hidden
            color="green"
            radius="xl"
            size="xs"
            compact
            variant="subtle"
            onClick={() => {
              showNotification({
                title: "Coming soon!",
                color: "orange",
                message:
                  "This feature is coming soon, please contact an admin for now.",
              });
            }}
          >
            Flag
          </Button>
          */}
        </Group>
      </div>
      <Collapse in={opened}>
        <Stack>
          <TextAreaWithAI
            minRows={2}
            maxRows={6}
            placeholder="Write a message..."
            onChange={(e) => setResponse(e.currentTarget.value)}
            value={response}
          />

          {props.includeNote && (
            <TextInput
              placeholder="What was your next step?"
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
            />
          )}

          {props.includeQualified && (
            <Switch
              label="Prospect is Qualified"
              checked={qualified}
              onChange={(e) => setQualified(e.currentTarget.checked)}
            />
          )}

          {props.includeSchedule && (
            <Select
              label="What's the current status?"
              placeholder="Scheduling status"
              data={[
                { value: "DEMO_SET", label: "We have a demo scheduled" },
                { value: "WAITING", label: "Waiting response" },
                { value: "NOT_INTERESTED", label: "Not interested" },
              ]}
              value={schedule}
              onChange={(value) => {
                if (value) {
                  setSchedule(value);
                }
              }}
            />
          )}

          <Checkbox
            label="Hide for 2 days"
            checked={purgatory}
            onChange={(e) => setPurgatory(e.currentTarget.checked)}
          />

          <Button
            variant="light"
            radius="xl"
            size="xs"
            color="blue"
            component="a"
            target="_blank"
            w="30%"
            rel="noopener noreferrer"
            loading={loading}
            rightIcon={<IconSend size={14} />}
            onClick={async () => {
              setLoading(true);

              console.log(response);
              console.log(note);
              console.log(qualified);
              console.log(schedule);
              console.log(purgatory);

              if (response.trim()) {
                const result = await sendLinkedInMessage(
                  userToken,
                  props.prospect.id,
                  response.trim(),
                  purgatory
                );
                console.log(result);
              }

              if (props.includeNote && note.trim()) {
                const result = await addProspectNote(
                  userToken,
                  props.prospect.id,
                  note.trim()
                );
                console.log(result);
              }

              if (props.includeQualified) {
                if (qualified) {
                  const result = await addProspectNote(
                    userToken,
                    props.prospect.id,
                    "SDR identified this prospect as a qualified target"
                  );
                  console.log(result);
                } else {
                  const result = await updateChannelStatus(
                    props.prospect.id,
                    userToken,
                    "LINKEDIN",
                    "NOT_QUALIFIED"
                  );
                  console.log(result);
                }
              }

              if (props.includeSchedule) {
                if (schedule === "DEMO_SET") {
                  const result = await updateChannelStatus(
                    props.prospect.id,
                    userToken,
                    "LINKEDIN",
                    "DEMO_SET"
                  );
                  console.log(result);
                } else if (schedule === "NOT_INTERESTED") {
                  const result = await updateChannelStatus(
                    props.prospect.id,
                    userToken,
                    "LINKEDIN",
                    "NOT_INTERESTED"
                  );
                  console.log(result);
                } else if (schedule === "WAITING") {
                  // Do nothing, TODO: add a note?
                }
              }

              queryClient.invalidateQueries({
                queryKey: [`query-dash-get-prospects`],
              });
            }}
          >
            Send
          </Button>
        </Stack>
      </Collapse>
    </>
  );
}
