import React, { useState, useEffect } from "react";
import { Modal, Text, Badge, Timeline, Card, Loader } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export const SelixAutoExecuteModal = ({ opened, onClose }: any) => {
  const [status, setStatus] = useState("Queued");
  const [timelineItems, setTimelineItems]: any = useState([]);

  useEffect(() => {
    if (!opened) {
      setTimelineItems([]);
      setStatus("Queued");
    }
  }, [opened]);

  useEffect(() => {
    const statusTransition = setTimeout(() => {
      if (status === "Queued") {
        setStatus("In Progress");
      }
    }, 3000);

    return () => clearTimeout(statusTransition);
  }, [status, opened]);

  useEffect(() => {
    const timelineSteps = [
      {
        title: "Initial Prospect Identification",
        description:
          "Applying a comprehensive set of filters to identify potential prospects from the database.",
      },
      {
        title: "Sample Evaluation Process",
        description:
          "Selecting a sample of 5-10 prospects to verify the effectiveness of the applied filters.",
      },
      {
        title: "Filter Adjustment Phase",
        description:
          "Adjusting filters to ensure that at least 90% of prospects meet the desired criteria.",
      },
      {
        title: "New Sample Evaluation",
        description:
          "Re-evaluating with a new set of 5-10 prospects to confirm filter adjustments.",
      },
      {
        title: "Final Upload Preparation",
        description:
          "Ensuring a 90% fit rate before proceeding with the upload of the remaining prospects.",
      },
      {
        title: "Completion and Review",
        description:
          "Finalizing the process and preparing a summary report for review.",
      },
    ];

    let index = 0;
    const timelineInterval = setInterval(() => {
      if (index < timelineSteps.length) {
        setTimelineItems((prevItems: any) => [
          ...prevItems,
          timelineSteps[index],
        ]);

        index++;
      } else {
        clearInterval(timelineInterval);
        setStatus("Completed");
      }
    }, 3000);

    return () => clearInterval(timelineInterval);
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Auto Executing: Compile Prospect List"
      mah={600}
    >
      <Card withBorder mb="md">
        <Text size="xs">
          Description: Automatically identify and compile a list of potential
          prospects based on predefined criteria.
        </Text>
        <Text size="xs" color="gray">
          Created on: Jan 4th, 2024
        </Text>
        <Badge
          color={
            status === "Queued"
              ? "blue"
              : status === "In Progress"
              ? "orange"
              : "green"
          }
        >
          {status}
        </Badge>
      </Card>
      <Card withBorder>
        <Timeline
          active={timelineItems.length - 1}
          bulletSize={24}
          lineWidth={2}
          mt="md"
          color="green"
        >
          {timelineItems.map((item: any, index: any) => (
            <Timeline.Item
              key={index}
              title={item?.title}
              bullet={
                <IconCheck
                  size={16}
                  color="white"
                  style={{ backgroundColor: "green", borderRadius: "50%" }}
                />
              }
            >
              <Text size="sm">{item?.description}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
      {status === "In Progress" && (
        <Loader
          size="sm"
          style={{ position: "absolute", bottom: 10, right: 10 }}
        />
      )}
    </Modal>
  );
};
