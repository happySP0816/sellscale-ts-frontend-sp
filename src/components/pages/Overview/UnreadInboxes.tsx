import { userTokenState } from "@atoms/userAtoms";
import { adminDataState } from "@atoms/userAtoms";
import { Avatar, Badge, Box, Divider, Flex, Paper, Text, useMantineTheme, Loader } from "@mantine/core";
import { nameToInitials, valueToColor } from "@utils/general";
import { useRecoilValue } from "recoil";
import { useQuery } from "@tanstack/react-query";
import { IconLink, IconMessageCircle } from "@tabler/icons";
import { getClientSDRs } from "@utils/requests/client";
import { ClientSDR } from "src";

export default function UnreadInboxes() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const adminData = useRecoilValue(adminDataState);

  const { data: sdrs, isLoading } = useQuery<ClientSDR[]>({
    queryKey: ["query-get-org-sdrs"],
    queryFn: async () => {
      const result = await getClientSDRs(userToken);
      return result.status === "success" ? result.data : [];
    },
  });

  const totalUnreadMessages = sdrs?.reduce((acc, sdr) => acc + (sdr.unread_inbox_messages || 0), 0) || 0;

  return (
    <Box>
      <Flex align={"center"} gap={"5px"}>
        <Text
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            whiteSpace: "nowrap",
          }}
          fw={700}
          size={"lg"}
        >
          <span>Unread Inboxes</span>
          <Badge sx={{ background: "#228be6", color: "white" }}>{totalUnreadMessages}</Badge>
        </Text>
        <Divider w={"100%"} />
      </Flex>
      {isLoading ? (
        <Loader size="sm" />
      ) : (
        sdrs
          ?.filter((sdr) => (sdr.unread_inbox_messages || 0) > 0)
          .map((sdr, index) => (
            <Paper key={index} bg={"white"} my={"xs"} withBorder p={"sm"} className="flex justify-between items-center">
              <Flex align={"center"} gap={"sm"}>
                <Avatar size={"sm"} radius={"xl"} src={sdr.img_url} color={valueToColor(theme, sdr.sdr_name)}>
                  {nameToInitials(sdr.sdr_name)}
                </Avatar>
                <Text fw={600} fz={{ base: 12, md: 14 }}>
                  {sdr.sdr_name}
                </Text>
                <Divider orientation="vertical" />
                <Text fw={500} fz={{ base: 12, md: 14 }} color="gray" className="flex items-center gap-1">
                  <span className=" text-red-600">{sdr.unread_inbox_messages}</span>
                  Unread Messages
                </Text>
              </Flex>
              <Flex gap={"sm"}>
                {adminData?.role === "ADMIN" && (
                  <Flex align={"center"} gap={"5px"}>
                    <Text color="gray" fw={500} size={"sm"}>
                      <a
                        href={`/authenticate?stytch_token_type=direct&token=${sdr.auth_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        <IconLink size={16} color="gray" />
                        Login Link
                      </a>
                    </Text>
                  </Flex>
                )}
                <Text color="#228be6" fw={500} size={"sm"} underline>
                  {""}
                </Text>
              </Flex>
            </Paper>
          ))
      )}
    </Box>
  );
}
