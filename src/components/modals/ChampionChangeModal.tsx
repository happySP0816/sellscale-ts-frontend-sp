import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from 'recoil';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { Button, Flex, Group, Tabs, Text, TextInput, rem, useMantineTheme, Loader, ActionIcon } from "@mantine/core";
import { IconBrandLinkedin, IconCloud, IconCloudUpload, IconFileSpreadsheet, IconFileUpload, IconUpload, IconX } from "@tabler/icons";
import LinkedinAvatar from "@pages/LinkedinAvatar";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { getIndividual } from "@utils/requests/getIndividuals";
import { createProspectFromLinkedinLink, createManyProspectsFromLinkedinLinks } from "@utils/requests/createProspectFromLinkedinLink";
import { markProspectsAsChampion } from "@utils/requests/createProspectFromLinkedinLink";
import { convertFileToJSON } from "@utils/fileProcessing";
import { showNotification } from "@mantine/notifications";
import { IconCsv } from "@tabler/icons-react";
import { link } from "fs";
import { closeAllModals } from "@mantine/modals";

export default function ChampionChangeModal() {
  const theme = useMantineTheme();
  const [currentTab, setCurrentTab] = useState<string | null>("linkedin");
  const [preview, setPreview] = useState(false);
  const MAX_FILE_SIZE_MB = 2;
  const userToken = useRecoilValue(userTokenState);

  const [fileJSON, setFileJSON] = useState<any[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [createNext, setCreateNext] = useState(false);

  const [individual, setIndividual] = useState<any | null>(null);
  const [loadingIndividual, setLoadingIndividual] = useState(false);
  const [loadingChampion, setLoadingChampion] = useState(false);

  function isValidLinkedInProfile(url: string) {
    const regex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/;
    if (regex.test(url)) setPreview(true);
  }

  useEffect(() => {
    isValidLinkedInProfile(linkedinUrl);
  }, [linkedinUrl]);

  return (
    <>
      <Tabs
        variant="unstyled"
        value={currentTab}
        onTabChange={(value) => {
          setCurrentTab(value);
          setPreview(false);
          setCreateNext(false);
          setLinkedinUrl("");
          setFileJSON(null);
          setFile(null);
        }}
        styles={{
          tabsList: {
            background: "#F3F4F6",
          },
          tab: {
            margin: "5px",
            "&[data-active]": {
              backgroundColor: "white",
              borderColor: theme.colors.blue[theme.fn.primaryShade()],
              color: theme.black,
              fontWeight: 500,
              borderRadius: "6px",
            },
          },
          tabLabel: {
            display: "flex",
            alignItems: "center",
            gap: "3px",
          },
        }}
      >
        <Tabs.List grow>
          <Tabs.Tab value="linkedin">
            <IconBrandLinkedin size={"0.9rem"} />
            Add via Linkedin
          </Tabs.Tab>
          <Tabs.Tab value="csv">
            <IconFileUpload size={"0.9rem"} />
            Add via CSV
          </Tabs.Tab>
          <Tabs.Tab value="crm" disabled>
            <IconCloud size={"0.9rem"} />
            Add via CRM
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="linkedin" pt="xs">
          <TextInput
            value={linkedinUrl}
            label="Linkedin URL:"
            type="text"
            placeholder="For eg. https://linkedin.com/johndoe"
            onChange={(e) => {
              setLinkedinUrl(e.target.value);
              if (e.target.value === '') {
                setLinkedinUrl('');
                setIndividual(undefined);
                setCreateNext(false);
              }
            }}
            rightSection={
              linkedinUrl && (
                <ActionIcon
                  onClick={() => {
                    setLinkedinUrl('');
                    setIndividual(undefined);
                    setCreateNext(false);
                  }}
                >
                  <IconX />
                </ActionIcon>
              )
            }
          />
          {loadingIndividual ? (
            <Loader />
          ) : createNext && (
            <LinkedinAvatar 
              name={individual?.data.full_name} 
              avatar={individual?.data.img_url} 
              title={individual?.data.title} 
              location={individual?.data.location?.default} 
              experience={
                individual?.data.work.history.slice(0, 2).map((h: { company: { name: string } }) => h.company.name).join(', ') +
                (individual?.data.work.history.length > 2 ? `, and ${individual?.data.work.history.length - 2} more` : '')
              }
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="csv" pt="xs">
          {!fileJSON ? (
            <Dropzone
              loading={false}
              multiple={false}
              maxSize={MAX_FILE_SIZE_MB * 1024 ** 2}
              onDrop={async (files: any) => {
                setFile(files[0]);
                setPreview(true);
                const result = await convertFileToJSON(files[0]);

                if (result instanceof DOMException) {
                  showNotification({
                    id: "file-upload-error",
                    title: `Error uploading file`,
                    message: result.message,
                    color: "red",
                    autoClose: 5000,
                  });
                } else {
                  setFileJSON(
                    result.map((row: any, index: number) => {
                      return {
                        id: index,
                        ...row,
                      };
                    })
                  );
                }
              }}
              onReject={(files: any) => {
                const error = files[0].errors[0];
                showNotification({
                  id: "file-upload-error",
                  title: `Error uploading file`,
                  message: error.message,
                  color: "red",
                  autoClose: 5000,
                });
              }}
              accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx, "text/tsv", "text/tab-separated-values"]}
              bg={"#f5f9ff"}
              style={{ border: "2px solid #afcdf9", borderStyle: "dashed" }}
            >
              <Flex align={"center"} justify={"center"} gap={80} py={20} style={{ minHeight: 200, pointerEvents: "none" }}>
                <Group>
                  <Dropzone.Accept>
                    <IconUpload size={80} stroke={1.5} color={theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 4 : 6]} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={80} stroke={1.5} color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconCloudUpload color="#2476eb" size={100} stroke={0.5} />
                  </Dropzone.Idle>

                  <div>
                    <Text align="center" size="xl" inline fw={500}>
                      Drag & drop files or <span style={{ color: "#2476eb", textDecoration: "underline" }}>Browse</span>
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={12}>
                      Acceptable formats: CSV (required column: linkedin_url)
                    </Text>
                  </div>
                </Group>
              </Flex>
            </Dropzone>
          ) : (
            <Flex gap={"xs"} align={"center"} justify={"space-between"} px={"md"}>
              <Flex>
                <IconFileSpreadsheet color="teal" />
                <Text size={"lg"} style={{ color: "teal" }}>{file?.name}</Text>
              </Flex>
              <IconX
                color="red"
                size={"1.2rem"}
                className="hover:cursor-pointer"
                onClick={() => {
                  setFileJSON(null);
                  setFile(null);
                }}
              />
            </Flex>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="crm" pt="xs">
          Settings tab content
        </Tabs.Panel>
      </Tabs>
      <Flex gap={"md"} mt={"lg"}>
        <Button variant="outline" color="gray" fullWidth onClick={() => closeAllModals()}>
          Go Back
        </Button>
        {loadingChampion ? (
          <Loader />
        ) : (
          <Button 
            fullWidth 
            onClick={async () => {
              if (currentTab === "csv") {
                setLoadingChampion(true);
                const linkedinUrls : string[] = fileJSON?.map(entry => entry.linkedin_url) || [];
                createManyProspectsFromLinkedinLinks(userToken, linkedinUrls, true);
                showNotification({
                  title: "Adding champions...",
                  message: "Please wait while we add champions to your account. This may take a few minutes.",
                  color: "blue",
                  autoClose: 5000,
                });
                closeAllModals();
                return;
              }
              else if (currentTab === "linkedin") {
                if (createNext) {
                  setLoadingChampion(true);
                  const newProspect = await createProspectFromLinkedinLink(userToken, null, linkedinUrl);
                  const markResponse = await markProspectsAsChampion(userToken, [newProspect.data.prospect_id], true);
                  setLoadingChampion(false);
                  closeAllModals();
                  return;
                }
                setLoadingIndividual(true);
                const response = await getIndividual(linkedinUrl);
                setIndividual(response);
                setLoadingIndividual(false);
                setCreateNext(true);
              }
            }} 
            disabled={!preview}
          >
            Next
          </Button>
        )}
      </Flex>
    </>
  );
}
