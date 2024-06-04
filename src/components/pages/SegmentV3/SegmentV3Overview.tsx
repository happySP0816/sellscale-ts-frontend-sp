import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Box, Button, Card, Flex, LoadingOverlay, RingProgress, Text, TextInput, useMantineTheme, Tooltip } from "@mantine/core";
import { IconBuildingBank, IconCash, IconCheck, IconPencil, IconPoint, IconUsers } from "@tabler/icons";
import { IconBriefcase2 } from "@tabler/icons-react";
import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Legend, DoughnutController, ArcElement, Chart } from "chart.js";
import { useRecoilValue } from "recoil";

Chart.register(ArcElement);

export default function SegmentV3Overview(props: any) {
  const { data, totalProspected, totalContacted, totalInFilters, totalUniqueCompanies } = props;

  const theme = useMantineTheme();

  const userData = useRecoilValue(userDataState);

  const [editModeACV, setEditModeACV] = useState(false);
  const [editableACV, setEditableACV] = useState(userData.client.contract_size);
  //if they edited the acv after saving, we need to update the acv
  //can be null or number
  const [editedACV, setEditedACV] = useState(null as number | null);
  const [isSavingACV, setIsSavingACV] = useState(false); // State to manage loading state
  const userToken = useRecoilValue(userTokenState);

  const totalSegments = data.length + data.map((x: any) => x.sub_segments.length).reduce((acc: number, item: any) => acc + item, 0);

  const piechartOptions = {
    rotation: 270,
    circumference: 180,
    cutout: `80%`,
    plugins: {
      legend: {
        display: false,
      },
      doughnutCutout: false,
    },
  };

  return (
    <Flex align={"center"} gap={"lg"} mb={"lg"}>
      {/* TAM Value */}
      <Card pl="sm" pr="sm" pt="8px" pb="8px" radius="md" withBorder w={"40%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex direction={"column"}>
            <Flex align={"center"}>
              <Text fw={600} color="gray.8" fz="xs">
                <Box
                  sx={(theme) => ({
                    borderRadius: 9999,
                    display: "inline-block",
                    marginRight: 4,
                    width: 12,
                    height: 12,
                    backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  })}
                />
                Estimated TAM Value
              </Text>
            </Flex>
            <Flex align={"center"} gap={"xs"}>
              <Text fw={500} fz={"25px"}>
                {/* # numAccounts x acv */}${(totalUniqueCompanies * (editedACV || userData.client.contract_size)).toLocaleString()}
              </Text>
            </Flex>
          </Flex>
          <Box
            sx={{
              textAlign: "center",
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RingProgress
              size={90}
              sections={[
                {
                  value: Math.round((totalContacted / (totalProspected || 1)) * 100),
                  color: theme.colors.blue[6],
                },
              ]}
              label={
                <Text c="blue" fw={700} ta="center" size="sm" color="gray">
                  {Math.round((totalContacted / (totalProspected || 1)) * 1000) / 10}%
                </Text>
              }
            />
            {/* <Text size="10px" color="gray">
              # Contacted / <br /># Imported
            </Text> */}
          </Box>
        </Flex>
      </Card>

      {/* ACV */}
      <Card sx={{ cursor: "pointer" }} px={"lg"} radius="md" withBorder w={"15%"}>
        <LoadingOverlay visible={isSavingACV} />
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <IconPoint size={"2rem"} color="white" fill={theme.colors.green[3]} className="ml-[-8px]" />
            <Text fw={500} color="gray" fz="xs">
              ACV
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            ${parseInt(`${editableACV}`).toLocaleString()}
          </Text>
        </Flex>
      </Card>

      {/* Accounts */}
      <Card px={"lg"} radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <IconPoint size={"2rem"} color="white" fill={theme.colors.orange[3]} className="ml-[-8px]" />
            <Text fw={500} color="gray" fz="xs">
              Accounts
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalUniqueCompanies}
          </Text>
        </Flex>
      </Card>

      {/* Number contacted */}
      <Card px={"lg"} radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <IconPoint size={"2rem"} color="white" fill={"#228BE6"} className="ml-[-8px]" />
            <Text fw={500} color="gray" fz="xs">
              Contacts
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalProspected}
          </Text>
        </Flex>
      </Card>
      {/* Number segments */}
      <Card px={"lg"} radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <IconPoint size={"2rem"} color="white" fill={"#D444F1"} className="ml-[-8px]" />
            <Text fw={500} color="gray" fz="xs">
              Segments
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalSegments}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
