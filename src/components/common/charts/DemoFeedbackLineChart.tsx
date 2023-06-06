// install (please try to align the version of installed @nivo packages)
// yarn add @nivo/line
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { Box, Title } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { ResponsiveLine } from "@nivo/line";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

type PropsType = {
  sdrOnly: boolean;
};

export default function DemoFeedbackLineChart(props: PropsType) {
  const userToken = useRecoilState(userTokenState);
  const [fetchedData, setFetchedData] = useState(false);
  const [data, setData]: any = useState([]);
  const [dataDict, setDataDict] = useState({});

  useEffect(() => {
    if (!fetchedData) {
      fetch(`${API_URL}/client/demo_feedback_feed?sdrOnly=${props.sdrOnly}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken[0]}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          var cumulativeData = [];
          var individualPoints = [];
          var tempDataDict: any = {};
          for (var i = 0; i < data.data.length; i++) {
            const date = data.data[i].demo_date.substring(5, 16);
            console.log(data.data[i]);
            individualPoints.push({
              id: data.data[i].company,
              data: [{ x: date, y: data.data[i].total_demo_count }],
            });
            cumulativeData.push({
              x: date,
              y: data.data[i].total_demo_count,
            });
            tempDataDict[data.data[i].total_demo_count] = data.data[i];
            setDataDict(tempDataDict);
          }
          setFetchedData(true);
          setData(
            individualPoints.concat([
              {
                id: "Cumulative",
                data: cumulativeData,
              },
            ])
          );
        });
    }
  }, [fetchedData, userToken]);

  return (
    <Box sx={{ height: "500px", backgroundColor: "white" }}>
      <ResponsiveLine
        data={data}
        onClick={(point) => {
          const propsData = dataDict[point.data.y];
          openContextModal({
            modal: "demoFeedbackDetails",
            title: (
              <Title order={3}>Demo Feedback: {propsData.full_name}</Title>
            ),
            innerProps: {
              company: propsData.company,
              demoDate: propsData.demo_date,
              demoRating: propsData.demo_rating,
              fullName: propsData.full_name,
              prospectId: propsData.prospect_id,
              demoFeedback: propsData.demo_feedback,
            },
          });
        }}
        margin={{ top: 50, right: 80, bottom: 70, left: 80 }}
        xScale={{ type: "point" }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Demo Date",
          legendOffset: 48,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "# of Demos",
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointSize={15}
        colors={{ scheme: "spectral" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        useMesh={true}
        enablePointLabel
        pointLabelYOffset={20}
        pointLabel={(e) => dataDict[e.y].company}
        // legends={[
        //   {
        //     anchor: "bottom-right",
        //     direction: "column",
        //     justify: false,
        //     translateX: 100,
        //     translateY: 0,
        //     itemsSpacing: 0,
        //     itemDirection: "left-to-right",
        //     itemWidth: 80,
        //     itemHeight: 20,
        //     itemOpacity: 0.75,
        //     symbolSize: 12,
        //     symbolShape: "circle",
        //     symbolBorderColor: "rgba(0, 0, 0, .5)",
        //     effects: [
        //       {
        //         on: "hover",
        //         style: {
        //           itemBackground: "rgba(0, 0, 0, .03)",
        //           itemOpacity: 1,
        //         },
        //       },
        //     ],
        //   },
        // ]}
      />
    </Box>
  );
}
