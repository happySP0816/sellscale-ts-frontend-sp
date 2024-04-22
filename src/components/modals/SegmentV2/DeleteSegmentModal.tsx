import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { Button, Flex, Text } from "@mantine/core";
import { ContextModalProps, closeAllModals } from "@mantine/modals";
import { useState } from "react";
import { useRecoilValue } from "recoil";

interface DeleteSegment extends Record<string, unknown> {
  showLoader: boolean;
  segmentId: string;
  getAllSegments: (showLoading: boolean) => void;
}

export default function DeleteSegmentModal({
  innerProps,
}: ContextModalProps<DeleteSegment>) {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const deleteSegment = async (showLoader: boolean, segmentId: string) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/${segmentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        closeAllModals();
        innerProps?.getAllSegments(true);
      });
  };

  return (
    <>
      <Text color="gray" fw={500} size={"sm"}>
        Are you sure you want to delete this segment?
      </Text>
      <Flex gap={"md"} mt={"lg"}>
        <Button
          fullWidth
          size="md"
          radius={"md"}
          variant="outline"
          color="gray"
          onClick={() => closeAllModals()}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          size="md"
          color="red"
          radius={"md"}
          loading={loading}
          onClick={() => {
            deleteSegment(innerProps.showLoader, innerProps.segmentId);
          }}
        >
          Delete Segment
        </Button>
      </Flex>
    </>
  );
}
