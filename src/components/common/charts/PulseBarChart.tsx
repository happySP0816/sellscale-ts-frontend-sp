import { currentProjectState } from "@atoms/personaAtoms";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { ProspectICP } from "@common/persona/Pulse";
import {
  getIcpFitScoreMap,
  icpFitToColor,
  icpFitToLabel,
} from "@common/pipeline/ICPFitAndReason";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";
import {
  Box,
  Group,
  useMantineTheme,
  Title,
  Badge,
  Paper,
  LoadingOverlay,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { formatToLabel, valueToColor } from "@utils/general";
import { getProspects } from "@utils/requests/getProspects";
import { getProspectsForICP } from "@utils/requests/getProspectsForICP";
import _ from "lodash";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useRecoilState, useRecoilValue } from "recoil";
import { ProspectShallow } from "src";

export default function PulseBarChart(props: {}) {
  const theme = useMantineTheme();

  const [prospectDrawerOpened, setProspectDrawerOpened] = useRecoilState(
    prospectDrawerOpenState
  );
  const [prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const {
    data: raw_data,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`query-isp-fit-chart-prospects`],
    queryFn: async () => {
      const response = await getProspectsForICP(userToken, currentProject?.id || -1);
      if (response.status === "error") {
        return null;
      }
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject,
  });

  console.log(raw_data);

  const data = raw_data ? [
    {
      icp_score: '4',
      icp_label: icpFitToLabel(parseInt('4')),
      icp_color: icpFitToColor(parseInt('4')),
      count: raw_data.very_high_count,
      data: raw_data.very_high_data as ProspectICP[],
    },
    {
      icp_score: '3',
      icp_label: icpFitToLabel(parseInt('3')),
      icp_color: icpFitToColor(parseInt('3')),
      count: raw_data.high_count,
      data: raw_data.high_data as ProspectICP[],
    },
    {
      icp_score: '2',
      icp_label: icpFitToLabel(parseInt('2')),
      icp_color: icpFitToColor(parseInt('2')),
      count: raw_data.medium_count,
      data: raw_data.medium_data as ProspectICP[],
    },
    {
      icp_score: '1',
      icp_label: icpFitToLabel(parseInt('1')),
      icp_color: icpFitToColor(parseInt('1')),
      count: raw_data.low_count,
      data: raw_data.low_data as ProspectICP[],
    },
    {
      icp_score: '0',
      icp_label: icpFitToLabel(parseInt('0')),
      icp_color: icpFitToColor(parseInt('0')),
      count: raw_data.very_low_count,
      data: raw_data.very_low_data as ProspectICP[],
    },
  ] : [];

  return (
    <Box sx={{ position: "relative" }}>
      <LoadingOverlay visible={isFetching} />
      <div style={{ height: "400px" }}>
        <Bar
          options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "ICP Fit Score Distribution",
              },
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.parsed.y} prospects`;
                  },
                },
              },
            },
            scales: {
              y: {
                ticks: {
                  callback: function (value, index, ticks) {
                    return `${value}`;
                  },
                },
              },
              x: {
                ticks: {
                  font: {
                    size: 8,
                  },
                  callback: function (value, index, ticks) {
                    return `${data[index].icp_label}`;
                  },
                },
              },
            },
          }}
          data={{
            labels: data.map((d) => d.icp_label),
            datasets: [
              {
                label: "ICP Fit Score Distribution",
                data: data.map((d) => d.count),
                // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
                backgroundColor: data.map(
                  (d) => theme.colors[d.icp_color][5] + "70"
                ),
              },
            ],
          }}
        />

        {/* <ResponsiveBar - OLD VERSION -
        data={data}
        keys={['count']}
        indexBy="icp_label"
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'nivo' }}
        colorBy="indexValue"
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'ICP Fit Score',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Amount of Prospects',
            legendPosition: 'middle',
            legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        role="application"
        ariaLabel="ICP Fit Score Distribution"
    /> */}
      </div>
      <Group align="flex-start" grow>
        {data.map((d, index) => (
          <Paper key={index} p={5}>
            <Title order={4}>
              <Badge
                color={d.icp_color}
                variant="light"
                size='xl'
                styles={{ root: { textTransform: "initial" } }}
              >
                {formatToLabel(d.icp_label)}
              </Badge>{" "}
              Prospects
            </Title>

            <DataTable
              height={400}
              highlightOnHover
              columns={[
                {
                  accessor: "full_name",
                  title: "Name",
                  width: 150,
                },
                // {
                //   accessor: "overall_status",
                //   title: "Overall Status",
                //   width: 150,
                //   render: ({ overall_status }) => (
                //     <Badge
                //       color={valueToColor(
                //         theme,
                //         formatToLabel(overall_status)
                //       )}
                //       variant="light"
                //       styles={{ root: { textTransform: "initial" } }}
                //     >
                //       {formatToLabel(overall_status)}
                //     </Badge>
                //   ),
                // },
                // {
                //   accessor: "icp_fit_reason",
                //   title: "Fit Reason",
                // },
              ]}
              records={d.data}
              onRowClick={(prospect, rowIndex, event) => {
                setProspectId(+prospect.id);
                setProspectDrawerOpened(true);
              }}
            />
          </Paper>
        ))}
      </Group>
      {prospectDrawerOpened && <ProspectDetailsDrawer />}
    </Box>
  );
}
