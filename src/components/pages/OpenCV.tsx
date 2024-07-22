import { ActionIcon, Badge, Box, Button, Flex, Group, Image, Paper, Progress, rem, Select, Text, useMantineTheme } from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCloudUpload,
  IconCornerRightDown,
  IconLetterT,
  IconLink,
  IconLoader,
  IconRefresh,
  IconX,
} from "@tabler/icons";
import OpenCVImage from "../../assets/images/opencv_upload.png";
import { useState } from "react";
import { DataGrid } from "mantine-data-grid";
import { IconFileTypeJpg, IconFileTypePng } from "@tabler/icons-react";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";

type ReturnList = string[];

export default function OpenCV() {
  const theme = useMantineTheme();
  const [drop, setDrop] = useState(false);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [extractedData, setExtractedData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState("25");

  const userToken = useRecoilValue(userTokenState);

  const handleDropDown = (files: FileWithPath[]) => {
    setDrop(true);
    setFiles((prevState) => {
      return [...prevState, ...files];
    });
  };

  const uploadFiles = async () => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_URL}/contacts/image_company_extract`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
      body: formData,
    });

    if (response.ok) {
      return await response.json();
    }
  };

  const handleCopyClipboard = async () => {
    let textToCopy = "";

    extractedData.forEach((item: any) => {
      textToCopy += item.company_name + "\n";
    });

    try {
      await navigator.clipboard.writeText(textToCopy);
      showNotification({
        id: "copy-to-clipboard-success",
        title: "Copied to clipboard",
        message: "List of companies is sent to your clipboard.",
        color: "green",
        autoClose: 5000,
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleExtract = async () => {
    setLoading(true);
    // Will Perform the extractions here.
    const data = await uploadFiles();

    const list: string[][] = data["data"];

    console.log("LIST: ", list);

    setExtractedData((prevState: any[]) => {
      const prev = [...prevState];

      list.forEach((item) => {
        if (
          prev.filter((prevItem) => {
            return prevItem.company_name === item[1];
          }).length === 0
        ) {
          prev.push({
            company_name: item[1],
            source: item[0],
            status: "extracted",
          });
        }
      });

      return prev;
    });

    setLoading(false);
  };

  const formatFileSize = (sizeInBytes: any) => {
    if (sizeInBytes < 1024) {
      return sizeInBytes + " B";
    } else if (sizeInBytes < 1024 * 1024) {
      return (sizeInBytes / 1024).toFixed(2) + " KB";
    } else {
      return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
    }
  };
  return (
    <Paper p={"lg"}>
      <Flex align={"center"} justify={"space-between"}>
        <Text size={"xl"} fw={700} className="flex items-center gap-2">
          Start extraction now
          <IconCornerRightDown className="mt-1" />
        </Text>
        <Button
          leftIcon={<IconRefresh color="gray" size={"1rem"} />}
          variant="outline"
          color="gray"
          onClick={() => {
            setDrop(false);
            setFiles([]);
            setLoading(false);
            setExtractedData([]);
          }}
        >
          Reset
        </Button>
      </Flex>
      <Dropzone
        mt={"md"}
        onDrop={(files) => {
          console.log(files);
          handleDropDown(files);
        }}
        onReject={(files) => console.log("rejected files", files)}
        // maxSize={4 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        bg={"#F8F9FA"}
        multiple
      >
        <Group position="center" spacing="xl" style={{ minHeight: rem(220), pointerEvents: "none" }}>
          <Image src={OpenCVImage} width={"300px"} />
          <Dropzone.Accept>
            <IconCloudUpload size="4rem" stroke={1.5} color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size="4rem" stroke={1.5} color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconCloudUpload size="4rem" stroke={1.5} color="#228be6" />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline fw={600}>
              Drag & Drop files or <span className="text-[#228be6] underline">Browse</span> <br />
              photos of company names to start extraction
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Supported formats: PNG, JPEG | Maximum file size is 4MB
            </Text>
          </div>
        </Group>
      </Dropzone>
      {files && drop && (
        <Box mt={"md"}>
          <Flex align={"center"} justify={"space-between"}>
            <Text fw={500} size={"sm"}>
              Uploaded Files:
            </Text>
            <Button size="xs" onClick={() => handleExtract()}>
              Extract Company Names
            </Button>
          </Flex>
          {files.map((item: any, index) => {
            console.log("item", item);
            return (
              <Paper withBorder radius={"sm"} p={"sm"} key={index} mt={"sm"}>
                <Flex align={"center"} justify={"space-between"}>
                  <Flex align={"center"} gap={"xs"}>
                    {item?.type.split("/")[1].toLowerCase() === "png" ? (
                      <IconFileTypePng size={"2rem"} color="green" />
                    ) : item?.type.split("/")[1].toLowerCase() === "jpeg" ? (
                      <IconFileTypeJpg size={"2rem"} color="#228be6" />
                    ) : (
                      <></>
                    )}
                    <Box>
                      <Text size={"sm"} fw={600}>
                        {item?.name}
                      </Text>
                      <Text size={"xs"} fw={500} color="gray">
                        {formatFileSize(item.size)} | Uploaded
                      </Text>
                    </Box>
                  </Flex>
                  <Box w={300}>
                    <Flex justify={"space-between"} align={"center"}>
                      <Text color="#228be6" size={"xs"} fw={500}>
                        {100}% completed
                      </Text>
                      <Text size={"xs"} color="gray" fw={500} className="flex items-center gap-2">
                        <IconClock size={"0.9rem"} color="gray" className="mb-[2px]" />
                        {0}sec left
                      </Text>
                    </Flex>
                    <Progress value={100} />
                  </Box>
                </Flex>
              </Paper>
            );
          })}
          <Flex align={"center"} justify={"space-between"} mt={"md"}>
            <Text fw={500} size={"sm"}>
              Extracted Companies
            </Text>
            <Button size="xs" disabled={loading} onClick={() => handleCopyClipboard()}>
              Copy / Paste Company Names
            </Button>
          </Flex>
          <DataGrid
            data={extractedData}
            loading={loading}
            highlightOnHover
            withPagination
            withSorting
            withColumnBorders
            withBorder
            mt={"sm"}
            sx={{
              cursor: "pointer",
              "& .mantine-10xyzsm>tbody>tr>td": {
                padding: "0px",
              },
              "& tr": {
                background: "white",
              },
            }}
            columns={[
              {
                accessorKey: "id",
                minSize: 40,
                maxSize: 40,
                enableSorting: false,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <Text color="gray">#</Text>
                  </Flex>
                ),
                cell: (cell) => {
                  return (
                    <Flex w={"100%"} h={"100%"} px={"sm"} py={"xs"} align={"center"} justify={"start"}>
                      <Text size={"sm"} fw={500} color="gray">
                        {cell.row.index + 1}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "company_name",
                minSize: 250,
                maxSize: 250,
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">Company Name</Text>
                  </Flex>
                ),
                cell: (cell) => {
                  const { company_name } = cell.row.original;

                  return (
                    <Flex w={"100%"} h={"100%"} px={"sm"} py={"xs"} align={"center"} justify={"start"}>
                      <Text size={"sm"} fw={500}>
                        {company_name}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "source",
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLink color="gray" size={"0.9rem"} />
                    <Text color="gray">Source</Text>
                  </Flex>
                ),
                minSize: 400,
                cell: (cell) => {
                  const { source } = cell.row.original;

                  return (
                    <Flex w={"100%"} h={"100%"} px={"sm"} py={"xs"} align={"center"} justify={"start"}>
                      <Text lineClamp={1} size={"sm"} fw={500}>
                        {source}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "status",
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLoader color="gray" size={"0.9rem"} />
                    <Text color="gray">Status</Text>
                  </Flex>
                ),
                cell: (cell) => {
                  const { status } = cell.row.original;

                  return (
                    <Flex gap={"sm"} w={"100%"} px={"sm"} h={"100%"} align={"center"}>
                      <Badge tt={"initial"}>{status}</Badge>
                    </Flex>
                  );
                },
              },
            ]}
            options={{
              enableFilters: true,
            }}
            //   loading={loading}
            components={{
              pagination: ({ table }) => (
                <Flex
                  justify={"space-between"}
                  align={"center"}
                  px={"sm"}
                  py={"1.25rem"}
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderTopWidth: 0,
                  })}
                >
                  <Select
                    style={{ width: "150px" }}
                    data={[
                      { label: "Show 25 rows", value: "25" },
                      { label: "Show 10 rows", value: "10" },
                      { label: "Show 5 rows", value: "5" },
                    ]}
                    value={pageSize}
                    onChange={(v) => {
                      setPageSize(v ?? "25");
                    }}
                  />
                  <Flex align={"center"} gap={"sm"}>
                    <Flex align={"center"}>
                      <Select
                        maw={100}
                        value={`${table.getState().pagination.pageIndex + 1}`}
                        data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
                          label: String(idx + 1),
                          value: String(idx + 1),
                        }))}
                        onChange={(v) => {
                          table.setPageIndex(Number(v) - 1);
                        }}
                      />
                      <Flex
                        sx={(theme) => ({
                          borderTop: `1px solid ${theme.colors.gray[4]}`,
                          borderRight: `1px solid ${theme.colors.gray[4]}`,
                          borderBottom: `1px solid ${theme.colors.gray[4]}`,
                          marginLeft: "-2px",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                        })}
                        h={36}
                      >
                        <Text color="gray.5" fw={500} fz={14}>
                          of {table.getPageCount()} pages
                        </Text>
                      </Flex>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={table.getState().pagination.pageIndex === 0}
                        onClick={() => {
                          table.setPageIndex(table.getState().pagination.pageIndex - 1);
                        }}
                      >
                        <IconChevronLeft stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                        onClick={() => {
                          table.setPageIndex(table.getState().pagination.pageIndex + 1);
                        }}
                      >
                        <IconChevronRight stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ),
            }}
            w={"100%"}
            pageSizes={[pageSize]}
            styles={(theme) => ({
              thead: {
                height: "44px",
                backgroundColor: theme.colors.gray[0],
                "::after": {
                  backgroundColor: "transparent",
                },
              },

              wrapper: {
                gap: 0,
              },
              scrollArea: {
                paddingBottom: 0,
                gap: 0,
              },

              dataCellContent: {
                width: "100%",
              },
            })}
          />
        </Box>
      )}
    </Paper>
  );
}
