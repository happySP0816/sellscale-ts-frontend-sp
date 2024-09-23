import { userDataState, userTokenState } from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import { debounce } from "lodash";
import {
  Button,
  Text,
  Paper,
  useMantineTheme,
  Box,
  Stack,
  Center,
  Group,
  TextInput,
  Select,
  SelectProps,
  LoadingOverlay,
  Textarea,
  Flex,
  Title,
  MultiSelect,
  Checkbox,
  Loader,
  Divider,
  Avatar,
  Card,
  Popover,
  Modal,
  Table,
  Badge,
  ScrollArea,
  Tooltip,
  createStyles,
  rem,
  ActionIcon,
  SegmentedControl,
} from "@mantine/core";
import { closeAllModals, ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAlignJustified, IconAlignLeft, IconAlignRight, IconBrandLinkedin, IconBriefcase, IconBuilding, IconBuildingStore, IconCheck, IconCircleCheck, IconExternalLink, IconHomeHeart, IconInfoCircle, IconLetterT, IconMail, IconMailOpened, IconMap2, IconPencil, IconPhone, IconUser } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { JSONContent } from "@tiptap/react";
import { set } from "lodash";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useRecoilValue } from "recoil";
import { ProspectShallow, IScraperProspect, EmailStore, Archetype} from "src";
import { isLinkedInURL, nameToInitials, proxyURL, valueToColor } from "@utils/general";
import EmailStoreView from "@common/prospectDetails/EmailStoreView";
import { icpFitToColor, icpFitToLabel } from "@common/pipeline/ICPFitAndReason";
import { DataGrid } from "mantine-data-grid";
// interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
//   value: string;
//   label: string;
// }

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  label: string;
  description: string;
}

type EmailVerificationInformationType = {
  _deprecation_notice?: string;
  email: string;
  status: string;
  score: number;
  regexp: boolean;
  gibberish: boolean;
  disposable: boolean;
  webmail: boolean;
  mx_records: boolean;
  smtp_server: boolean;
  smtp_check: boolean;
  accept_all: boolean;
  block: boolean;
  sources: {
    domain: string;
    extracted_on: string;
    last_seen_on: string;
    still_on_page: boolean;
    uri: string;
  }[];
};

