import { userTokenState } from "@atoms/userAtoms";
import {
  Text,
  Paper,
  useMantineTheme,
  Divider,
  ScrollArea,
  LoadingOverlay,
  Badge,
  Group,
  Avatar,
  Flex,
} from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useQuery } from "@tanstack/react-query";
import {
  convertDateToLocalTime,
  nameToInitials,
  valueToColor,
} from "@utils/general";
import { getEmailMessages } from "@utils/requests/getEmails";
import DOMPurify from "isomorphic-dompurify";
import ReactMarkdown from "react-markdown";
import { useRecoilValue } from "recoil";
import { ProspectEmail } from "src";

export default function ViewEmailThreadModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{ prospectId: number; threadId: string }>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-prospect-email-messages-${innerProps.prospectId}`],
    queryFn: async () => {
      const response = await getEmailMessages(
        userToken,
        innerProps.prospectId,
        innerProps.threadId
      );
      return response.status === "success" ? response.extra : [];
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      <ScrollArea mih={200}>
        {data?.map((email: any, index: number) => (
          <Paper
            withBorder
            key={index}
            my={10}
            p={10}
            style={{
              position: "relative",
              backgroundColor: theme.colors.dark[6],
            }}
          >
            <Flex>
              <Avatar
                src={null}
                alt={email.message_from[0]?.name}
                color={valueToColor(theme, email.message_from[0]?.name || 'default-color')}
                radius={45}
                size={45}
                mt={5}
                mr={10}
              >
                {nameToInitials(email.message_from[0]?.name)}
              </Avatar>
              <div>
                <Text>
                  <b>{email.message_from[0]?.name}</b> replied
                </Text>
                <Badge
                  color="gray"
                  variant="outline"
                  size="sm"
                  styles={{ root: { textTransform: "initial" } }}
                >
                  To: {email.message_to[0]?.email}
                </Badge>
                {/* TODO: Include Cc-ed */}
                <div
                  style={{ marginTop: 10 }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(email.body),
                  }}
                />
                <Text
                  sx={{ position: "absolute", top: 10, right: 10 }}
                  fz="sm"
                  c="dimmed"
                >
                  {convertDateToLocalTime(new Date(email.date_received))}
                </Text>
              </div>
            </Flex>
          </Paper>
        ))}
      </ScrollArea>
    </Paper>
  );
}
