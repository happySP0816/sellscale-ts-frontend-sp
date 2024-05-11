import {
  userDataState,
  adminDataState,
  userTokenState,
} from "@atoms/userAtoms";
import { impersonateSDR } from "@auth/core";
import { HEADER_HEIGHT } from "@constants/data";
import {
  Avatar,
  Badge,
  Group,
  useMantineTheme,
  Text,
  Select,
  SelectProps,
  Loader,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { proxyURL, valueToColor, nameToInitials } from "@utils/general";
import { getClientSDRs } from "@utils/requests/client";
import { forwardRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ClientSDR } from "src";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ image, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group spacing="sm" noWrap>
        <Avatar
          src={proxyURL(image)}
          alt={`${label}'s Profile Picture`}
          radius="xl"
          size="xs"
        >
          {nameToInitials(label)}
        </Avatar>
        <div>
          <Text size="xs">{label}</Text>
        </div>
      </Group>
    </div>
  )
);

export default function AdminHeader(props: {}) {
  const theme = useMantineTheme();
  const [userToken, setUserToken] = useRecoilState(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [adminData, setAdminData] = useRecoilState(adminDataState);

  const { data, refetch, isLoading } = useQuery({
    queryKey: [`query-get-org-sdrs`],
    queryFn: async () => {
      const result = await getClientSDRs(userToken);
      return result.status === "success" ? (result.data as ClientSDR[]) : [];
    },
  });

  return (
    <Group
      px="md"
      position="apart"
      align="center"
      sx={{
        zIndex: 5000,
      }}
      style={{
        backgroundColor: theme.fn.variant({ variant: "filled", color: "dark" })
          .background,
      }}
      h={HEADER_HEIGHT}
    >
      <Group>
        <Badge variant="outline" color="pink">
          Admin View
        </Badge>
        <Avatar
          src={proxyURL(adminData?.img_url)}
          alt={`${adminData?.sdr_name}'s Profile Picture`}
          color={valueToColor(theme, adminData?.sdr_name)}
          radius="xl"
          size="sm"
        >
          {nameToInitials(adminData?.sdr_name)}
        </Avatar>
        <Text c="gray.3">{adminData?.sdr_name}</Text>
      </Group>
      <Group>
        {isLoading && <Loader size="xs" color="gray" variant="dots" />}
        {
          // sum of all unread messages
          data?.reduce(
            (acc: any, sdr: any) => acc + (sdr.unread_inbox_messages || 0),
            0
          ) > 0 && (
            <Badge variant="filled" color="red">
              {data?.reduce(
                (acc, sdr) => acc + (sdr.unread_inbox_messages || 0),
                0
              )}{" "}
              unread messages
            </Badge>
          )
        }
        <Text c="gray.3">👀 IMPERSONATING AS: </Text>
        <Select
          placeholder="Select SDR"
          size="xs"
          onClick={(e) => {
            // fetch SDRs
            refetch();
          }}
          w={300}
          data={(data ?? [])
            .sort((a, b) => a.sdr_name.localeCompare(b.sdr_name))
            .map((sdr) => {
              const num_unread = sdr.unread_inbox_messages;
              const num_unread_str =
                num_unread && num_unread > 0
                  ? ` (🔴 ${num_unread} unread)`
                  : "";
              return {
                image: sdr.img_url,
                label: sdr.sdr_name + num_unread_str,
                value: `${sdr.id}`,
              };
            })}
          itemComponent={SelectItem}
          defaultValue={`${userData.id}`}
          onChange={async (value) => {
            // Change to different SDR
            const sdr = data?.find((sdr) => sdr.id === parseInt(`${value}`));
            if (adminData && sdr) {
              await impersonateSDR(adminData, sdr, setUserToken, setUserData);
            }
          }}
        />
      </Group>
    </Group>
  );
}
