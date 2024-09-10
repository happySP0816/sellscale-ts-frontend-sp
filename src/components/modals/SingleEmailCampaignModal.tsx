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
} from "@mantine/core";
import { closeAllModals, ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { IconAlignJustified, IconAlignLeft, IconAlignRight, IconCheck, IconCircleCheck } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { JSONContent } from "@tiptap/react";
import { set } from "lodash";
import { useState, useEffect, useRef, forwardRef } from "react";
import { useRecoilValue } from "recoil";
import { ProspectShallow, IScraperProspect, EmailStore, Archetype} from "src";
import { isLinkedInURL } from "@utils/general";
import EmailStoreView from "@common/prospectDetails/EmailStoreView";
import { icpFitToColor, icpFitToLabel } from "@common/pipeline/ICPFitAndReason";
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
  const [fromEmail, setFromEmail] = useState("SellScale CSM <csm@sellscale.com>");
  const [toEmail, setToEmail] = useState<string[]>([]);
  const [ccEmail, setCcEmail] = useState<string | null>(null);
  const [bccEmail, setBccEmail] = useState<string | null>(null);
  const [ccEmailList, setCcEmailList] = useState<string[]>([]);
  const messageDraftRichRaw = useRef<JSONContent | string>("");
  const messageDraftEmail = useRef("");
  const [gettingProspectFromEmail, setGettingProspectFromEmail] = useState(false);
  const popoverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [emailStore, setEmailStore] = useState<EmailStore | null>(null);
  const [linkedinSearch, setLinkedinSearch] = useState("");
  const [bccEmailList, setBccEmailList] = useState<string[]>([]);
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [existingProspect, setExistingProspect] = useState<ProspectShallow | null>(null);
  const [linkedinURL, setLinkedinURL] = useState("");

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");

  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editedCompany, setEditedCompany] = useState("");

  const handleCompanySave = () => {
    if (iscraperProspect && editedCompany) {
      setIscraperProspect({
        ...iscraperProspect,
        position_groups: [
          {
            ...iscraperProspect.position_groups[0],
            profile_positions: [
              {
                ...iscraperProspect.position_groups[0].profile_positions[0],
                company: editedCompany,
              },
            ],
          },
        ],
      });
    }
    setIsEditingCompany(false);
  }

  const handleNameSave = () => {
    if (iscraperProspect && editedFirstName && editedLastName) {
      setIscraperProspect({
        ...iscraperProspect,
        first_name: editedFirstName,
        last_name: editedLastName,
      });
    }
    setIsEditingName(false);
  };


  const [emailDomains, setEmailDomains] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [body, setBody] = useState(``);

  const [emailRecipients, setEmailRecipients] = useState<ProspectShallow[] | null>(null);
  const [iscraperProspect, setIscraperProspect] = useState<IScraperProspect | null>(null);
  const [existingPersona, setExistingPersona] = useState<Archetype | null>(null);
  const [availableEmails, setAvailableEmails] = useState<string[]>([]);
  const [options, setOptions] = useState<SelectProps["data"]>([]);

  const [prospectOptions, setProspectOptions] = useState<SelectProps["data"]>([]);

 


  const isValidLinkedInUrl = (url: string) => {
    const linkedInRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/;
    return linkedInRegex.test(url);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  const getProspectFromEmail = async (email: string) => {
    setGettingProspectFromEmail(true);
    console.log('test')
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

    if (data.prospect) {
       // set the picture to null 
      if (data.prospect && !data.existing_prospect) data.prospect.profile_picture = null;
      setIscraperProspect(data.prospect);
    }

    if (data.existing_prospect){
      setExistingProspect(data.existing_prospect as ProspectShallow);
      console.log('setting existing prospect', data.existing_prospect
      );
    }

    if (data.existing_archetype){
      setExistingPersona(data.existing_archetype as Archetype);
    }

    setGettingProspectFromEmail(false);
  };

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
          body: messageDraftEmail.current,
          linkedin_url: linkedinURL,
          existing_prospect: existingProspect?.id
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
      closeAllModals();
      innerProps.setCurrentTab('email')
      innerProps.fetchAllCampaigns();
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
        
            <Title order={2} style={{ marginBottom: '20px' }}>Override Prospect?</Title>
            <Text size="md" style={{ marginBottom: '20px' }}>
              This prospect may have already been contacted and is currently part of another campaign. Below is the existing persona and prospect information:
            </Text>
            <Divider style={{ marginBottom: '20px' }} />
            <Title order={4} style={{ marginBottom: '10px' }}>Existing Campaign Information</Title>
            <Table>
              <tbody>
                <tr>
                  <td><strong>Name:</strong></td>
                  <td>{existingPersona.archetype}</td>
                </tr>
                <tr>
                  <td><strong>Contract Size:</strong></td>
                  <td>{existingPersona.contract_size}</td>
                </tr>
              </tbody>
            </Table>
            <Divider style={{ margin: '20px 0' }} />
            <Title order={4} style={{ marginBottom: '10px' }}>Existing Prospect Information</Title>
            {existingProspect && (
              <Table>
                <tbody>
                  <tr>
                    <td><strong>Full Name:</strong></td>
                    <td>{existingProspect.full_name}</td>
                  </tr>
                  <tr>
                    <td><strong>Company:</strong></td>
                    <td>{existingProspect.company}</td>
                  </tr>
                  <tr>
                    <td><strong>Title:</strong></td>
                    <td>{existingProspect.title}</td>
                  </tr>
                  <tr>
                    <td><strong>Email:</strong></td>
                    <td>{existingProspect.email}</td>
                  </tr>
                  <tr>
                    <td><strong>ICP Fit Score:</strong></td>
                    <td>
                      <Badge color={icpFitToColor(existingProspect.icp_fit_score)}>
                        {icpFitToLabel(existingProspect.icp_fit_score)}
                      </Badge>
                    </td>
                  </tr>
                  {existingProspect.icp_fit_reason && <tr>
                    <td><strong>ICP Fit Reason:</strong></td>
                    <td>{existingProspect.icp_fit_reason}</td>
                  </tr>}
                </tbody>
              </Table>
            )}
            <Divider style={{ margin: '20px 0' }} />
            <div style={{ position: 'sticky', bottom: '-30px', backgroundColor: 'white', padding: '20px 0', display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => {
                setExistingPersona(null);
                setOptions([])
                setEmailStore(null);
                setIscraperProspect(null);
                setExistingPersona(null);
                setExistingProspect(null);
                setToEmail([]);
                setCcEmail(null);
                setBccEmail(null);
              }} variant="outline" style={{ borderColor: 'gray', color: 'gray' }}>
                Cancel
              </Button>
              <Button onClick={() => {setExistingPersona(null)}} style={{ backgroundColor: 'red', color: 'white' }}>
                Confirm
              </Button>
            </div>
          </Paper>
        </div>
      )}

      <Divider />
      {iscraperProspect?.position_groups?.[0].profile_positions?.[0]?.title && (
        <Card shadow="lg" p="xl" mb="lg" mt="lg" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '10px' }}>
          <Flex direction="column" align="center" justify="center" gap="md">
            <Avatar src={iscraperProspect?.profile_picture} radius="xl" size="lg" mb="sm" />
            {isEditingName ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextInput
                  value={editedFirstName}
                  onChange={(e) => setEditedFirstName(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <TextInput
                  value={editedLastName}
                  onChange={(e) => setEditedLastName(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <Button onClick={handleNameSave} variant="subtle" compact>
                  ✅
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title order={3} style={{ color: '#1a202c' }}>
                  {iscraperProspect?.first_name + ' ' + iscraperProspect?.last_name}
                </Title>
                <Button onClick={() => setIsEditingName(true)} variant="subtle" compact>
                  ✏️
                </Button>
              </div>
            )}
            {isEditingCompany ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <TextInput
                  value={editedCompany}
                  onChange={(e) => setEditedCompany(e.target.value)}
                  style={{ marginRight: '8px' }}
                />
                <Button onClick={handleCompanySave} variant="subtle" compact>
                  ✅
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Text size="md" color="dimmed">
                  {iscraperProspect?.position_groups?.[0].profile_positions?.[0]?.company}
                </Text>
                <Button onClick={() => { setEditedCompany(iscraperProspect?.position_groups?.[0].profile_positions?.[0]?.company || ""); setIsEditingCompany(true); }} variant="subtle" compact>
                  ✏️
                </Button>
              </div>
            )}
          </Flex>
          <Flex align="center" mt="md">
          </Flex>
        </Card>
      )}
      <Flex align={"center"} gap={"xs"} mt={"sm"}>
        <Text size={"sm"} color="gray" fw={500} w={50}>
          From:
        </Text>
        <MultiSelect
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
        />
      </Flex>
      <Flex align={"center"} gap={"xs"} mt={6}>
        <Text size={"sm"} color="gray" fw={500} miw={45}>
          To:
        </Text>
        <MultiSelect
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
          placeholder="Enter email address or Linkedin URL"
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
          rightSection={isValidLinkedInUrl(toEmail[toEmail.length - 1]) && <Loader size="xs" />}
        />
        {toEmail.length > 0 && (
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
          <Flex mt="sm" w="100%" align="center" justify="center" gap="xs">
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
          </Flex>
          <Text size="xs" color="gray" mt="xs" style={{ textAlign: 'center' }}>
            Enter a LinkedIn URL to automatically find and add the associated email address.
          </Text>
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
      <TextInput
        value={subject}
        onChange={(e) => setSubject(e.currentTarget.value)}
        mt={"xs"}
        label={
          <Text color="gray" fw={500} size={"xs"}>
            SUBJECT:
          </Text>
        }
      />
      <Box mt={"md"}>
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
      </Box>
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
        <Button loading={creatingCampaign} onClick={onSendEmail} radius="md" size="md">
          Send
        </Button>
      </Group>
    </Paper>
  );
}
