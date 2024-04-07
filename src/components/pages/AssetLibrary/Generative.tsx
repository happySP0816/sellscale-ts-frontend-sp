import { Button, Flex, List, Text } from '@mantine/core';
import { useState } from 'react';
import EmailSubject from './EmailSubject';
import LinkedinCTAs from './LinkedinCta';

export default function Generative(props: any) {
  const [tabs, setTabs] = useState('others');
  return (
    <>
      <Flex align={'center'} justify={'space-between'} w={'100%'} bg={'#f3f4f6'} p={8} style={{ borderRadius: '8px', borderTopLeftRadius: '0px' }}>
        <Flex>
          <Button onClick={() => setTabs('others')} color={'gray'} variant={tabs === 'others' ? 'white' : 'tranparent'}>
            Others
          </Button>
          <Button onClick={() => setTabs('phrases')} color={'gray'} variant={tabs === 'phrases' ? 'white' : 'tranparent'}>
            Phrases
          </Button>
          <Button onClick={() => setTabs('study')} color={'gray'} variant={tabs === 'study' ? 'white' : 'tranparent'}>
            Case Studies
          </Button>
          <Button onClick={() => setTabs('research')} color={'gray'} variant={tabs === 'research' ? 'white' : 'tranparent'}>
            Research Points
          </Button>
          <Button onClick={() => setTabs('email_subject_lines')} color={'gray'} variant={tabs === 'email_subject_lines' ? 'white' : 'tranparent'}>
            Email Subject Lines
          </Button>
          <Button onClick={() => setTabs('linkedin_cta')} color={'gray'} variant={tabs === 'linkedin_cta' ? 'white' : 'tranparent'}>
            Linkedin CTAs
          </Button>
        </Flex>
      </Flex>
      {tabs === 'email_subject_lines' ? <EmailSubject /> : tabs === 'linkedin_cta' ? <LinkedinCTAs /> : <></>}
    </>
  );
}
