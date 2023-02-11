import { Box, Flex, Grid, Image, Text, Chip } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons";
import { MultiSelect } from "@mantine/core";

const COMPANIES: any = [
  {
    id: "8797",
    full_name: "Kevin Monahan",
    company: "Energy Data Management Services, LLC",
    title: "Director - Analytics and Forecasting",
    industry: "Internet",
    status: "SENT_OUTREACH",
  },
  {
    id: "2649",
    full_name: "Kyle Miller, M.Ed",
    company: "Phyllis Bodel Child Care Ctr",
    title: "Executive Director at Phyllis Bodel Child Care Ctr",
    industry: "Education Management",
    status: "SENT_OUTREACH",
  },
  {
    id: "6977",
    full_name: "Rob Pontarelli",
    company: "Magellan Development Group",
    title: "Senior VP Marketing",
    industry: "",
    status: "SENT_OUTREACH",
  },
  {
    id: "864",
    full_name: "Samantha Pang",
    company: "Helpshift",
    title: "VP Customer Success",
    industry: "Internet",
    status: "SENT_OUTREACH",
  },
  {
    id: "5466",
    full_name: "Utkarsh Jain",
    company: "Sisu",
    title: "Software Engineer at Sisu",
    industry: "Computer Software",
    status: "SENT_OUTREACH",
  },
  {
    id: "2361",
    full_name: "Laurie Lyons",
    company: "Pegasus Residential",
    title: "Vice President Client Services",
    industry: "Real Estate",
    status: "SENT_OUTREACH",
  },
  {
    id: "2538",
    full_name: "Kisha Dowell Donahue",
    company: "Wood Partners",
    title: "Vice President Of Technology at Wood Partners",
    industry: "Real Estate",
    status: "SENT_OUTREACH",
  },
  {
    id: "2650",
    full_name: "Nancy Moya",
    company: "Learning Care Group",
    title: "Education Management Professional",
    industry: "Education Management",
    status: "SENT_OUTREACH",
  },
  {
    id: "64",
    full_name: "Wendy Rodriguez",
    company: "Verizon",
    title: "Executive Compensation Manager",
    industry: "Information Technology and Services",
    status: "SENT_OUTREACH",
  },
  {
    id: "9556",
    full_name: "Morgan Meyer, CPA, CHFP",
    company: "Howard County Medical Center",
    title: "CFO at Howard County Medical Center",
    industry: "Accounting",
    status: "SENT_OUTREACH",
  },
];
const PAGE_SIZES = [8, 8, 8];

export default function ProspectTable() {
  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(COMPANIES.slice(0, pageSize));

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecords(COMPANIES.slice(from, to));
  }, [page, pageSize]);

  return (
    <Box>
      <Grid grow>
        <Grid.Col span={4}>
          <TextInput
            label="Search Prospects"
            placeholder="Search by Name, Company, Title, or Industry"
            mb="md"
            width={"500px"}
            icon={<IconSearch size={14} />}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <MultiSelect
            data={[
              "Prospected",
              "Sent Outreach",
              "Accepted",
              "Bumped",
              "Active Conversation",
              "Scheduling",
              "Demo Set",
              "Demo Complete",
              "Demo Missed",
            ]}
            mb="md"
            label="Filter by Status"
            placeholder="Pick all that you like"
            searchable
            nothingFound="Nothing found"
          />
        </Grid.Col>
      </Grid>

      <DataTable
        withBorder
        records={records}
        verticalSpacing="sm"
        highlightOnHover
        columns={[
          {
            accessor: "full_name",
            render: (x: any) => {
              return (
                <Flex>
                  <Image
                    src={
                      "https://ui-avatars.com/api/?background=random&name=" +
                      x.full_name.replaceAll(" ", "+")
                    }
                    radius="lg"
                    height={30}
                    width={30}
                  ></Image>
                  <Text ml="md">{x.full_name}</Text>
                </Flex>
              );
            },
          },
          { accessor: "company" },
          { accessor: "title" },
          { accessor: "industry" },
          {
            accessor: "status",
            render: (x: any) => {
              return (
                <Chip defaultChecked color="teal">
                  {x.status.replaceAll("_", " ").toLowerCase()}
                </Chip>
              );
            },
          },
        ]}
        totalRecords={COMPANIES.length}
        recordsPerPage={pageSize}
        page={page}
        onPageChange={(p) => setPage(p)}
        recordsPerPageOptions={PAGE_SIZES}
        onRecordsPerPageChange={setPageSize}
      />
    </Box>
  );
}
