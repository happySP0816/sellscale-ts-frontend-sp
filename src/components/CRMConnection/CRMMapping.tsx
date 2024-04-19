import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Select,
  SelectItem,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconArrowsExchange } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { ClientSDR } from "src";

import { API_URL } from "@constants/data";

type CRMUserType = {
  name: string;
  email: string;
  is_active: boolean;
  remote_was_deleted: boolean;
  id: string;
  remote_id: string;
  created_at: Date;
  modified_at: Date;
  field_mappings: Record<string, any>;
  remote_data: any;
};

export default function CRMUserMapping() {
  const userToken = useRecoilValue(userTokenState);
  const userState = useRecoilValue(userDataState);

  const [sdrs, setSDRs] = useState<ClientSDR[]>();
  const [crmUsers, setCRMUsers] = useState<CRMUserType[]>();

  const getCRMUsers = async () => {
    const response = await fetch(`${API_URL}/merge_crm/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();

    if (data.status === "success") {
      setCRMUsers(data.data.users);
      setSDRs(data.data.sdrs);
    }
  };

  useEffect(() => {
    getCRMUsers();
  }, []);

  return (
    <Paper withBorder mt="md" p="lg" radius="md" bg={"#fcfcfd"}>
      <Flex align={"center"} justify={"space-between"}>
        <Flex direction={"column"} mb={"md"}>
          <Text fw={600} size={20}>
            CRM User Mapping
          </Text>
        </Flex>
      </Flex>
      <Divider />
      <Flex direction={"column"} gap={"sm"} mt={"md"}>
        {sdrs &&
          sdrs.map((sdr, index) => {
            const postSyncUserToSDR = async (userCRMId: string | null) => {
              const response = await fetch(
                `${API_URL}/merge_crm/users/sync/sdr`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    merge_user_id: userCRMId as string,
                  }),
                }
              );
              const data = await response.json();
              if (data.status === "success") {
                showNotification({
                  title: "Success",
                  message: `Prospects in SellScale for ${
                    sdr.sdr_name
                  } will be attributed in your CRM under ${
                    crmUsers?.find((user) => user.id === userCRMId)?.name
                  }`,
                  color: "green",
                });
                getCRMUsers();
              } else {
                showNotification({
                  title: "Error",
                  message: data.message,
                  color: "red",
                });
                mergeUserID = sdr.merge_user_id;
              }
            };

            let mergeUserID = sdr.merge_user_id;

            return (
              <Flex gap={"sm"} align={"center"} direction="column">
                {index === 0 && (
                  <Flex w={"100%"}>
                    <Text color="gray" size="sm" w="100%">
                      SellScale User
                    </Text>
                    <Text color="gray" size="sm" w="100%">
                      CRM User
                    </Text>
                  </Flex>
                )}

                <Flex w={"100%"}>
                  <Flex w={"100%"} align="center">
                    <Flex
                      w={"100%"}
                      style={{
                        border: "1px solid #e1e1e1",
                        padding: "0px 10px 0px 10px",
                        minHeight: "36px",
                        borderRadius: "5px",
                        backgroundColor: "#f7f7f7",
                        color: "#000",
                        alignItems: "center",
                      }}
                    >
                      {sdr.sdr_name}
                    </Flex>
                    <Flex mx="20px">
                      <IconArrowsExchange
                        color="gray"
                        // style={{ marginTop: `${index === 0 ? "42px" : "0px"}` }}
                      />
                    </Flex>
                  </Flex>
                  <Flex h={"100%"} w={"100%"} direction="column" align="center">
                    <Select
                      w={"100%"}
                      h={"24px"}
                      placeholder="Pick value"
                      data={
                        (crmUsers &&
                          crmUsers.map((crmUser) => {
                            return { value: crmUser.id, label: crmUser.name };
                          })) ||
                        ([{ value: "No Users available" }] as SelectItem[])
                      }
                      value={mergeUserID}
                      // disabled={sdr.merge_user_id != userState?.merge_user_id}
                      onChange={(value) => {
                        mergeUserID = value as string;
                        postSyncUserToSDR(value);
                      }}
                      searchable
                      allowDeselect
                    />
                  </Flex>
                </Flex>
              </Flex>
            );
          })}
      </Flex>
    </Paper>
  );
}
