import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  Card,
  Container,
  Title,
  Text,
  Button,
  Flex,
  Loader,
  Table,
  Collapse,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Prospect } from "src";
import { openConfirmModal } from "@mantine/modals";
import displayNotification from "@utils/notificationFlow";

export default function DoNotContactListCaughtProspects() {
  const [userToken] = useRecoilState(userTokenState);
  const [caughtProspects, setCaughtProspects] = useState([]); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [fetchedCaughtProspects, setFetchedCaughtProspects] = useState(false); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [loading, setLoading] = useState(false); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [opened, { toggle }] = useDisclosure(false);

  const fetchCaughtProspects = async () => {
    setLoading(true);
    const res = await fetch(
      `${API_URL}/client/do_not_contact_filters/caught_prospects`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const resp = await res.json();
    const prospects = resp.prospects;
    setCaughtProspects(prospects);
    setLoading(false);
  };

  const removeProspectFromContactList = async () => {
    setLoading(true);
    const resp = await fetch(
      `${API_URL}/client/do_not_contact_filters/remove_prospects`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    fetchCaughtProspects();
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchedCaughtProspects) {
      fetchCaughtProspects();
      setFetchedCaughtProspects(true);
    }
  }, [fetchedCaughtProspects]);

  const openProspectRemovalModal = () => {
    openConfirmModal({
      title: "⚠️ Confirm Prospect Removal ⚠️ ",
      children: (
        <>
          <Text>
            By clicking confirm, you will automatically remove{" "}
            {caughtProspects.length} prospects from your SellScale pipeline.
          </Text>
          <Text mt="md">This action is not reversible.</Text>
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => removeProspectFromContactList(),
    });
  };

  const rows = caughtProspects.map((p: Prospect) => (
    <tr key={p.id}>
      <td>{p.full_name}</td>
      <td>{p.company}</td>
      <td>{p.title}</td>

      <td>{p.overall_status.toLowerCase()}</td>
    </tr>
  ));

  return (
    <Card withBorder mr="0" mt="0">
      {loading && <Loader variant="dots" />}
      {!loading && caughtProspects.length == 0 && (
        <Container>
          <Flex>
            <Title order={5}> No prospects caught in these filters</Title>{" "}
            <Button
              color="gray"
              ml="lg"
              leftIcon={<IconRefresh />}
              onClick={fetchCaughtProspects}
            >
              Refresh
            </Button>
          </Flex>
        </Container>
      )}
      {!loading && caughtProspects.length > 0 && (
        <Container>
          <Title order={5}>
            🚨 Warning: {caughtProspects.length} prospects caught in these
            filters
          </Title>
          <Text size="sm">
            {caughtProspects.length} prospects are currently still in the
            SellScale pipeline that meet these criteria. Press the button below
            to remove them from the pipeline.
          </Text>
          <Flex>
            <Button mt="md" color="red" onClick={openProspectRemovalModal}>
              Remove {caughtProspects.length} Prospects
            </Button>
            <Button
              mt="md"
              ml="md"
              variant="outline"
              color="red"
              onClick={toggle}
            >
              {opened ? "Hide" : "View"} Prospects
            </Button>
            <Button
              color="gray"
              ml="lg"
              mt="md"
              leftIcon={<IconRefresh />}
              onClick={fetchCaughtProspects}
            >
              Refresh
            </Button>
          </Flex>
          <Collapse in={opened}>
            <Card withBorder mt="lg">
              <Table striped highlightOnHover withBorder withColumnBorders>
                <thead>
                  <tr>
                    <th>Prospect Name</th>
                    <th>Company</th>
                    <th>Title</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </Table>
            </Card>
          </Collapse>
        </Container>
      )}
    </Card>
  );
}
