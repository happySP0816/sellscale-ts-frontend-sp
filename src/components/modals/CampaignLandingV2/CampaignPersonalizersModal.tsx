import { ActionIcon, Avatar, Badge, Box, Button, Checkbox, Divider, Title, Flex, Paper, ScrollArea, Select, Text, Textarea, Tooltip, Loader, Modal, Center, SegmentedControl, TextInput } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { IconBrandLinkedin, IconBuilding, IconBulb, IconEdit, IconPlus, IconPoint, IconQuestionMark, IconSearch, IconTrash } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import {useRecoilState, useRecoilValue} from "recoil";
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { getProspects } from '@utils/requests/getProspects';
import { modals } from '@mantine/modals';
import * as researchers from "@utils/requests/researchers";
import { useState, useEffect, useRef } from "react";
import QuestionModal from "./QuestionModal";

export default function CampaignPersonalizersModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  id(id: any): number;
  ai_researcher_id: number;
  setPersonalizers: Function;
}>) {

  const [loadingProspects, setLoadingProspects] = useState(false);
  const [prospectData, setProspectData] = useState([]);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [researching, setResearching] = useState(false);

  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    setLoadingProspects(true);
    // researchers.getResearchers(userToken).then((data) => {
    //   console.log('researchers are', data);
    // }
    // );
    getProspects(userToken, undefined, undefined, undefined, undefined, undefined, Number(id)).then((data) => {
      const newProspectData = data.data.map((item) => ({
        value: item.id,
        label: item.full_name,
      }));
      setProspectData(newProspectData);
      setLoadingProspects(false);
    }
    );

    researchers.getArchetypeQuestions(userToken, Number(innerProps.id)).then((data) => {
      console.log('research data is', data);
      const newResearchData = data.questions.map((item) => ({
        id: item.id,
        title: item.key,
        type: item.type,
        content: item.relevancy,
        ai_response: '',
        status: '',
      }));
      setResearchData(newResearchData);
    });
  } ,[]);

  const simulateResearch = (prospectId: Number) => {
    setResearching(true);
    researchers.createResearcherAnswer(userToken, prospectId).then((data) => {
      researchers.getResearcherAnswers(userToken, Number(prospectId)).then((data) => {
        console.log('researchers' , data);
          const newSimulateData = data.answers
            .map((item: any) => ({
              title: item.question.key,
              type: item.question.type,
              content: item.short_summary,
              ai_response: item.relevancy_explanation,
              status: item.is_yes_response,
            }))
            .sort((a, b) => b.status - a.status); //sort by status true first.
          setSimulateData(newSimulateData);
          setResearching(false);
      });
    });
  }

  const [researchData, setResearchData] = useState([]);
  const [simulateData, setSimulateData] = useState([
  ]);
  return (
    <>
      {/* <Paper withBorder w={"100%"}>
        <Box p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
          <Text size={"lg"} fw={600}>
            Example Contact
          </Text>
          <Flex justify={"space-between"} style={{ border: "1px solid #3B85EF", borderRadius: "6px", padding: "12px" }}>
            <Box>
              <Flex gap={10}>
                <Avatar src={""} size={"xl"} radius={"100%"} />
                <Box>
                  <Text fw={600} size={"xl"}>
                    {"Aaron Cessar"}
                  </Text>
                  <Text fw={400} size={"xs"}>
                    {"Founding Software Engineer @ SellScale"}
                  </Text>
                  <Text fw={400} color="gray" size={"xs"}>
                    {"San Francisco, CA"}
                  </Text>
                  <Flex gap={3} align={"center"} mt={4}>
                    <IconBuilding size={"0.9rem"} color="gray" />
                    <Text fw={400} color="gray" size={"xs"}>
                      {"SellScale, Wanderer's Guide, and 7 more"}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Box>
            <ActionIcon>
              <IconEdit />
            </ActionIcon>
          </Flex>
        </Box>
        <ScrollArea h={400} scrollbarSize={8} mt={"sm"}>
          <Box p={"lg"}>
            <Text size={"lg"} fw={600}>
              Personalizations
            </Text>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#3B85EF" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#3B85EF">
                  Account Research
                </Text>
              </Flex>
              <Paper withBorder p={"xs"}>
                <Checkbox label="Are they hiring for SDRs on any job boards?" />
                <Textarea mt={"sm"} label="Explain how this is relevant:" placeholder="Job boards mean they need more top of funnel." minRows={3} />
              </Paper>
              <Checkbox
                label="Does their website mention anything about a login button?"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    paddingInline: "12px",
                    paddingBlock: "8px",
                  },
                }}
                mt={"sm"}
              />
              <Button
                mt={"sm"}
                leftIcon={<IconPlus size={"0.9rem"} />}
                w={"100%"}
                variant="outline"
                styles={{
                  root: {
                    display: "flex",
                    justifyContent: "start",
                  },
                }}
              >
                Add research point
              </Button>
            </Box>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#17b26a" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#17b26a">
                  Account Level Personalization
                </Text>
              </Flex>
              <Checkbox.Group>
                <Flex direction={"column"} gap={"sm"}>
                  <Checkbox
                    value="company_news"
                    label="Company News"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                  <Checkbox
                    value="company_tools"
                    label="Company Tools"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                  <Checkbox
                    value="company_website"
                    label="Company Websit"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                </Flex>
              </Checkbox.Group>
            </Box>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#d444f1" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#d444f1">
                  Prospect Level Personalization
                </Text>
              </Flex>
              <Paper withBorder p={"xs"}>
                <Checkbox label="Linkedin Bio" />
                <Textarea
                  mt={"sm"}
                  label="Explain how this is relevant:"
                  placeholder="For eg. `If bio mentions data, that means they're likely involved in data pipelines`"
                  minRows={3}
                />
              </Paper>
              <Checkbox
                label="Linkedin Current Experience"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    paddingInline: "12px",
                    paddingBlock: "8px",
                  },
                }}
                mt={"sm"}
              />
            </Box>
          </Box>
        </ScrollArea>
      </Paper>
      <Flex gap={"md"} mt={"md"}>
        <Button fullWidth variant="outline" color="gray">
          Go Back
        </Button>
        <Button
          fullWidth
          onClick={() => {
            innerProps.setPersonalizers(personalizersData);
            context.closeModal(id);
          }}
        >
          Save
        </Button>
      </Flex> */}
      <Flex mt={"lg"} style={{ border: "1px solid gray", borderRadius: "6px" }}>
        <Paper p={"md"} pr={"xs"} w={"40%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
          <Flex align={"center"} justify={"space-between"}>
            <Text fw={600}>Researcher Questions</Text>
            <Tooltip
              multiline
              position="right"
              label="SellScale AI Researcher will answer these questions by scouring the web, LinkedIn, and other sources to develop a better understanding for each prospect you reach out to for the most relevant and personalized messaging."
            >
              <ActionIcon>
                <IconQuestionMark size={"1rem"} />
              </ActionIcon>
            </Tooltip>
          </Flex>
          <Flex>
            <Button
              fullWidth
              leftIcon={<IconPlus size={"0.9rem"} />}
              mr={"md"}
              onClick={() => {
                modals.openContextModal({
                  modal: "addQuestionModal",
                  title: (
                    <Title order={3}>
                      <span className=" text-gray-500">Add</span> Research Point
                    </Title>
                  ),
                  innerProps: {
                    ai_researcher_id: innerProps.ai_researcher_id,
                    campaign_id: innerProps.id,
                    setPersonalizers: innerProps.setPersonalizers,
                  },
                });
              }}
            >
              Research point
            </Button>
            <Button
              fullWidth
              variant="outline"
              color="pink"
              leftIcon={<IconSparkles size={"0.9rem"} />}
              onClick={() =>
                openContextModal({
                  modal: "simulatepersonalizerModal",
                  title: (
                    <Title order={3}>
                      <span className=" text-gray-500">Go back to</span> Personalizers
                    </Title>
                  ),
                  innerProps: {},
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "700px",
                    },
                  },
                })
              }
            >
              Personalize
            </Button>
          </Flex>
          <ScrollArea h={500} scrollbarSize={8} pr={"md"}>
            <Flex h={"100%"} gap={"xs"} direction={"column"}>
              {researchData.map((item, index) => {
                return (
                  <Paper withBorder p={"md"} key={index}>
                    <Flex align={"start"} justify={"space-between"}>
                      <Text size={"sm"} fw={600} pt={4}>
                        {item.title}
                      </Text>
                      <Flex gap={3} align={"center"}>
                        <ActionIcon onClick={() =>
                          openContextModal({
                            modal: "addQuestionModal",
                            title: (
                              <Title order={3}>
                                <span className=" text-gray-500">Edit</span> Research Point
                              </Title>
                            ),
                            innerProps: { item, edit:true },
                            centered: true,
                            styles: {
                              content: {
                                minWidth: "500px",
                              },
                            },
                          })
                        }>
                          <IconEdit color="gray" size={"0.9rem"} />
                        </ActionIcon>
                        <ActionIcon onClick={async () => {
                          console.log('trying to delete', item);
                          researchers.deleteResearcherQuestion(userToken, Number(item.id));
                          setResearchData(prevData => prevData.filter(researchItem => researchItem.id !== item.id));
                        }}>
                          <IconTrash color="gray" size={"0.9rem"} />
                        </ActionIcon>
                        <Badge size="sm" radius={"sm"} color={item.type === "General" ? "orange" : item.type === "Linkedin" ? "" : "green"}>
                          {item.type}
                        </Badge>
                      </Flex>
                    </Flex>
                    <Text size={"sm"} mt={2}>
                      {item.content}
                    </Text>
                  </Paper>
                );
              })}
            </Flex>
          </ScrollArea>
        </Paper>
        <Divider orientation="vertical" />
        <Paper w={"66%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
          <Flex p={"lg"} justify={"space-between"} align={"center"} gap={"sm"} style={{ borderBottom: "1px solid gray" }}>
            <Text fw={600}>Simulate Research</Text>
            {loadingProspects ? (
              <Loader size="sm" />
            ) : (
              <Flex gap={"sm"} align={"center"}>
                <Text color="gray" size={"sm"}>
                  Select prospect:
                </Text>
                <Select
                  placeholder="-"
                  onChange={(value) => setSelectedProspect(value)}
                  data={prospectData}
                />
                {selectedProspect && (
                  researching ? (
                    <Loader size="sm" />
                  ) : (
                    <Button color="grape" onClick={() => simulateResearch(selectedProspect)}>
                      Simulate
                    </Button>
                  )
                )}
              </Flex>
            )}
          </Flex>
          <ScrollArea h={500} scrollbarSize={8} px={"md"}>
            {researching ? (
              <Loader size="sm" />
            ) : (
              <Flex gap={"xs"} direction={"column"}>
                {simulateData.length === 0 ? (
                  <Text size={"sm"} color="gray">
                    No simulation run yet.
                  </Text>
                ) : (
                  simulateData.map((item, index) => {
                    return (
                      <Paper withBorder p={"lg"} key={index}>
                        <Flex justify={"space-between"}>
                          <Flex>
                            <IconPoint size={"2rem"} fill={item.status ? "#17B26A" : "red"} color="white" className="mt-[-6px] ml-[-12px]" />
                            <Text fw={600} size={"sm"}>
                              {item.title}
                            </Text>
                          </Flex>
                          <Badge radius={"sm"} size="sm" color={item.type === "General" ? "orange" : item.type === "Linkedin" ? "" : "green"}>
                            {item.type}
                          </Badge>
                        </Flex>
                        <Text size={"sm"} fw={500}>
                          {item.content}
                        </Text>
                        <Flex p={"sm"} className="bg-[#D444F1]/5" gap={4} align={"start"}>
                          <Flex>
                            <IconBulb size={"0.9rem"} color="#D444F1" />
                          </Flex>
                          <Text color="#D444F1" size={"xs"}>
                            {item.ai_response}
                          </Text>
                        </Flex>
                      </Paper>
                    );
                  })
                )}
              </Flex>
            )}
          </ScrollArea>
        </Paper>
      </Flex>
      <Flex align={"center"} gap={"md"} mt={"lg"}>
        <Button variant="outline" color="gray" fullWidth onClick={() => modals.closeAll()}>
          Go Back
        </Button>
        <Button onClick={() => modals.closeAll()} fullWidth>
          Save
        </Button>
      </Flex>
    </>
  );
}
