import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { ActionIcon, Button, Divider, Flex, Paper, Switch, Text, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconFilter, IconPlus, IconTrash, IconUsers } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function PreFilterV2() {

  //use effect to fetch all filters for SDR

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  //fetch all pre-filters 

  useEffect(() => {
    
    const fetchPreFilters = async () => {
      try {
        const response = await fetch(`${API_URL}/contacts/all_prefilters`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchPreFilters();


  }, [userData]);

  const [prefilters, setPrefilters] = useState<any>([]);

  useEffect(() => {
    const fetchSavedQueries = async () => {
      try {
        const response = await fetch(`${API_URL}/apollo/get_all_saved_queries`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });
        const data = await response.json();
        if (data.status === "success") {
          const formattedPrefilters = data.data.map((query: any) => ({
            title: query.custom_name,
            id: query.id,
            prospects: query.num_results,
            status: true, // Assuming all fetched queries are active by default
          }));
          setPrefilters(formattedPrefilters);
        } else {
          console.error("Failed to fetch saved queries:", data);
        }
      } catch (error) {
        console.error("Error fetching saved queries:", error);
      }
    };

    fetchSavedQueries();
  }, [userToken]);
  return (
    <Paper withBorder shadow="md" radius={"sm"} p={"md"}>
      <Flex align={"center"} justify={"space-between"} mt={"sm"}>
        <Text size={20} fw={700} color="gray">
          Pre-filters
        </Text>
        <Button
          leftIcon={<IconPlus size={"1rem"} />}
          onClick={() => {
            openContextModal({
              modal: "prefilterEditModal",
              title: (
                <Title order={3} className="flex items-center gap-2">
                  <IconFilter size={"1.5rem"} color="#228be6" /> New Pre-Filter
                </Title>
              ),
              innerProps: {},
              centered: true,
              styles: {
                content: {
                  minWidth: "930px",
                },
              },
            });
          }}
        >
          Add Pre-filter
        </Button>
      </Flex>
      <Text color="gray" size={"sm"} fw={500} mt={"sm"}>
        Pre-filters are applied before segment filters take effect. Set up pre-filters to apply foundational criteria to ensure that all subsequent filters
        align with your core requirements.
      </Text>
      <Divider mt={"sm"} />
      {prefilters?.map((item: any, index: number) => {
        return (
          <Paper withBorder p={"sm"} radius={"sm"} className="flex justify-between" mt={"sm"}>
            <Flex align={"center"} gap={3}>
              <Text color="gray" fw={500} size={"sm"}>
                Pre-filter #{index + 1}:
              </Text>
              <Text fw={600} size={"sm"}>
                {item.title}
              </Text>
              <Divider orientation="vertical" mx={"xs"} />
              <IconUsers color="gray" size={"1rem"} />
              <Text color="gray" fw={500} size={"sm"}>
                <span className="font-semibold">{item.prospects}</span> Prospects
              </Text>
            </Flex>
            <Flex align={"center"} gap={"sm"}>
              <ActionIcon
                size={"sm"}
                onClick={() => {
                  openContextModal({
                    modal: "prefilterEditModal",
                    title: (
                      <Title order={3} className="flex items-center gap-2">
                        <IconFilter size={"1.5rem"} color="#228be6" /> Edit Pre-Filter
                      </Title>
                    ),
                    innerProps: {id: item.id, numResults: item.prospects},
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "930px",
                      },
                    },
                  });
                }}
              >
                <IconEdit />
              </ActionIcon>
              <ActionIcon
                size={"sm"}
                onClick={async () => {
                  setPrefilters((prevPrefilters: any[]) => prevPrefilters.filter((prefilter) => prefilter.id !== item.id));
                  try {
                    const response = await fetch(`${API_URL}/apollo/${item.id}`, {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userToken}`,
                      },
                    });
                    if (response.ok) {
                      showNotification({
                        title: 'Success',
                        message: 'Pre-filter deleted successfully',
                        color: 'green',
                      });
                    } else {
                      console.error("Failed to delete pre-filter");
                    }
                  } catch (error) {
                    console.error("Error deleting pre-filter:", error);
                  }
                }}
              >
                <IconTrash />
              </ActionIcon>
              {/* <Switch defaultChecked={item.status} size="sm" /> */}
            </Flex>
          </Paper>
        );
      })}
    </Paper>
  );
}
