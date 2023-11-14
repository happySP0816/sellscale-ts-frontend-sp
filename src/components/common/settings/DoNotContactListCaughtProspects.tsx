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
  Box,
  Collapse,
  Pagination,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronUp, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Prospect } from "src";
import { openConfirmModal } from "@mantine/modals";
import displayNotification from "@utils/notificationFlow";
import { truncate } from 'lodash';
import { deterministicMantineColor } from '@utils/requests/utils';

export default function DoNotContactListCaughtProspects(props: { forSDR?: boolean }) {
  const [userToken] = useRecoilState(userTokenState);
  const [caughtProspects, setCaughtProspects] = useState([]); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [fetchedCaughtProspects, setFetchedCaughtProspects] = useState(false); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [loading, setLoading] = useState(false); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
  const [opened, { toggle }] = useDisclosure(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Adjust as needed

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate the total number of pages
  const totalPages = Math.ceil(caughtProspects.length / itemsPerPage);

  // Slice data for the current page
  const paginatedProspects = caughtProspects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCaughtProspects = async () => {
    setLoading(true);
    const res = await fetch(
      `${API_URL}/client${props.forSDR ? `/sdr` : ``}/do_not_contact_filters/caught_prospects`,
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
      `${API_URL}/client${props.forSDR ? `/sdr` : ``}/do_not_contact_filters/remove_prospects`,
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

  const rows = paginatedProspects.map((p: Prospect) => (
    <tr key={p.id} style={{height: '20px !important;'}}>
      <td style={{width: '15%'}}><Text fz='xs'>{truncate(p.full_name, {length: 20})}</Text></td>
      <td style={{width: '15%'}}><Text fz='xs'>{truncate(p.company, {length: 25})}</Text></td>
      <td style={{width: '30%'}}><Text fz='xs'>{truncate(p.title, {length: 50})}</Text></td>
      <td style={{width: '15%'}}><Text fz='xs'>{truncate(p.industry, {length: 20})}</Text></td>
      <td style={{width: '15%'}}><Badge size='xs' color={deterministicMantineColor(p.overall_status)}>{p.overall_status.toUpperCase().replaceAll("_", " ")}</Badge></td>
      <td style={{width: '10%'}}>{p.matched_filter_words?.map((x: string) => <Badge color={deterministicMantineColor(x)} size='xs'>{x}</Badge>)}</td>
    </tr>
  ));

  return (
    <Card mr="0" mt="0">
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
        <Box>
          <Title order={5}>
            🚨 Warning: {caughtProspects.length >= 500 ? caughtProspects.length + '+' : caughtProspects.length} prospects caught in these
            filters
          </Title>
          <Text size="sm">
            {caughtProspects.length >= 500 && "More than "} {caughtProspects.length} prospects are currently still in the
            SellScale pipeline that meet these criteria. Press the button below
            to remove them from the pipeline.
          </Text>
          <Flex>
            <Button mt="md" color="red" onClick={openProspectRemovalModal}>
              Remove {caughtProspects.length} Prospects
            </Button>
            <Button
              ml='auto'
              color="gray"
              mt="md"
              leftIcon={<IconRefresh />}
              onClick={fetchCaughtProspects}
            >
              Refresh
            </Button>
          </Flex>
          <Card withBorder mt="lg">
            <Table striped highlightOnHover withBorder withColumnBorders>
              <thead>
                <tr>
                  <th>Prospect Name</th>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Matched Filters</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </Table>
          </Card>
          {/* @ts-ignore */}
          <Pagination page={currentPage} onChange={handlePageChange} total={totalPages} mt='md' />
        </Box>
      )}
    </Card>
  );
}
