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
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronUp, IconRefresh } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Prospect } from "src";
import { openConfirmModal } from "@mantine/modals";
import displayNotification from "@utils/notificationFlow";
import { truncate } from "lodash";
import { deterministicMantineColor } from "@utils/requests/utils";

export default function DoNotContactListCaughtProspects(props: {
  forSDR?: boolean;
  needsSave?: boolean;
  caughtProspects: any[];
  setCaughtProspects: React.Dispatch<React.SetStateAction<never[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { caughtProspects, setCaughtProspects, loading, setLoading } = props;
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();
  const [fetchedCaughtProspects, setFetchedCaughtProspects] = useState(false); // [ { id: 1, name: "John Doe", company: "Medicus", title: "CEO" }
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
      `${API_URL}/client${
        props.forSDR ? `/sdr` : ``
      }/do_not_contact_filters/caught_prospects`,
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
    fetchCaughtProspects();
    setLoading(false);
  };

  useEffect(() => {
    if (!fetchedCaughtProspects) {
      fetchCaughtProspects();
      setFetchedCaughtProspects(true);
    }
  }, [fetchedCaughtProspects]);
  console.log(paginatedProspects);
  const rows = paginatedProspects.map((p: Prospect) => (
    <tr
      key={p.id}
      style={{ height: "20px !important;", background: theme.white }}
    >
      <td style={{ width: "15%" }}>
        <Text fz="xs">{truncate(p.full_name, { length: 20 })}</Text>
      </td>
      <td style={{ width: "15%" }}>
        <Text fz="xs">{truncate(p.company, { length: 25 })}</Text>
      </td>
      <td style={{ width: "30%" }}>
        <Text fz="xs">{truncate(p.title, { length: 50 })}</Text>
      </td>
      <td style={{ width: "15%" }}>
        <Text fz="xs">{truncate(p.industry, { length: 20 })}</Text>
      </td>
      <td style={{ width: "15%" }}>
        <Badge size="xs" color={deterministicMantineColor(p.overall_status)}>
          {p.overall_status.toUpperCase().replaceAll("_", " ")}
        </Badge>
      </td>
      <td style={{ width: "10%" }}>
        {p.matched_filter_words?.map((x: string, i: number) => (
          <Badge
            color={deterministicMantineColor(x)}
            size="xs"
            style={{
              fontFamily: `${
                p.matched_filters && p.matched_filters[i] === "Title"
                  ? "intern"
                  : "tronic"
              }`,
            }}
          >
            {x}
          </Badge>
        ))}
      </td>
    </tr>
  ));

  return (
    <Box mr="0" mt="0" p={0}>
      {loading && <Loader variant="dots" />}

      {!loading && caughtProspects.length > 0 && (
        <Box>
          <Table
            highlightOnHover
            withBorder
            withColumnBorders
            styles={() => ({})}
          >
            <thead
              style={{
                padding: "1rem",
                background: theme.colors.gray[2],
              }}
            >
              <tr>
                <th style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  Prospect Name
                </th>
                <th style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  Company
                </th>
                <th style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  Title
                </th>
                <th style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  Industry
                </th>
                <th style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  Status
                </th>
                <th style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  Matched Filters
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>

          {/* @ts-ignore */}
          <Pagination
            value={currentPage}
            onChange={handlePageChange}
            total={totalPages}
            mt="md"
          />
        </Box>
      )}
    </Box>
  );
}
