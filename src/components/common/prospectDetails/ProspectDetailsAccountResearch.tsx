import GeneratedByAI from "@common/library/GeneratedByAI";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { Card, Text, Group, Table, Button, Loader } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { IconReload } from "@tabler/icons";
import displayNotification from "@utils/notificationFlow";
import { generateResearchPoints } from "@utils/requests/generateResearchPoints";

type PropsType = {
  prospectId: number;
};

export default function ProspectDetailsAccountResearch(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  const [accountResearchArray, setAccountResearchArray]: any = useState([]);
  const [fetched, setFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!fetched) {
      setIsLoading(true);
      setFetched(true);
      const res = fetch(
        `${API_URL}/research/account_research_points?prospect_id=` +
          props.prospectId,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      )
        .then((res) => res.json())
        .then((res) => {
          setAccountResearchArray(res);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }
  }, [fetched]);

  return (
    <Card shadow="sm" p="lg" radius="md" mt="md" withBorder>
      <Group position="apart">
        <Text weight={700} size="lg">
          Account Research
        </Text>
        <Button
          variant="light"
          size="xs"
          rightIcon={<IconReload size="0.975rem" />}
          onClick={async () => {
            await displayNotification(
              "regenerate-research-points",
              async () => {
                let result = await generateResearchPoints(
                  userToken,
                  props.prospectId
                );
                return result;
              },
              {
                title: `Reattempting Research...`,
                message: `Working with servers...`,
                color: "teal",
              },
              {
                title: `Scheduled!`,
                message: `We're reattempting our research on this prospect. Check back later (reopen this drawer later)!`,
                color: "teal",
              },
              {
                title: `Error while reattempting research.`,
                message: `Please try again later.`,
                color: "red",
              }
            );
          }}
        >
          Reattempt Research
        </Button>
      </Group>
      {accountResearchArray.length > 0 ? (
        <Text mb="xs" fz="sm" c="dimmed">
          Here is information collected about this prospect.
        </Text>
      ) : (
        <div>
          <Text mb="xs" fz="sm" c="dimmed">
            No account research points found.
          </Text>
        </div>
      )}
      {/* <Button size="xs" variant="light" compact mb="md">
        Regenerate Account Research
      </Button> */}
      {isLoading && <Loader variant="dots" />}
      {accountResearchArray.length > 0 && (
        <Table striped highlightOnHover withBorder withColumnBorders>
          <thead>
            <tr>
              <th>Source</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {accountResearchArray.map((item: any, index: any) => {
              return (
                <tr key={item.title}>
                  <td>{item.title}</td>
                  <td>{item.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
      {accountResearchArray.length > 0 && <GeneratedByAI />}
    </Card>
  );
}