export default function SingleEmailCampaignModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  fetchAllCampaigns: () => void;
  setCurrentTab: (tab: string) => void;
}>) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const userData = useRecoilValue(userDataState);
  const [campaignType, setCampaignType] = useState("email");
  const [fromEmail, setFromEmail] = useState("SellScale CSM <csm@sellscale.com>");
  const [toEmail, setToEmail] = useState<string[]>([]);
  const [ccEmail, setCcEmail] = useState<string | null>(null);
  const [bccEmail, setBccEmail] = useState<string | null>(null);
  const [ccEmailList, setCcEmailList] = useState<string[]>([]);
  const messageDraftRichRaw = useRef<JSONContent | string>("");
  const messageDraftEmail = useRef("");
  const [couldNotFindEmail, setCouldNotFindEmail] = useState(false);
  const [gettingProspectFromEmail, setGettingProspectFromEmail] = useState(false);
  const popoverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [emailStore, setEmailStore] = useState<EmailStore | null>(null);
  const [linkedinSearch, setLinkedinSearch] = useState("");
  const [bccEmailList, setBccEmailList] = useState<string[]>([]);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [existingProspect, setExistingProspect] = useState<ProspectShallow | null>(null);
  const [linkedinURL, setLinkedinURL] = useState("");

  const [emailDomains, setEmailDomains] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [body, setBody] = useState(``);

  const [emailRecipients, setEmailRecipients] = useState<ProspectShallow[] | null>(null);
  const [iscraperProspect, setIscraperProspect] = useState<IScraperProspect | null>(null);
  const [existingPersona, setExistingPersona] = useState<Archetype | null>(null);
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);
  const [options, setOptions] = useState<SelectProps["data"]>([]);

  const isValidLinkedInUrl = (url: string) => {
    const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/;
    return linkedInRegex.test(url);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  const getProspectFromEmail = async (email: string) => {
    if (!isValidEmail(email)) {
      return;
    }
    setGettingProspectFromEmail(true);
    console.log('test')
    try {
      const response = await fetch(`${API_URL}/prospect/prospect_from_email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      setLinkedinURL('');

      if (data?.message?.includes('No prospects found')) {

        showNotification({
          title: "Problem with Email",
          message: "There was an issue using this email. No prospect was found or bad email address.",
          color: "red",
        });

        setIscraperProspect(null);
        setExistingProspect(null);
        setExistingPersona(null);
        setOptions([]);
        setEmailStore(null);
        setToEmail([]);
        return;

      }

      if (data.prospect) {
        // set the picture to null 
        if (data.prospect && !data.existing_prospect) data.prospect.profile_picture = null;
        setIscraperProspect(data.prospect);
      }

      if (data.existing_prospect){
        setExistingProspect(data.existing_prospect as ProspectShallow);
        console.log('setting existing prospect', data.existing_prospect);
      }

      if (data.existing_archetype){
        setExistingPersona(data.existing_archetype as Archetype);
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: "An error occurred while fetching the prospect from email.",
        color: "red",
      });
    } finally {
      setGettingProspectFromEmail(false);
    }

  }

  const getEmailFromLinkedinURL = async (url: string) => {
    setGettingProspectFromEmail(true);
    if (!url) {
      return;
    }
    showNotification({
      title: campaignType === 'linkedin' ? "Getting LinkedIn..." : "Getting Email...",
      message: campaignType === 'linkedin' ? `Getting LinkedIn for ${url}` : `Getting email for ${url}`,
      color: "teal",
    });

    try {
      const response = await fetch(`${API_URL}/prospect/email_from_linkedin_url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          campaign_type: campaignType,
          linkedin_url: url,
        }),
      });

  
      const data = await response.json();

      if (!data.email && campaignType === 'email') {
        showNotification({
          title: "Email Not Found",
          message: `Email not found for ${url}`,
          color: "red",
        });
        setCouldNotFindEmail(true);
        setLinkedinSearch("");
        setOptions([]);
        setEmailStore(null);
        setIscraperProspect(null);
        setExistingProspect(null);
        setExistingPersona(null);
        setToEmail([]);
        return;
      }

      const newEmail = data.email;
      const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
      setLinkedinSearch("");

      if (data.prospect) {
        setIscraperProspect(data.prospect);
      }

      if (data.linkedin_url) {
        setLinkedinURL(data.linkedin_url);
      }

      if (data.existing_prospect){
        setExistingProspect(data.existing_prospect as ProspectShallow);
        console.log('setting existing prospect', data.existing_prospect);
      }
      if (data.existing_archetype){
        setExistingPersona(data.existing_archetype as Archetype);
      }

      if (data.email_verification_information) {
        const emailVerificationInfo: EmailVerificationInformationType = data.email_verification_information;
        const emailStore: EmailStore = {
          id: Date.now(), // Assuming you need a unique ID
          email: emailVerificationInfo.email,
          first_name: "", // Assuming these fields are not available in the response
          last_name: "",
          company_name: "",
          hunter_status: emailVerificationInfo.status,
          hunter_score: emailVerificationInfo.score,
          hunter_regexp: emailVerificationInfo.regexp,
          hunter_gibberish: emailVerificationInfo.gibberish,
          hunter_disposable: emailVerificationInfo.disposable,
          hunter_webmail: emailVerificationInfo.webmail,
          hunter_mx_records: emailVerificationInfo.mx_records,
          hunter_smtp_server: emailVerificationInfo.smtp_server,
          hunter_smtp_check: emailVerificationInfo.smtp_check,
          hunter_accept_all: emailVerificationInfo.accept_all,
          hunter_block: emailVerificationInfo.block,
          hunter_sources: emailVerificationInfo.sources,
        };
        console.log('setting email store', emailStore);
        setEmailStore(emailStore);
      }

      if (campaignType === 'email') {
        setOptions([newOption]);
        setToEmail([newOption.value]);
      }
      
    } catch (error) {
      showNotification({
        title: "Error",
        message: `An error occurred while fetching email for ${url}`,
        color: "red",
      });
    } finally {
      setGettingProspectFromEmail(false);
    }
  };

  // const searchExistingProspects = debounce(async (query) => {
  //   if (query.trim().length === 0) return;

  //   try {
  //     const response = await fetch(`${API_URL}/prospect/search_existing_prospects`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${userToken}`,
  //       },
  //       body: JSON.stringify({ query }),
  //     });

  //     const data = await response.json();

  //     setProspectOptions(
  //       data.data.map((prospect: any) => ({
  //         value: prospect.value,
  //         label: prospect.label,
  //       }))
  //     );

  //     console.log('options are ', data.data.map((prospect: any) => ({
  //       value: prospect.value,
  //       label: prospect.label,
  //     })));
  //     console.log('to email is ', toEmail);

  //     // Handle the data as needed
  //     console.log(data);
  //   } catch (error) {
  //     console.error("Error fetching existing prospects:", error);
  //   }
  // }, 300);

  const onSendEmail = async () => {
    setCreatingCampaign(true);

    showNotification({
      title: "Starting email Campaign...",
      message: "Email Campaign has started",
      color: "teal",
    });

    try {
      const response = await fetch(`${API_URL}/prospect/email-campaign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          from_email: fromEmail,
          to_email: toEmail.map((email) => email.split('-').slice(0, -1).join('-').trim()),
          cc_email: ccEmail,
          bcc_email: bccEmail,
          cc_email_list: ccEmailList,
          bcc_email_list: bccEmailList,
          subject: subject,
          iscraper_prospect: iscraperProspect,
          body: messageDraftEmail.current,
          linkedin_url: linkedinURL,
          existing_prospect: existingProspect?.id,
          campaign_type: campaignType,
        }),
      });

      const data = await response.json();

      if (data.found_emails) {
        showNotification({
          title: "Creating Email Campaign...",
          message: "Email Campaign has started and the email was found for the prospect.",
          color: "teal",
        });
      }
      if (campaignType === 'email') innerProps.setCurrentTab('email')
      if (campaignType === 'linkedin')
      innerProps.fetchAllCampaigns();
      closeAllModals();
    } catch (error) {
      showNotification({
        title: "Error",
        message: "An error occurred while starting the email campaign.",
        color: "red",
      });
    } finally {
      setCreatingCampaign(false);
      
    }
  };
  const getAvailableEmailRecipients = () => {
    fetch(`${API_URL}/prospect/email-recipients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmailRecipients(data.data);
        setAvailableEmails(data.available_emails);
        setFromEmail(data.available_emails[0]);
      });
  };

  useEffect(() => {
    getAvailableEmailRecipients();
  }, []);

  const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ image, label, description, selected, ...others }: ItemProps & { selected?: boolean }, ref) => (
    <div ref={ref} {...others}>
      <Checkbox label={label} checked={selected} />
    </div>
  ));

  const [change, setChange] = useState(false);
  const [linkedinRequire, setLinkedinRequire] = useState(false);
  const handleLinkedinRequired = () => {
    setLinkedinRequire(true);
    // linkedin URL Required
    setLinkedinRequire(false);
  };

  console.log("============", availableEmails);

  return (
    <Paper style={{ position: "relative" }}>


      {existingPersona !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken the background
            zIndex: 9998, // Slightly lower than the Paper component
          }}
        >
          <Paper
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              width: '80%', // Increased width to make the paper wider
              maxWidth: '800px', // Added a max-width to ensure it doesn't get too wide
              height: '80%', // Increased height to give it more height
              maxHeight: '800px', // Added a max-height to ensure it doesn't get too tall
              overflowY: 'auto', // Added to handle overflow
            }}
          >
            <Stack spacing={"sm"}>
              <Text fw={400} color="black" size={"sm"}>
                Ready to Upload?{" "}
                <br></br>
                <span className="font-semibold text-black">
                  We have found some prospects that are already added to your prospect database.
                  Please check the prospects that you want to overwrite and move to your new segment/campaign.<br></br>
                  We will also reset the prospect's status.
                </span>
              </Text>
              {/* <Divider style={{ marginBottom: '20px' }} /> */}
              {/* <Title order={4} style={{ marginBottom: '10px' }}>Existing Campaign Information</Title>
              <DataGrid
                data={[existingPersona]}
                withBorder
                withColumnBorders
                columns={[
                  {
                    accessorKey: "archetype",
                    header: () => (
                      <Flex align={"center"} gap={"3px"}>
                        <IconLetterT color="gray" size={"0.9rem"} />
                        <Text color="gray">Name</Text>
                      </Flex>
                    ),
                    cell: (cell) => (
                      <Text fw={500}>{cell.getValue()}</Text>
                    ),
                  },
                ]}
              /> */}
              <Divider style={{ margin: '20px 0' }} />
              <Title order={4} style={{ marginBottom: '10px' }}>Prospects from different campaigns</Title>
              {existingProspect && (
                <DataGrid
                  data={[existingProspect]}
                  withBorder
                  withColumnBorders
                  columns={[
                    {
                      accessorKey: "full_name",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconUser color="gray" size={"0.9rem"} />
                          <Text color="gray">Name</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => (
                        <Text fw={500}>{cell.getValue()}</Text>
                      ),
                    },
                    {
                      accessorKey: "company",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconBuilding color="gray" size={"0.9rem"} />
                          <Text color="gray">Company</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => (
                        <Text fw={500}>{cell.getValue()}</Text>
                      ),
                    },
                    {
                      accessorKey: "title",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Title</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => (
                        <Text fw={500}>{cell.getValue()}</Text>
                      ),
                    },
                    {
                      accessorKey: "email",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconLetterT color="gray" size={"0.9rem"} />
                          <Text color="gray">Email</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => (
                        <Text fw={500}>{cell.getValue()}</Text>
                      ),
                    },
                    {
                      accessorKey: "icp_fit_score",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconInfoCircle color="gray" size={"0.9rem"} />
                          <Text color="gray">ICP Fit Score</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => (
                        <Badge color={icpFitToColor(cell.getValue())}>
                          {icpFitToLabel(cell.getValue())}
                        </Badge>
                      ),
                    },
                    {
                      accessorKey: "icp_fit_reason",
                      header: () => (
                        <Flex align={"center"} gap={"3px"}>
                          <IconInfoCircle color="gray" size={"0.9rem"} />
                          <Text color="gray">ICP Fit Reason</Text>
                        </Flex>
                      ),
                      cell: (cell: any) => (
                        <Text fw={500}>{cell.getValue()}</Text>
                      ),
                    },
                  ]}
                />
              )}
              <Divider style={{ margin: '20px 0' }} />
              <Paper
                mt={"xs"}
                withBorder
                p={"xs"}
                style={{ borderColor: "orange", backgroundColor: "#FEF0C769" }}
              >
                <Flex align={"center"} gap={5}>
                  <IconInfoCircle color="orange" />
                  <Text size={"sm"} fw={500} color="orange">
                    {"Overwriting the prospect will also reset the prospect's status."}
                  </Text>
                </Flex>
              </Paper>
              <Flex gap={"lg"} mt={"lg"}>
                <Button onClick={() => {
                  setExistingPersona(null);
                  setOptions([]);
                  setEmailStore(null);
                  setIscraperProspect(null);
                  setExistingPersona(null);
                  setExistingProspect(null);
                  setToEmail([]);
                  setCcEmail(null);
                  setBccEmail(null);
                }} fullWidth variant="outline" color="gray">
                  Cancel
                </Button>
                <Button onClick={() => {setExistingPersona(null)}} fullWidth>
                  Confirm
                </Button>
              </Flex>
            </Stack>
          </Paper>
        </div>
      )}

      <Divider />
      <Flex justify="center" mt="sm">
  <SegmentedControl
    value={campaignType}
    onChange={(value: any) => {
      setCampaignType(value);
    }}
    data={[
      {
        value: "email",
        label: (
          <Center style={{ gap: 4 }}>
            <IconMailOpened
              size={"1.2rem"}
              fill="orange"
              color="white"
            />
            <Text fw={500}>Email</Text>
          </Center>
        ),
      },
      {
        value: "linkedin",
        label: (
          <Center style={{ gap: 4 }}>
            <IconBrandLinkedin
              size={"1.4rem"}
              fill="#3B85EF"
              color="white"
            />
            <Text fw={500}>LinkedIn</Text>
          </Center>
        ),
      },
    ]}
  />
