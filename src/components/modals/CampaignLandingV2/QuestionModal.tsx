
import React, { useState } from 'react';
import { Paper, Center, SegmentedControl, Box, Select, Textarea, Text, TextInput, Button, Title } from '@mantine/core';
import { IconBrandLinkedin, IconQuestionMark, IconSearch } from '@tabler/icons';
import * as researchers from "@utils/requests/researchers";


import { openContextModal, closeAllModals, ContextModalProps } from '@mantine/modals'; // Assuming this is the correct import for openContextModal
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';

const QuestionModal: React.FC<any> = ({ innerProps }) => {
  const linkedinQuestions = [
    { value: 'YEARS_OF_EXPERIENCE_AT_CURRENT_JOB', label: 'Extract the years of experience at current job' },
    { value: 'YEARS_OF_EXPERIENCE', label: 'Extract the years of experience' },
    { value: 'SERP_NEWS_SUMMARY_NEGATIVE', label: 'Extract the negative SERP news summary' },
    { value: 'SERP_NEWS_SUMMARY', label: 'Extract the SERP news summary' },
    { value: 'RECENT_RECOMMENDATIONS', label: 'Extract the recent recommendations' },
    { value: 'RECENT_PATENTS', label: 'Extract the recent patents' },
    { value: 'LIST_OF_PAST_JOBS', label: 'Extract the list of past jobs' },
    { value: 'LINKEDIN_BIO_SUMMARY', label: 'Extract the linkedin bio and create a summary using OpenAI' },
    { value: 'GENERAL_WEBSITE_TRANSFORMER', label: 'Extract the general website transformer' },
    { value: 'CURRENT_LOCATION', label: 'Extract the current location' },
    { value: 'CURRENT_JOB_SPECIALTIES', label: 'Extract the specialties of the current job' },
    { value: 'CURRENT_JOB_INDUSTRY', label: 'Extract the industry of the current job' },
    { value: 'CURRENT_JOB_DESCRIPTION', label: 'Extract the description of the current job' },
    { value: 'CURRENT_EXPERIENCE_DESCRIPTION', label: 'Extract the description of the current experience' },
    { value: 'COMMON_EDUCATION', label: 'Extract the common education' },
  ];


  const [activeTab, setActiveTab] = useState<string>(innerProps.currentTab || 'LINKEDIN');
  const [question, setQuestion] = useState<string>(innerProps.question || '');
  const [relevancy, setRelevancy] = useState<string>(innerProps.relevancy ||'');
  const [loading, setLoading] = useState<boolean>(false);
  const editing = innerProps.edit;
  const questionId = innerProps.question_id as any;

  const userToken = useRecoilValue(userTokenState);

  const renderSpecificOrGeneralQuestions = () => (
    <Box pt="xs">
      <Paper shadow="xs" mt="lg" mb="lg" radius="md" p="md" style={{ backgroundColor: '#f0f4ff', borderLeft: '4px solid #3b82f6' }}>
        <Text size="xs" color="#3b82f6" weight={500}>
          Reference company as [[company]] and prospect as [[prospect]]. (Ex. "Does [[company]] hire engineers?")
        </Text>
      </Paper>
      <TextInput 
        defaultValue={question}
        label="Question" 
        placeholder="'Does [[company]] hire engineers?'" 
        description="This question will be processed by SellScale's AI to guide the inquiry during its research."
        onChange={(event) => {
          if (event.currentTarget.value !== null && typeof event.currentTarget.value === 'string') {
            setQuestion(event.currentTarget.value);
          }
        }}
      />
      <Textarea 
        defaultValue={relevancy}
        label="Why is this relevant? / How should the AI use this?" 
        placeholder="'This information helps in understanding [[prospect]]'s background, skills, and experience.'" 
        description="Provide a detailed explanation of the relevance and how the AI should utilize this information."
        onChange={(event) => {
          if (event.currentTarget.value !== null && typeof event.currentTarget.value === 'string') {
            setRelevancy(event.currentTarget.value);
          }
        }}
      />
    </Box>
  );

  return (
    <Paper>
      <Center>
        <SegmentedControl
          value={activeTab}
          onChange={setActiveTab}
          data={[
            {
              value: 'LINKEDIN',
              label: (
                <Center style={{ gap: 4 }}>
                  <IconBrandLinkedin size={14} />
                  <Text>LinkedIn</Text>
                </Center>
              ),
            },
            {
              value: 'QUESTION',
              label: (
                <Center style={{ gap: 4 }}>
                  <IconQuestionMark size={14} />
                  <Text>Specific Question</Text>
                </Center>
              ),
            },
            {
              value: 'GENERAL',
              label: (
                <Center style={{ gap: 4 }}>
                  <IconSearch size={14} />
                  <Text>General Research</Text>
                </Center>
              ),
            },
          ]}
        />
      </Center>

      {activeTab === 'LINKEDIN' && (
        <Box pt="xs">
          <Select
            withinPortal
            defaultValue={question}
            label="Question"
            placeholder="Select your question"
            data={linkedinQuestions}
            onChange={(value) => {
                if (value !== null && typeof value === 'string') {
                  setQuestion(value);
                }
              }}
          />
          <Textarea 
            defaultValue={relevancy}
            label="Why is this relevant? / How should the AI use this?" 
            placeholder="Enter details" 
            onChange={(event) => {
                if (event.currentTarget.value !== null && typeof event.currentTarget.value === 'string') {
                  setRelevancy(event.currentTarget.value);
                }
              }}
          />
        </Box>
      )}
      {(activeTab === 'QUESTION' || activeTab === 'GENERAL') && renderSpecificOrGeneralQuestions()}

      <Center mt="md">
        <Button onClick={() => {
          // disgusting hack to get us back to the main modal.
          closeAllModals();
          openContextModal({
            modal: "campaignPersonalizersModal",
            title: <Title order={3}>Personalizers</Title>,
            innerProps: {
              ai_researcher_id: innerProps.ai_researcher_id,
              id: innerProps.campaign_id,
              setPersonalizers: innerProps.setPersonalizers,
            },
            centered: true,
            styles: {
              content: {
                minWidth: "1100px",
              },
            },
          });
        }} style={{ marginRight: '8px', backgroundColor: 'red' }}>Close</Button>
        <Button loading={loading} onClick={() => {
          setLoading(true);
          if (!editing) {
            researchers.createResearcherQuestion(userToken, activeTab, question, relevancy, Number(innerProps.ai_researcher_id))
            .then(response => {
              console.log('Researcher question created successfully:', response);
            })
            .catch(error => {
              console.error('Error creating researcher question:', error);
            });
          } else {
            researchers.updateResearcherQuestion(userToken, questionId, question, relevancy, activeTab)
            .then(response => {
              console.log('Researcher question updated successfully:', response);
            })
            .catch(error => {
              console.error('Error updating researcher question:', error);
            });
          }
          // disgusting hack to get us back to the main modal.
          setTimeout(() => {
            closeAllModals();
            openContextModal({
              modal: "campaignPersonalizersModal",
              title: <Title order={3}>Personalizers</Title>,
              innerProps: {
                ai_researcher_id: innerProps.ai_researcher_id,
                id: innerProps.campaign_id,
                setPersonalizers: innerProps.setPersonalizers,
              },
              centered: true,
              styles: {
                content: {
                  minWidth: "1100px",
                },
              },
            });
            setLoading(false);
          }, 350);
        
        }} style={{ marginLeft: '8px', backgroundColor: 'green' }}>Save & Close</Button>
      </Center>
    </Paper>
  );
};

export default QuestionModal;
