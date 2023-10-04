import { SCREEN_SIZES } from "@constants/data";
import {
  Badge,
  Box,
  Text,
  Flex,
  Grid,
  Button,
  Table,
  Switch,
  Card,
  ActionIcon,
  Tabs,
  Tooltip,
  TextInput,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import ManageEmailSubjectLineTemplatesModal from "@modals/ManageEmailSubjectLineTemplatesModal";
import { IconCheck, IconEdit, IconPencil, IconReload, IconTrash, IconX } from "@tabler/icons";
import React, { FC } from "react";
import { EmailSequenceStep, SubjectLineTemplate } from "src";


const DetailEmailSequencing: FC<{
  toggleDrawer: () => void,
  currentTab: string,
  templates: EmailSequenceStep[],
  subjectLines: SubjectLineTemplate[],
}> = ({
  toggleDrawer,
  currentTab,
  templates,
  subjectLines,
}) => {
    const lgScreenOrLess = useMediaQuery(
      `(max-width: ${SCREEN_SIZES.LG})`,
      false,
      { getInitialValueInEffect: true }
    );
    return (
      <Box mt="md">
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <Text fw={700} size={"xl"}>
              Set First Message
            </Text>
          </Flex>
          {lgScreenOrLess && <Button onClick={toggleDrawer}>Open toggle</Button>}
        </Flex>

        <Box mt={"sm"}>
          <Text color="gray.6" size={"sm"} fw={600}>
            Configure your email sequencing
          </Text>
        </Box>

        <Box mt={"md"}>
          <Text color="gray.8" size={"md"} fw={700}>
            EXAMPLE EMAIL
          </Text>
          <Box
            mt="sm"
            px={"sm"}
            py={"md"}
            sx={(theme) => ({
              borderRadius: "12px",
              border: `1px dashed ${theme.colors.blue[5]}`,
            })}
            pos={"relative"}
          >
            <Button
              variant="light"
              pos={"absolute"}
              style={{ right: 20, top: 20 }}
              leftIcon={<IconReload></IconReload>}
            >
              REGENERATE
            </Button>
            <Flex>
              <Box w={80}>
                <Text color="gray.6" fw={500}>
                  Subject:
                </Text>
              </Box>
              <Box>
                <Text color="gray.8" fw={500} pr={200}>
                  {subjectLines && subjectLines.filter((subjectLine: SubjectLineTemplate) => subjectLine.active)[0]?.subject_line}
                </Text>
              </Box>
            </Flex>
            <Flex mt={"md"}>
              <Box w={80}>
                <Text color="gray.6" fw={500} pr={200}>
                  Body:
                </Text>
              </Box>
              <Flex direction={"column"} gap={"0.5rem"}>
                <Text color="gray.8" fw={500}>
                  Hi Richard
                </Text>
                <Text color="gray.8" fw={500}>
                  In working with other industry, on of the key issuse they're
                  struggling with is key issue.
                </Text>
                <Text color="gray.8" fw={500}>
                  All the best,
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Box>

        <Tabs defaultValue={currentTab === "PROSPECTED" ? "subject" : "body"} mt='sm'>
          <Tabs.List>
            {
              currentTab === "PROSPECTED" && (
                <Tabs.Tab value="subject">
                  Subject Lines
                </Tabs.Tab>
              )
            }

            <Tabs.Tab value="body">
              Body
            </Tabs.Tab>
          </Tabs.List>

          {
            currentTab === "PROSPECTED" && (
              <Tabs.Panel value="subject">
                <Flex direction='column' w='100%'>
                  {subjectLines.map((subjectLine: SubjectLineTemplate, index: any) => {
                    return (
                      <Box key={index} w={"100%"}>
                        <SubjectLineItem subjectLine={subjectLine}></SubjectLineItem>
                      </Box>
                    )
                  })}
                </Flex>
              </Tabs.Panel>
            )
          }


          <Tabs.Panel value="body">
            <Box mt={"md"}>
              <Table
                verticalSpacing="sm"
                horizontalSpacing="sm"
                highlightOnHover
                width={"100%"}
                style={{
                  tableLayout: "auto",
                }}
              >
                <thead>
                  <tr>
                    <th>
                      <Text
                        fz={14}
                        color="gray.6"
                        fw={700}
                        style={{ textTransform: "uppercase" }}
                      >
                        Templates
                      </Text>
                    </th>
                    <th>
                      <Text
                        fz={14}
                        color="gray.6"
                        fw={700}
                        style={{ textAlign: "center", textTransform: "uppercase" }}
                      >
                        OPENED
                      </Text>
                    </th>
                    <th>
                      <Text
                        fz={14}
                        color="gray.6"
                        fw={700}
                        style={{ textAlign: "center", textTransform: "uppercase" }}
                      >
                        REPLIES
                      </Text>
                    </th>
                    <th>
                      <Text
                        fz={14}
                        color="gray.6"
                        fw={700}
                        style={{ textAlign: "center", textTransform: "uppercase" }}
                      >
                        STATUS
                      </Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template: EmailSequenceStep, index: any) => {
                    return (
                      <tr key={index}>
                        <td>
                          <Box pr={"lg"} py={"0.5rem"}>
                            <Card withBorder radius={"md"}>

                              <Flex>
                                <Box w={80}>
                                  <Text color="gray.6" fw={500}>
                                    Body:
                                  </Text>
                                </Box>
                                <Box>
                                  <Text
                                    color="gray.8"
                                    fw={500}
                                    style={{
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      width: "20vw",
                                    }}
                                  >
                                    {template.template}
                                  </Text>
                                </Box>
                              </Flex>

                              <Flex justify={"space-between"} mt={"md"}>
                                <Button variant="light" fw={700}>
                                  VIEW EXAMPLE
                                </Button>

                                <ActionIcon color="blue">
                                  <IconEdit></IconEdit>
                                </ActionIcon>
                              </Flex>
                            </Card>
                          </Box>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Tooltip label='Analytics Coming Soon!' withArrow withinPortal>
                            <Text fw={700}>TBD</Text>
                          </Tooltip>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Tooltip label='Analytics Coming Soon!' withArrow withinPortal>
                            <Text color="green" fw={700}>
                              TBD
                            </Text>
                          </Tooltip>
                        </td>
                        <td>
                          <Flex justify={"center"} align={"center"}>
                            <Switch color="green" checked={template.default}>

                            </Switch>
                          </Flex>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Box>
          </Tabs.Panel>


        </Tabs>

      </Box>
    );
  };


const SubjectLineItem: React.FC<{
  subjectLine: SubjectLineTemplate,
}> = ({ subjectLine }) => {
  const [
    manageSubjectLineOpened,
    { open: openManageSubject, close: closeManageSubject },
  ] = useDisclosure();

  const [editing, setEditing] = React.useState(false);
  const [editedSubjectLine, setEditedSubjectLine] = React.useState(subjectLine.subject_line);

  return (
    <Card
      mt='sm'
      shadow="xs"
      radius={"md"}
      py={10}
      mb={5}
      sx={(theme) => ({
        border: subjectLine.active
          ? "1px solid " + theme.colors.blue[4]
          : "1px solid transparent",
      })}
    >
      <Flex direction={"column"} w={"100%"}>
        <Flex gap={"0.5rem"} mb={"0.5rem"} justify={"space-between"}>
          <Flex>
            <Tooltip
              label={`Prospects: ${subjectLine.times_accepted} / ${subjectLine.times_used}`}
              withArrow
              withinPortal
            >
              <Button
                variant={'white'}
                size="xs"
                color={'blue'}
                h="auto"
                fz={"0.75rem"}
                py={"0.125rem"}
                px={"0.25rem"}
                fw={"400"}
              >
                Acceptance: {Math.max(Math.floor(subjectLine.times_accepted / subjectLine.times_used) || 0)}%
              </Button>
            </Tooltip>
          </Flex>

          <Flex wrap={"wrap"} gap={"1rem"} align={"center"}>
            {/* <Menu shadow="md" width={200} withinPortal withArrow>
                <Menu.Target>
                  <ActionIcon radius="xl" size="sm">
                    <IconPencil size="1.0rem" />
                  </ActionIcon>
                </Menu.Target>
  
                <Menu.Dropdown>
                  <Menu.Item icon={<IconEdit size={14} />} onClick={onClickEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconTrash size={14} />}
                    onClick={onClickDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu> */}
            <ActionIcon
              radius="xl"
              size="sm"
              onClick={() => {
                openManageSubject();
                setEditing(!editing);
              }}
            >
              <IconPencil size="1.0rem" />
            </ActionIcon>
            <ActionIcon radius="xl" size="sm">
              <IconTrash size="1.0rem" />
            </ActionIcon>
            <Switch
              checked={subjectLine.active}
              color={"blue"}
              size="xs"
            // onChange={({ currentTarget: { checked } }) => onToggle(checked)}
            />
          </Flex>
          <ManageEmailSubjectLineTemplatesModal
            modalOpened={manageSubjectLineOpened}
            openModal={openManageSubject}
            closeModal={closeManageSubject}
            backFunction={() => { }}
            archetypeID={subjectLine.client_archetype_id}
          />
        </Flex>

        {
          editing ? (
            <TextInput
              value={editedSubjectLine}
              rightSection={
                <Flex mr='32px'>
                  <ActionIcon
                    size='sm'
                    mr='2px'
                    variant='transparent'
                    color='red'
                    onClick={() => {
                      setEditedSubjectLine(subjectLine.subject_line);
                      setEditing(false);
                    }}
                  >
                    <IconX />
                  </ActionIcon>
                  <ActionIcon
                    size='sm'
                    variant='transparent'
                    color='green'
                    onClick={() => {
                      setEditing(false);
                    }}
                  >
                    <IconCheck />
                  </ActionIcon>
                </Flex>
              }
              onChange={(e) => {
                setEditedSubjectLine(e.currentTarget.value);
              }}
            />
          ) : (
            <Text fw={"400"} fz={"0.9rem"} color={"gray.8"}>
              {subjectLine.subject_line}
            </Text>
          )
        }
      </Flex>
    </Card >
  )
}





export default DetailEmailSequencing;
