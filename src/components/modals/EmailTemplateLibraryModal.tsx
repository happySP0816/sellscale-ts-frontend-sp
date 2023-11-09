import { userTokenState } from "@atoms/userAtoms";
import { Grid, Input, Loader, Modal, Title, Text, Group, Badge } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { getEmailTemplateLibrary } from "@utils/requests/getEmailTemplateLibrary";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { EmailTemplate } from "src";

interface EmailTemplateLibraryModalProps extends Record<string, unknown> {
  modalOpened: boolean;
  closeModal: () => void;
  templateType: "SUBJECT_LINE" | "BODY";
  onSelect: (template: EmailTemplate) => void;
}


export default function EmailTemplateLibraryModal(props: EmailTemplateLibraryModalProps) {
  const [userToken] = useRecoilState(userTokenState);

  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering templates
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 500); // Debounced search term for filtering templates

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);

  const getEmailTemplates = async () => {
    setLoading(true);

    const result = await getEmailTemplateLibrary(
      userToken,
      props.templateType
    );
    if (result.status === 'success') {
      setTemplates(result.data.templates);
      setFilteredTemplates(result.data.templates);
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
    }

    setLoading(false);
  }

  useEffect(() => {
    getEmailTemplates();
  }, [])

  useEffect(() => {
    // Filter the templates
    const filteredTemplates = templates.filter((template) => {
      const lowercaseSearchTerm = debouncedSearchTerm.toLowerCase();
      const lowercaseTone = template.tone?.toLowerCase();

      // Check if any part of the template matches the search term
      const matchesSearchTerm =
        template.name.toLowerCase().includes(lowercaseSearchTerm) ||
        template.description?.toLowerCase().includes(lowercaseSearchTerm) ||
        lowercaseTone?.includes(lowercaseSearchTerm) || // Check for tone
        template.labels?.some((label) => label.toLowerCase().includes(lowercaseSearchTerm)); // Check for labels

      return matchesSearchTerm;
    })

    setFilteredTemplates(filteredTemplates);
  }, [debouncedSearchTerm])


  return (
    <Modal
      title={
        <>
          <Title order={4}>
            Choose a Template
          </Title>
        </>
      }
      opened={props.modalOpened}
      onClose={props.closeModal}
      size="50rem"
    >
      {
        loading ? (
          <Loader variant="dots" />
        ) : (
          <>
            <Input
              placeholder={"Search for a" + (props.templateType == "SUBJECT_LINE" ? "subject line" : "n email body") + " template..."}
              mb="md"
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
            />
            
            <Grid gutter="md">
              {filteredTemplates.map((template) => (
                <Grid.Col span={6} key={template.id}>
                  <div
                    onClick={() => {
                      props.onSelect(template);
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '10px',
                      borderRadius: '8px', // Set border radius to 8px
                      transition: 'background-color 0.3s',
                      marginBottom: 'xs', // Add 'xs' spacing between items
                      border: '1px solid #dedede',
                      height: '100%',
                      minHeight: '100px',
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <Title order={5}>{template.name}</Title>
                    <Text size="xs" color="gray">
                      {template.description}
                    </Text>
                    <Group spacing="xs" mt="xs">
                      <Badge
                        key={template.tone}
                        variant="filled"
                        color={deterministicMantineColor(template.tone as string)}
                        size="xs"
                      >
                        {template.tone}
                      </Badge>
                      {template.labels?.map((label) => (
                        <Badge key={label} variant="outline" color="gray" size="xs">
                          {label}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                </Grid.Col>
              ))}
            </Grid>
          </>
        )
      }



    </Modal>
  )
}