</Flex>
      {iscraperProspect?.position_groups?.[0].profile_positions?.[0]?.title && (
        <ProspectDetailsCard prospect={iscraperProspect} setProspect={setIscraperProspect} />
      )}
      <Flex align={"center"} gap={"xs"} mt={"sm"}>
        <Text size={"sm"} color="gray" fw={500} w={50}>
          From:
        </Text>
        {campaignType === 'email' ? <MultiSelect
          itemComponent={SelectItem}
          value={emailDomains.length > 0 ? emailDomains : availableEmails?.[0] ? [availableEmails[0]] : []}
          data={
            (availableEmails &&
              availableEmails?.map((email, index) => ({
                value: email,
                label: email,
                key: index,
              }))) ||
            []
          }
          onChange={(values) => {
            setEmailDomains(values.slice(-1));
            setFromEmail(values.slice(-1)[0]);
          }}
          w={"100%"}
          nothingFound="Nobody here"
          maxDropdownHeight={400}
          icon={
            availableEmails.length > 0 ? null : (
              <Flex align={"center"} gap={4}>
                <Avatar src={""} size={"xs"} radius={"xl"} />
                <Text fw={500} size={"sm"}>
                  SellScale CSM
                </Text>
                <Divider orientation="vertical" />
                <Text size={"xs"} fw={400} color="gray">
                  csm@sellscale.com
                </Text>
              </Flex>
            )
          }
          styles={{
            icon: {
              width: "260px",
              color: "black",
            },
          }}
          size="xs"
        /> : (<>

          <Flex align={"center"} gap={"xs"}>
            <Card shadow="sm" padding="xs" radius="md" withBorder style={{ backgroundColor: '#f0f4f8', border: '1px solid #d1d9e0' }}>
            <Flex align="center" gap="xs">
              <Avatar src={userData.img_url} radius={"xl"} size={"sm"} />
              <Text fw={700} color="black" size="md">{userData.sdr_name}</Text>
            </Flex>
            </Card>
          </Flex>
        </>
        )}

      </Flex>
      <Flex align={"center"} gap={"xs"} mt={6}>
        <Text size={"sm"} color="gray" fw={500} miw={45}>
          To:
        </Text>
        <MultiSelect
          mt="sm"
          w={"100%"}
          creatable
          searchable
          data={options.map((option : any) => {
            if (typeof option === 'string') {
              return { value: option, label: option };
            }
            const isValidOption = typeof option.label === 'string' && typeof option.label.toLowerCase === 'function';
            if (!isValidOption) {
              return option;
            }
            const isEmailValid = isValidEmail(option.label ?? '');
            return {
              ...option,
              label: isEmailValid ? (
                <Popover 
                  position="bottom" 
                  withinPortal 
                  withArrow 
                  shadow="md" 
                  opened={popoverOpened}
                  offset={10}
                  onPositionChange={(position) => console.log('Popover position:', position)}
                  positionDependencies={[toEmail]}

                  keepMounted
                  transitionProps={{ duration: 150, transition: 'fade' }}
                  width="auto" 
                  middlewares={{ shift: true, flip: true }}
                  arrowSize={10}
                  arrowOffset={5}
                  arrowRadius={2}
                  arrowPosition="center"
                  zIndex={1000}
                  radius="md"
                >
                  <Popover.Target>
                    <div ref={(el) => (popoverRefs.current[0] = el)} onMouseEnter={() => setPopoverOpened(true)} onMouseLeave={() => setPopoverOpened(false)}>
                      <Flex align="center" gap="xs">
                        {option.label}
                        {gettingProspectFromEmail ? <Loader size="xs" /> : <IconCircleCheck size={12} color="green" />}
                      </Flex>
                    </div>
                  </Popover.Target>
                  <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                    <EmailStoreView 
                      email={option.label ?? ''} 
                      isValid={true} 
                      showInfoCard={true}
                      emailStore={{
                        id: 1,
                        email: option.label ?? '',
                        first_name: 'John',
                        last_name: 'Doe',
                        company_name: 'Example Corp',
                        hunter_status: 'verified',
                        hunter_score: 95,
                        hunter_regexp: true,
                        hunter_gibberish: true,
                        hunter_disposable: true,
                        hunter_webmail: true,
                        hunter_mx_records: true,
                        hunter_smtp_server: true,
                        hunter_smtp_check: true,
                        hunter_accept_all: false,
                        hunter_block: false,
                        hunter_sources: [],
                      }} 
                    />
                  </Popover.Dropdown>
                </Popover>
              
              ) : (
                option.label
              ),
            };
          })}
          value={toEmail}
          placeholder={campaignType === 'linkedin' ? "Enter Linkedin URL" : "Enter email address or Linkedin URL"}
          size="xs"
          onChange={(values) => {
            if (values.length === 0) {
              setOptions([]);
              setEmailStore(null);
              setIscraperProspect(null);
              setExistingProspect(null);
              setExistingPersona(null);
            }
            setToEmail(values);
            if (values[0]){
              //check if email
              const emailWithoutTimestamp = values[0].substring(0, values[0].lastIndexOf('-'));
              getProspectFromEmail(emailWithoutTimestamp);
            }
          }}
          onCreate={(query) => {
            const newEmail = query.trim();

            if (isLinkedInURL(newEmail)) {
              getEmailFromLinkedinURL(newEmail);
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else if (isValidEmail(newEmail)) {
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else {
              showNotification({
                title: "Invalid Email",
                message: `Please enter a valid email address`,
                color: "red",
              });
              return null;
            }
          }}
          getCreateLabel={(query) => `+ Add ${query}`}
          shouldCreate={(query, data) => query.trim().length > 0 && !data.some((item) => item.value === query.trim())}
          clearable
          rightSection={(isValidLinkedInUrl(toEmail[toEmail.length - 1]) && campaignType === 'email') || gettingProspectFromEmail && <Loader size="xs" />}
        />
        {toEmail.length > 0 && campaignType === 'email' && (
          <Flex align={"center"} gap={"xs"}>
            <Button
              disabled
              variant="default"
              size="xs"
              onClick={() => setCcEmail((prev) => (prev ? null : "cc@example.com"))}
            >
              +CC
            </Button>
            <Button
              disabled
              variant="default"
              size="xs"
              onClick={() => setBccEmail((prev) => (prev ? null : "bcc@example.com"))}
            >
              +BCC
            </Button>
          </Flex>
        )}
      </Flex>
      { toEmail.length === 0  && (
        <>
          {campaignType === 'email' && <Flex mt="sm" w="100%" align="center" justify="center" gap="xs">
            <TextInput
              placeholder="Magic LinkedIn to Email Finder"
              style={{ width: '50%', borderColor: '#ced4da', backgroundColor: '#f8f9fa' }}
              value={linkedinSearch}
              onChange={(e) => setLinkedinSearch(e.currentTarget.value)}
              rightSection={isValidLinkedInUrl(linkedinSearch) && <Loader size="xs" />}
            />
            {isValidLinkedInUrl(linkedinSearch) && (
              <Button variant="filled" color="blue" size="xs" onClick={() => getEmailFromLinkedinURL(linkedinSearch)}>
                Search
              </Button>
            )}
          </Flex>}
          {campaignType === 'email' && <Text size="xs" color="gray" mt="xs" style={{ textAlign: 'center' }}>
            Enter a LinkedIn URL to automatically find and add the associated email address.
          </Text>}
          {couldNotFindEmail && (
            <Text size="xs" color="red" mt="xs" style={{ textAlign: 'center' }}>
              Unable to find a strong email. Please enter email directly.
            </Text>
          )}
        </>
      )}
      {ccEmail && (
        <MultiSelect
          label={
            <Text color="gray" fw={500} size={"xs"}>
              CC Email List
            </Text>
          }
          value={ccEmailList}
          onChange={(values) => setCcEmailList(values)}
          data={ccEmailList.map((email, index) => ({
            value: email,
            label: email,
            key: index,
          }))}
          creatable
          searchable
          getCreateLabel={(query) => `+ Add ${query}`}
          clearable
          mt={"md"}
          size="xs"
        />
      )}
      {bccEmail && (
        <MultiSelect
          label={
            <Text color="gray" fw={500} size={"xs"}>
              BCC Email List
            </Text>
          }
          value={bccEmailList}
          onChange={(values) => setBccEmailList(values)}
          data={bccEmailList.map((email, index) => ({
            value: email,
            label: email,
            key: index,
          }))}
          creatable
          searchable
          getCreateLabel={(query) => `+ Add ${query}`}
          clearable
          size="xs"
          mb="sm"
        />
      )}
      <Textarea
        value={subject}
        onChange={(e) => {
          const newValue = e.currentTarget.value;
          if (campaignType === 'linkedin' && newValue.length > 300) {
            return;
          }
          setSubject(newValue);
        }}
        mt={"xs"}
        label={
          <Text color="gray" fw={500} size={"xs"}>
            {campaignType === 'linkedin' ? 'INVITATION NOTE:' : 'SUBJECT:'}
          </Text>
        }
        autosize
        minRows={campaignType === 'email' ? 1 : 3}
        maxRows={10}
      />
            {campaignType === 'linkedin' && (
        <Text size="xs" color={subject.length > 300 ? 'red' : 'gray'} mt="xs" style={{ textAlign: 'right' }}>
          {subject.length}/300
        </Text>
      )}
      {campaignType === 'email' && <Box mt={"md"}>
        <Text color="gray" fw={500} size={"sm"}>
          BODY:
        </Text>
        <RichTextArea
          onChange={(value, rawValue) => {
            messageDraftRichRaw.current = rawValue;
            messageDraftEmail.current = value;
          }}
          value={messageDraftRichRaw.current}
          height={200}
        />
      </Box>}
      {/* <Stack spacing="md">
        <MultiSelect
          label={<span style={{ color: emailDomains.length > 0 ? theme.colors.dark[9] : theme.colors.red[6] }}>Email to Send From: *</span>}
          value={emailDomains.length > 0 ? emailDomains : availableEmails?.[0] ? [availableEmails[0]] : []}
          onChange={(values) => setEmailDomains(values.slice(-1))}
          data={
            availableEmails?.map((email, index) => ({
              value: email,
              label: email,
              key: index,
            })) || []
          }
          creatable
          searchable
          getCreateLabel={(query) => `+ Add ${query}`}
          clearable
          radius="md"
          size="md"
          mb="sm"
        />

        <MultiSelect
          label="To:"
          creatable
          searchable
          data={options}
          value={toEmail}
          placeholder="Linkedin URL or email address"
          size="md"
          onChange={(values) => setToEmail(values)}
          onCreate={(query) => {
            const newEmail = query.trim();

            if (isLinkedInURL(newEmail)) {
              const getEmailFromLinkedinURL = async (url: string) => {
                if (!url) {
                  return;
                }

                showNotification({
                  title: "Getting Email...",
                  message: `Getting email for ${url}`,
                  color: "teal",
                });

                try {
                  const response = await fetch(`${API_URL}/prospect/email_from_linkedin_url`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${userToken}`,
                    },
                    body: JSON.stringify({
                      linkedin_url: url,
                    }),
                  });

                  const data = await response.json();

                  if (!data.email) {
                    showNotification({
                      title: "Email Not Found",
                      message: `Email not found for ${url}`,
                      color: "red",
                    });
                    setOptions([]);
                    setToEmail([]);
                    return;
                  }

                  const newEmail = data.email;
                  const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
                  setOptions([newOption]);
                  setToEmail([newOption.value]);
                } catch (error) {
                  showNotification({
                    title: "Error",
                    message: `An error occurred while fetching email for ${url}`,
                    color: "red",
                  });
                }
              };
              getEmailFromLinkedinURL(newEmail);
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else if (isValidEmail(newEmail)) {
              const newOption = { value: `${newEmail}-${Date.now()}`, label: newEmail };
              setOptions((prevOptions) => [...prevOptions, newOption]);
              setToEmail((prevEmails) => [...prevEmails, newOption.value]);
              return newOption.value;
            } else {
              showNotification({
                title: "Invalid Email",
                message: `Please enter a valid email address`,
                color: "red",
              });
              return null;
            }
          }}
          getCreateLabel={(query) => `+ Add ${query}`}
          shouldCreate={(query, data) => query.trim().length > 0 && !data.some((item) => item.value === query.trim())}
          clearable
          rightSection={isValidLinkedInUrl(toEmail[toEmail.length - 1]) && <Loader size="xs" />}
        />
        {toEmail.length > 0 && (
          <Group position="apart" mt="sm">
            <Checkbox label="CC" checked={ccEmail !== ""} onChange={(e) => setCcEmail(e.currentTarget.checked ? "cc@example.com" : "")} size="md" />
            <Checkbox label="BCC" checked={bccEmail !== ""} onChange={(e) => setBccEmail(e.currentTarget.checked ? "bcc@example.com" : "")} size="md" />
          </Group>
        )}
        {ccEmail && (
          <MultiSelect
            label="CC Email List"
            value={ccEmailList}
            onChange={(values) => setCcEmailList(values)}
            data={ccEmailList.map((email, index) => ({
              value: email,
              label: email,
              key: index,
            }))}
            creatable
            searchable
            getCreateLabel={(query) => `+ Add ${query}`}
            clearable
            radius="md"
            size="md"
            mb="sm"
          />
        )}
        {bccEmail && (
          <MultiSelect
            label="BCC Email List"
            value={bccEmailList}
            onChange={(values) => setBccEmailList(values)}
            data={bccEmailList.map((email, index) => ({
              value: email,
              label: email,
              key: index,
            }))}
            creatable
            searchable
            getCreateLabel={(query) => `+ Add ${query}`}
            clearable
            radius="md"
            size="md"
            mb="sm"
          />
        )}
        <TextInput label="Subject" value={subject} onChange={(e) => setSubject(e.currentTarget.value)} mb="sm" radius="md" size="md" />
      </Stack> */}
      <Group position="right" mt="md">
        <Button onClick={() => closeAllModals()} variant="outline" color="gray" radius="md" size="md">
          Cancel
        </Button>
        <Button disabled={gettingProspectFromEmail || options.length === 0} loading={creatingCampaign} onClick={onSendEmail} radius="md" size="md">
          Send
        </Button>
      </Group>
    </Paper>
  );
}
const ProspectDetailsCard = ({ prospect, setProspect }: { prospect: IScraperProspect, setProspect: React.Dispatch<React.SetStateAction<IScraperProspect | null>> }) => {
  const theme = useMantineTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editableProspect, setEditableProspect] = useState(prospect);

  const useStyles = createStyles((theme) => ({
    icon: {
      color: theme.colors.gray[6],
    },
    item: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      borderRadius: theme.radius.md,
      height: 40,
      gap: rem(4),
      width: "100%",
      backgroundColor: theme.white,
      border: `solid 1px ${theme.colors.gray[4]}`,
      transition: "box-shadow 150ms ease, transform 100ms ease",
      "&:hover": {
        boxShadow: `${theme.shadows.md} !important`,
        transform: "scale(1.05)",
      },
    },
  }));

  const { classes } = useStyles();

  const handleEditToggle = () => {
    if (isEditing) {
      setProspect(editableProspect);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (field: string, value: any) => {
    setEditableProspect((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Flex
      gap={0}
      wrap="nowrap"
      direction="column"
      bg={"white"}
      sx={{ borderLeft: "0.0625rem solid #dee2e6", borderRight: "0.0625rem solid #dee2e6" }}
    >
      <Stack spacing={0} mt={"md"} px={"md"}>
        <Flex align={"start"} gap={"md"}>
          <Flex direction={"column"} align={"center"} maw={"8rem"}>
            <Avatar
              h={"6rem"}
              w={"6rem"}
              sx={{ backgroundColor: theme.colors.gray[0] }}
              color={valueToColor(theme, prospect?.first_name + ' ' + prospect?.last_name)}
            >
              {nameToInitials(prospect?.first_name + ' ' + prospect?.last_name)}
            </Avatar>
          </Flex>
          <Box maw={"70%"} w={"100%"}>
            <Flex align={"center"} gap={"sm"}>
              {isEditing ? (
                <TextInput
                  value={editableProspect.first_name + ' ' + editableProspect.last_name}
                  onChange={(e) => {
                    const [firstName, lastName] = e.currentTarget.value.split(' ');
                    handleChange('first_name', firstName);
                    handleChange('last_name', lastName);
                  }}
                />
              ) : (
                <Text size={"lg"} fw={700}>
                  {((prospect?.first_name + ' ' + prospect?.last_name)?.length || 0) > 16 ? (
                    <Tooltip label={prospect?.first_name + ' ' + prospect?.last_name}>
                      <span>
                        {(prospect?.first_name + ' ' + prospect?.last_name).substring(0, 16) + "..."}
                      </span>
                    </Tooltip>
                  ) : (
                    prospect?.first_name + ' ' + prospect?.last_name
                  )}
                </Text>
              )}
              <ActionIcon onClick={handleEditToggle}>
                {isEditing ? <IconCheck color="green" /> : <IconPencil color="gray" />}
              </ActionIcon>
            </Flex>
            {prospect.position_groups?.[0]?.profile_positions?.[0]?.title && (
              <Group noWrap spacing={10} mt={3}>
                <IconBriefcase stroke={1.5} size={"1.1rem"} className={classes.icon} />
                {isEditing ? (
                  <TextInput
                    value={editableProspect.position_groups?.[0]?.profile_positions?.[0]?.title}
                    onChange={(e) => handleChange('position_groups', [{ ...editableProspect.position_groups[0], profile_positions: [{ ...editableProspect.position_groups[0].profile_positions[0], title: e.currentTarget.value }] }])}
                    size="xs"
                  />
                ) : (
                  <Text size="xs">{prospect.position_groups?.[0]?.profile_positions?.[0]?.title}</Text>
                )}
              </Group>
            )}
            {prospect.position_groups?.[0]?.company?.name && prospect.position_groups?.[0]?.company?.url && (
              <Group noWrap spacing={10} mt={3}>
                <IconBuildingStore stroke={1.5} size={18} className={classes.icon} />
                {isEditing ? (
                  <TextInput
                    value={editableProspect.position_groups?.[0]?.company?.name}
                    onChange={(e) => handleChange('position_groups', [{ ...editableProspect.position_groups[0], company: { ...editableProspect.position_groups[0].company, name: e.currentTarget.value } }])}
                    size="xs"
                  />
                ) : (
                  <Text
                    size="xs"
                    component="a"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={prospect.position_groups?.[0]?.company?.url}
                  >
                    {prospect.position_groups?.[0]?.company?.name}
                    <IconExternalLink size="0.7rem" color={theme.colors.blue[6]} style={{ marginLeft: "0.25rem" }} />
                  </Text>
                )}
              </Group>
            )}
            {prospect.location?.default && (
              <Group noWrap spacing={10} mt={3}>
                <IconMap2 stroke={1.5} size={18} className={classes.icon} />
                {isEditing ? (
                  <TextInput
                    value={editableProspect.location.default}
                    onChange={(e) => handleChange('location', { ...editableProspect.location, default: e.currentTarget.value })}
                    size="xs"
                  />
                ) : (
                  <Text size="xs">{prospect.location.default}</Text>
                )}
              </Group>
            )}
            {prospect?.contact_info?.email && (
              <Group noWrap spacing={10} mt={5}>
                <IconMail stroke={1.5} size={18} className={classes.icon} />
                {isEditing ? (
                  <TextInput
                    value={editableProspect.contact_info.email}
                    onChange={(e) => handleChange('contact_info', { ...editableProspect.contact_info, email: e.currentTarget.value })}
                    size="xs"
                  />
                ) : (
                  <Text size="xs" component="a" href={`mailto:${prospect?.contact_info?.email}`}>
                    {prospect?.contact_info?.email}{" "}
                    <IconExternalLink size="0.7rem" color={theme.colors.blue[6]} />
                  </Text>
                )}
              </Group>
            )}
          </Box>
        </Flex>
      </Stack>
      <Divider mt={"sm"} />
    </Flex>
  );
}