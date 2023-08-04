import { currentProjectState } from "@atoms/personaAtoms";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import { userTokenState } from "@atoms/userAtoms";
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
import { ResponsiveBar } from "@nivo/bar";
import { useQuery } from "@tanstack/react-query";
import { formatToLabel, valueToColor } from "@utils/general";
import { getProspects } from "@utils/requests/getProspects";
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
    data: prospects,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`query-isp-fit-chart-prospects`],
    queryFn: async () => {
      const response = await getProspects(
        userToken,
        undefined,
        "SELLSCALE",
        10000, // TODO: Maybe use pagination method instead
        undefined,
        "ALL",
        currentProject?.id,
        true
      );
      return response.status === "success"
        ? (response.data as ProspectShallow[])
        : [];
    },
    refetchOnWindowFocus: false,
    enabled: !!currentProject,
  });

  console.log(prospects);

  const grouped_data = _.groupBy(
    prospects || [],
    (prospect) => prospect.icp_fit_score
  );

  const data = Object.keys(grouped_data).reverse().map((key) => ({
    icp_score: key,
    icp_label: icpFitToLabel(parseInt(key)),
    icp_color: icpFitToColor(parseInt(key)),
    count: grouped_data[key].length,
  }));

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
              records={grouped_data[d.icp_score]}
              onRowClick={(prospect, rowIndex, event) => {
                setProspectId(prospect.id);
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
