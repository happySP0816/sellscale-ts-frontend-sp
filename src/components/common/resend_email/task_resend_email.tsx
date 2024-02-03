import { Body, Button, Container, Head, Html, Img, Link, Preview, Section, Text, Column, Row } from '@react-email/components';

import axios from 'axios';
import React from 'react';

import { render } from '@react-email/render';
import { Table } from '@mantine/core';
import { API_URL } from '@constants/data';

const main = {
  backgroundColor: '#ffffff',
  color: '#24292e',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
};

const container = {
  width: '480px',
  margin: '0 auto',
  padding: '20px 0 48px',
};

const content = `
  Hi Hristina\n
  Here is your weekly report. Any luck scheduling with Miki?\n
  Last week, we:\n
  \t- launched the US-focused MM DevOps campaign\n
  \t- started warming email\n
  \t- got a response from Mild\n
  Best,\n
  Ishan
`;
const formattedContent = content.replace(/\n/g, '<br/>');

const EmailTemplate = () => {
  return (
    <Body style={main}>
      <Container style={container}>
        <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', backgroundColor: '#fff', padding: '30px 0px' }}>
          <div
            style={{
              maxWidth: '760px',
              minWidth: '600px',
              margin: 'auto',
              marginBottom: '60px',
              textAlign: 'center',
            }}
          >
            <Row
              style={{
                justifyContent: 'space-between',
                backgroundColor: 'black',
                padding: '15px 40px 15px 40px',
                borderRadius: '6px',
                width: '100%',
              }}
            >
              <Column style={{ textAlign: 'start' }}>
                <img
                  src='https://www.aitoolsclub.com/content/images/2023/06/Screenshot-2023-06-28-151838.png'
                  width='150px'
                  style={{ background: 'black' }}
                />
              </Column>
              <Column style={{ textAlign: 'end' }}>
                <Link href='https://example.com' target='_blank' style={{ color: 'gray' }}>
                  Go to Dashboard
                  <svg
                    style={{ marginLeft: '7px', width: '18px', height: '18px', color: 'gray' }}
                    width='24'
                    height='24'
                    viewBox='0 0 24 18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    {' '}
                    <path stroke='none' d='M0 0h24v24H0z' /> <path d='M11 7h-5a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-5' />{' '}
                    <line x1='10' y1='14' x2='20' y2='4' /> <polyline points='15 4 20 4 20 9' />
                  </svg>
                </Link>
              </Column>
            </Row>

            <Section
              style={{
                border: '2px solid #efedf1',
                borderRadius: '6px',
                width: '100%',
                marginTop: '12px',
                padding: '20px 34px 40px',
              }}
            >
              <Text
                style={{
                  color: 'gray',
                  fontWeight: '500',
                  fontSize: '16px',
                  textAlign: 'start',
                }}
              >
                You have <b>7 new tasks</b> to complete. Sign in to SellScale to view and complete them.
              </Text>

              {/* Task Start */}
              <Row style={{ marginBottom: '20px' }}>
                <Column
                  style={{
                    border: '1px solid #efeef1',
                    borderRadius: '6px',
                    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                    backgroundColor: 'white',
                    padding: '10px',
                    gap: '20px',
                    width: '100%',
                    marginBottom: '14px',
                  }}
                >
                  <Row>
                    <Column style={{ minWidth: '4px', borderRadius: '6px', backgroundColor: 'gray' }}></Column>
                    <Column style={{ width: '100%', textAlign: 'start', paddingLeft: '20px' }}>
                      <Text style={{ fontWeight: 600, fontSize: '14px' }}>Due Jan 31</Text>
                      <Text style={{ fontWeight: 600, fontSize: '20px' }}>Review 3 New Campaign</Text>
                      <Text style={{ color: 'gray', fontWeight: 500, marginTop: '-10px' }}>There is a new Heads of Finance campaign with 250 prospects.</Text>
                      <Button
                        href='#lets_do_it'
                        style={{
                          marginBottom: '22px',
                          backgroundColor: '#fd4efe',
                          color: 'white',
                          borderRadius: '6px',
                          padding: '10px 20px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Text style={{ margin: '0px' }}>Lets do it </Text>
                          <svg
                            style={{ marginLeft: '7px', width: '20px', height: '24px' }}
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            strokeWidth='2'
                            stroke='currentColor'
                            fill='none'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          >
                            {' '}
                            <path stroke='none' d='M0 0h24v24H0z' /> <line x1='5' y1='12' x2='19' y2='12' /> <line x1='15' y1='16' x2='19' y2='12' />{' '}
                            <line x1='15' y1='8' x2='19' y2='12' />
                          </svg>
                        </div>
                      </Button>
                    </Column>
                  </Row>
                </Column>
              </Row>
              {/* Task End */}

              <Row style={{ marginTop: '20px' }}>
                <Button href='#view_all_tasks' style={{ color: '#fd4efe', borderRadius: '6px', border: '1px solid #fd4efe', padding: '10px 20px' }}>
                  View All Tasks
                </Button>
              </Row>
            </Section>

            <Section style={{ marginTop: '30px' }}>
              <Section>
                <div
                  style={{
                    border: '2px solid #edebef',
                    borderStyle: 'dashed',
                    borderRadius: '8px',
                    padding: '20px 40px',
                  }}
                >
                  <Text style={{ fontSize: '16px', textAlign: 'start' }}>
                    This email was sent to{' '}
                    <Link style={{ color: '#fd4efe', textDecoration: 'underline' }} href='ishan@sellscale.com'>
                      ishan@sellscale.com
                    </Link>. 
                    <br/>
                    <br/>
                    <b>⚠️ Important ⚠️: </b>Do not forward this email to others as they will be able to log in to your SellScale account
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBlock: '16px' }}>
                    <img
                      src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0b5lrIs317CdpSkXImMEzyw8FwGX5ogdiKTT4xwGb&s'
                      width='150px'
                      style={{ background: 'black' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                      <img src='https://cdn-icons-png.flaticon.com/512/733/733579.png' width='30px' />
                      <img src='https://cdn1.iconfinder.com/data/icons/logotypes/32/circle-linkedin-512.png' width='30px' />
                    </div>
                  </div>
                </div>
              </Section>
            </Section>
          </div>
        </div>
      </Container>
    </Body>
  );
};

export default function TaskEmailTemplate() {
  const fetchData = async () => {
    const html = render(<EmailTemplate />, {
      pretty: true,
    });
    const data = {
      html: html,
    };
    console.log(html);

    const response = await fetch(`${API_URL}/automation/send_resend_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.status === 200) {
        console.log('Email sent');
      } else {
        console.log('Email not sent');
      }
    });
  };
  return (
    <>
      <button
        style={{ fontSize: '14px', color: 'white', backgroundColor: 'green', marginBottom: '14px', marginTop: '14px', marginLeft: '14px' }}
        onClick={fetchData}
      >
        Print Email HTML in Console
      </button>
      <EmailTemplate />
    </>
  );
}
