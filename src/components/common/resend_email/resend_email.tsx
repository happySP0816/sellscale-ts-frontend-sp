import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Column,
  Row,
} from '@react-email/components';

import axios from "axios";
import React from "react";

import { render } from "@react-email/render";
import { Table } from '@mantine/core';
import { API_URL } from '@constants/data';

const main = {
  backgroundColor: '#ffffff',
  color: '#24292e',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
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
        <div style={{fontFamily: "Helvetica, Arial, sans-serif", backgroundColor: "#fff", padding: "30px 0px"}}>
          
          <div
            style={{
              maxWidth: "660px",
              margin: "auto",
              marginBottom: "60px",
              textAlign: "center",
            }}
          >
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0b5lrIs317CdpSkXImMEzyw8FwGX5ogdiKTT4xwGb&s" width="250px" style={{
              marginTop: 20,          
            }}/>

            {/* TITLE SECTION */}
            <Text
              style={{
                fontWeight: "600",
                fontSize: "30px",
                textAlign: "center",
                lineHeight: "normal",
              }}
            >
              Jennifer Bell's Weekly Report
            </Text>

            {/* DATE SECTION */}
            <Text style={{ fontSize: "12px", textAlign: "center", color: "#837f8a" }}>
              November 6, 2023 - November 14, 2023
            </Text>

            {/* WARMING SECTION */}
            <Section
              style={{
                border: "2px solid #ffe5d5",
                borderRadius: "8px",
                width: "100%",
                marginTop: "12px",
              }}
            >
              <Row>
                <Column
                  style={{
                    backgroundColor: "#fff8f3",
                    borderRadius: "8px",
                    padding: "0px 3px",
                  }}
                >
                  <Text
                    style={{
                      color: "#fb7400",
                      fontWeight: "800",
                      fontSize: "16px",
                      textAlign: "center",
                    }}
                  >
                    🔥 Warming Report
                  </Text>
                </Column>
              </Row>
              <Row
                style={{
                  borderBottom: "1px solid #fff3ea",
                  padding: "7px 7px",
                  gap: "4px",
                }}
              >
                <Column style={{ width: "fit-content" }}>
                  <Row style={{ width: "fit-content" }}>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" height={14} width={14} />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        marginLeft: "10px",
                        marginRight: "10px",
                      }}
                    >
                      LinkedIn:
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#837f8a",
                      }}
                    >
                      warming 90 invites/week
                    </span>
                  </Row>
                </Column>
                <div style={{ padding: "12px 10px" }}>
                  <Column>
                    <div
                      style={{
                        gap: "14px",
                        backgroundColor: "#fff3ea",
                        borderRadius: "14px",
                        padding: "3px 14px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "900",
                          color: "#fb7400",
                          marginRight: "8px",
                        }}
                      >
                        Next Week:
                      </span>
                      <span style={{fontSize: "12px"}}>90 invites/week</span>
                    </div>
                  </Column>
                </div>
              </Row>
              <Row
                style={{
                  borderBottom: "1px solid #fff3ea",
                  padding: "7px 7px",
                  gap: "4px",
                }}
              >
                <Column style={{ width: "fit-content" }}>
                  <Row style={{ width: "fit-content" }}>
                    <img src="https://cdn4.iconfinder.com/data/icons/social-media-logos-6/512/112-gmail_email_mail-512.png" height={14} width={14} />
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        marginLeft: "10px",
                        marginRight: "10px",
                      }}
                    >
                      Email:
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "#837f8a",
                      }}
                    >
                      warming 90 invites/week
                    </span>
                  </Row>
                </Column>
                <div style={{ padding: "12px 10px" }}>
                  <Column>
                    <div
                      style={{
                        gap: "14px",
                        backgroundColor: "#fff3ea",
                        borderRadius: "14px",
                        padding: "3px 14px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "900",
                          color: "#fb7400",
                          marginRight: "8px",
                        }}
                      >
                        Next Week:
                      </span>
                      <span style={{fontSize: "12px"}}>90 invites/week</span>
                    </div>
                  </Column>
                </div>
              </Row>
            </Section>

            {/* LETTER FROM CSM SECTION */}
            <Section
              style={{
                textAlign: "start",
                borderBottom: "2px dashed #edebef",
                marginTop: "30px",
                fontSize: "14px",
                paddingBottom: "12px",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: formattedContent }}></div>
            </Section>

            {/* CUMULATIVE STATS SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <Row>
                <Column>
                  <Text
                    style={{
                      color: "#464646",
                      fontWeight: "800",
                      fontSize: "22px",
                      textAlign: "center",
                    }}
                  >
                    👥 Company Cumulative
                  </Text>
                </Column>
              </Row>
              <Row style={{ marginTop: "30px", width: "100%" }}>
                  <Column style={{ width: "100%" }}>
                    <div
                      style={{
                        border: "1px solid #edebef",
                        borderRadius: "8px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Header Row */}
                      <div style={{ display: "flex", textAlign: "center", border: "1px solid #edebef", width: "100%" }}>
                        <div style={{ flex: 1, padding: "6px", borderRight: "1px solid #edebef", width: "25%" }}>
                          <span style={{ fontSize: 13, color: 'grey' }}>Sent:</span> <span style={{ color: '#F4B0FB' }}>1073</span>
                        </div>
                        <div style={{ flex: 1, padding: "6px", borderRight: "1px solid #edebef", width: "25%" }}>
                          <span style={{ fontSize: 13, color: 'grey' }}>Opens:</span> <span style={{ color: '#6FA4F3' }}>342</span>
                        </div>
                        <div style={{ flex: 1, padding: "6px", borderRight: "1px solid #edebef", width: "25%" }}>
                          <span style={{ fontSize: 13, color: 'grey' }}>Replies:</span> <span style={{ color: '#60B764' }}>142</span>
                        </div>
                        <div style={{ flex: 1, padding: "6px", width: "25%" }}>
                          <span style={{ fontSize: 13, color: 'grey' }}>Demos:</span> <span style={{ color: '#ED918C' }}>23</span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid #edebef",
                        borderRadius: "8px",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {/* Data Row */}
                      <div style={{ display: "flex", textAlign: "center", border: "1px solid #edebef", width: "100%" }}>
                        <div style={{ flex: 1, padding: "6px", borderRight: "1px solid #edebef", fontWeight: 'bold', width: "25%" }}>
                          🟢 100%
                        </div>
                        <div style={{ flex: 1, padding: "6px", borderRight: "1px solid #edebef", fontWeight: 'bold', width: "25%" }}>
                          🟢 18%
                        </div>
                        <div style={{ flex: 1, padding: "6px", borderRight: "1px solid #edebef", fontWeight: 'bold', width: "25%" }}>
                          🟢 6%
                        </div>
                        <div style={{ flex: 1, padding: "6px", fontWeight: 'bold', width: "25%" }}>
                          🟢 0.4%
                        </div>
                      </div>
                    </div>

                  </Column>
              </Row>
            </Section>

            {/* ACTIVE CAMPAIGNS SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <Row>
                <Column>
                  <Text
                    style={{
                      color: "#464646",
                      fontWeight: "800",
                      fontSize: "22px",
                      textAlign: "center",
                    }}
                  >
                    🎯 Your Active Campaigns
                  </Text>
                </Column>
              </Row>
              <div
                style={{
                  border: "2px solid #cfe5fe",
                  gap: "4px",
                  backgroundColor: "#f4f9ff",
                  borderRadius: "6px",
                  padding: "14px 0px",
                  marginTop: "30px",
                }}
              >
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Row style={{ width: "fit-content" }}>
                      <span
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          // border: "0 solid #dedde1",
                          //   background: `radial-gradient(
                          //   closest-side
                          //     at 50% 50%,
                          //   white 79%,
                          //   transparent 80%
                          // ),
                          // conic-gradient(#0387f7 50%, #dedde1 0%)`,
                          padding: "10px",
                          color: "#838385",
                          fontWeight: "700",
                          fontSize: "14px",
                        }}
                      >
                        50%
                      </span>
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "12px",
                          marginLeft: "12px",
                          marginRight: "12px",
                        }}
                      >
                        AskEdith Partners
                      </span>
                      <span
                        style={{
                          backgroundColor: "#d8f1e6",
                          color: "#00a92a",
                          borderRadius: "14px",
                          padding: "1px 14px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        ACTIVE
                      </span>
                    </Row>
                  </Column>
                  <Column>
                    <Row
                      style={{
                        backgroundColor: "#0387f7",
                        borderRadius: "14px",
                        margin: "auto",
                        width: "40%",
                      }}
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" height={14} width={14} />
                      <Column>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "white",
                          }}
                        >
                          LinkedIn
                        </span>
                      </Column>
                    </Row>
                  </Column>
                </Row>
              </div>
              <div
                style={{
                  border: "2px solid #cfe5fe",
                  gap: "4px",
                  backgroundColor: "#f4f9ff",
                  borderRadius: "6px",
                  padding: "14px 0px",
                  marginTop: "30px",
                }}
              >
                <Row>
                  <Column style={{ width: "60%" }}>
                    <Row style={{ width: "fit-content", flexDirection: "row", alignItems: "left", display: "flex" }}>
                      <span
                        style={{
                          width: "34px",
                          height: "34px",
                          maxWidth: "34px",
                          maxHeight: "34px",
                          // borderRadius: "50%",
                          // border: "0 solid #dedde1",
                          //   background: `radial-gradient(
                          //   closest-side
                          //     at 50% 50%,
                          //   white 79%,
                          //   transparent 80%
                          // ),
                          // conic-gradient(#0387f7 4%, #dedde1 0%)`,
                          padding: "15px",
                          color: "#838385",
                          fontWeight: "700",
                        }}
                      >
                        4%
                      </span>
                      <span
                        style={{
                          fontWeight: "600",
                          fontSize: "12px",
                          marginLeft: "12px",
                          marginRight: "12px",
                        }}
                      >
                        Heads of Security...
                      </span>
                      <span
                        style={{
                          backgroundColor: "#d8f1e6",
                          color: "#00a92a",
                          borderRadius: "14px",
                          padding: "1px 14px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        ACTIVE
                      </span>
                    </Row>
                  </Column>
                  <Column>
                    <Row
                      style={{
                        backgroundColor: "#0387f7",
                        borderRadius: "14px",
                        margin: "auto",
                        width: "40%",
                      }}
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/640px-LinkedIn_logo_initials.png" height={14} width={14} />
                      <Column>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "white",
                          }}
                        >
                          LinkedIn
                        </span>
                      </Column>
                    </Row>
                  </Column>
                </Row>
              </div>
            </Section>

            {/* THIS WEEK PIPELINE SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <Text
                style={{
                  color: "#464646",
                  fontWeight: "800",
                  fontSize: "22px",
                  textAlign: "center",
                }}
              >
                🚀 Your pipeline this week
              </Text>

              <div style={{
                border: "2px solid #edebef",
                borderRadius: "8px",
                width: "100%",
                marginTop: "12px",
                padding: "14px 0px",
              }}>
                <div>
                  <Row>
                    <div style={{ width: "100%" }}>
                      <Row>
                        <Column style={{ width: "140px" }}>
                          <div
                            style={{
                              width: "74px",
                              height: "240px",
                              backgroundColor: "#e745e7",
                              margin: "auto",
                            }}
                          ></div>
                        </Column>
                        <Column style={{ width: "140px" }}>
                          <div
                            style={{
                              width: "74px",
                              height: "180px",
                              backgroundColor: "#e745e7",
                              margin: "auto",
                              marginTop: "60px",
                            }}
                          ></div>
                        </Column>
                        <Column style={{ width: "140px" }}>
                          <div
                            style={{
                              width: "74px",
                              height: "80px",
                              backgroundColor: "#e745e7",
                              margin: "auto",
                              marginTop: "160px",
                            }}
                          ></div>
                        </Column>
                        <Column style={{ width: "140px" }}>
                          <div
                            style={{
                              width: "74px",
                              height: "10px",
                              backgroundColor: "#e745e7",
                              margin: "auto",
                              marginTop: "230px",
                            }}
                          ></div>
                        </Column>
                      </Row>
                    </div>
                  </Row>
                </div>
              </div>
              <Row style={{ marginTop: "10px" }}>
                <Column style={{ width: "140px" }}>
                  <Row
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "26px",
                        textAlign: "center",
                        color: "#e745e7",
                        marginBottom: "0px",
                      }}
                    >
                      +73
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        textAlign: "center",
                        color: "#8a8690",
                        marginTop: "0px",
                      }}
                    >
                      Sent Outreach
                    </p>
                  </Row>
                  <Row>
                    
                  </Row>
                </Column>
                <Column style={{ width: "140px" }}>
                  <Row
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "26px",
                        textAlign: "center",
                        color: "#e745e7",
                        marginBottom: "0px",
                      }}
                    >
                      +8
                    </p>
                    <p
                      style={{
                        marginTop: "0px",
                        fontSize: "14px",
                        textAlign: "center",
                        color: "#8a8690",
                      }}
                    >
                      Accepted
                    </p>
                  </Row>
                </Column>
                <Column style={{ width: "140px" }}>
                  <Row
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "26px",
                        textAlign: "center",
                        color: "#e745e7",
                        marginBottom: "0px",
                      }}
                    >
                      +2
                    </p>
                    <p
                      style={{
                        marginTop: "0px",
                        fontSize: "14px",
                        textAlign: "center",
                        color: "#8a8690",
                      }}
                    >
                      Active Convos
                    </p>
                  </Row>
                </Column>
                <Column style={{ width: "140px" }}>
                  <Row
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "26px",
                        textAlign: "center",
                        color: "#e745e7",
                        marginBottom: "0px",
                      }}
                    >
                      +0
                    </p>
                    <p
                      style={{
                        marginTop: "0px",
                        fontSize: "14px",
                        textAlign: "center",
                        color: "#8a8690",
                      }}
                    >
                      Demo Set
                    </p>
                  </Row>
                </Column>
              </Row>
            </Section>

            {/* POSITIVE RESPONSES SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <Row>
                <Column>
                  <Text
                    style={{
                      color: "#464646",
                      fontWeight: "800",
                      fontSize: "22px",
                      textAlign: "center",
                    }}
                  >
                    <Row>
                      <Column>
                        <Text
                          style={{
                            color: "#464646",
                            fontWeight: "800",
                            fontSize: "22px",
                            textAlign: "center",
                          }}
                        >
                          😍 Your Positive Responses
                        </Text>
                      </Column>
                    </Row>
                  </Text>
                </Column>
              </Row>
              <Section
                style={{
                  border: "2px solid #edebef",
                  borderRadius: "8px",
                  width: "100%",
                }}
              >
                <Row>
                  <Column
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      padding: "14px 25px",
                      borderTopRightRadius: "8px",
                      borderTopLeftRadius: "8px",
                      borderBottom: "1px solid #edebef",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: "22px",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontWeight: "700", fontSize: "14px" }}>
                        Miki Hayut
                      </span>
                      <span
                        style={{
                          fontWeight: "700",
                          fontSize: "14px",
                          color: "#8a8690",
                          marginInline: "4px",
                        }}
                      >
                        @ OwnBackup
                      </span>
                      <span style={{ fontWeight: "700", fontSize: "14px" }}>
                        - Jennifer Bell
                      </span>
                    </Text>
                  </Column>
                </Row>
                <Row
                  style={{
                    backgroundColor: "#f6f5f7",
                    fontSize: "14px",
                    fontStyle: "italic",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 30px",
                    }}
                  >
                    "Hi yes. Can you please send me and email to michael@abs.com.
                    and i will to the person who is oncharge Of the seetion
                    process "
                  </div>
                </Row>
              </Section>
            </Section>

            {/* NEXT WEEK SAMPLE PROSPECTS SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <div style={{ width: "100%" }}>
                <Row>
                  <Column
                    style={{
                      width: "fit-content",
                      marginLeft: "-4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#464646",
                        fontWeight: "800",
                        fontSize: "22px",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      👥 Next Week's' Sample Prospects
                    </Text>
                  </Column>
                </Row>
              </div>
              <Text style={{ color: "#837f8a" }}>
                If these prospects aren't good fits, please contact us through
                Slack
              </Text>
              <Section>
                <Row
                  style={{
                    border: "2px solid #edebef",
                    borderStyle: "dashed",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ padding: "14px 0px 40px" }}>
                    <Text style={{ fontSize: "14px", fontWeight: "700" }}>
                      Campaign:
                      <a
                        href="#"
                        style={{ color: "#138bf8", marginLeft: "10px" }}
                      >
                        Executive decision makers (435 prospects left)
                      </a>
                    </Text>
                    <Section style={{ marginTop: "24px" }}>
                      <Row>
                        <Column style={{ width: "fit-content" }}>
                          <span
                            style={{
                              color: "#009d01",
                              fontSize: "12px",
                              lineHeight: "0%",
                              marginLeft: "4px",
                              marginRight: "4px",
                            }}
                          >
                            🟩 VERY HIGH
                          </span>
                          <span
                            style={{
                              color: "#837f8a",
                              fontSize: "12px",
                              lineHeight: "0%",
                              fontWeight: "700",
                            }}
                          >
                            - Aaron Mackey,
                          </span>{" "}
                        </Column>
                      </Row>
                      <Row>
                        <Text
                          style={{
                            color: "#837f8a",
                            fontSize: "12px",
                            margin: "0px",
                          }}
                        >
                          VP, Head of AI and ML @ Sonata Therapeutics
                        </Text>
                      </Row>
                    </Section>
                    <Section style={{ marginTop: "12px" }}>
                      <Row>
                        <Column style={{ width: "fit-content" }}>
                          <span
                            style={{
                              color: "#009d01",
                              fontSize: "12px",
                              lineHeight: "0%",
                              marginInline: "4px",
                            }}
                          >
                            🟩 VERY HIGH
                          </span>
                          <span
                            style={{
                              color: "#837f8a",
                              fontSize: "12px",
                              lineHeight: "0%",
                              fontWeight: "700",
                            }}
                          >
                            - Abhay A Shukla,
                          </span>{" "}
                        </Column>
                      </Row>
                      <Row>
                        <Text
                          style={{
                            color: "#837f8a",
                            fontSize: "12px",
                            margin: "0px",
                          }}
                        >
                          Director Molecular Research @ KSL Biomedical
                        </Text>
                      </Row>
                    </Section>
                    <Section style={{ marginTop: "12px" }}>
                      <Row>
                        <Column style={{ width: "fit-content" }}>
                          <span
                            style={{
                              color: "#009d01",
                              fontSize: "12px",
                              lineHeight: "0%",
                              marginInline: "4px",
                            }}
                          >
                            🟩 VERY HIGH
                          </span>
                          <span
                            style={{
                              color: "#837f8a",
                              fontSize: "12px",
                              lineHeight: "0%",
                              fontWeight: "700",
                            }}
                          >
                            - Adam Elsesser,
                          </span>{" "}
                        </Column>
                      </Row>
                      <Row>
                        <Text
                          style={{
                            color: "#837f8a",
                            fontSize: "12px",
                            margin: "0px",
                          }}
                        >
                          CEO @ Penumbra Inc
                        </Text>
                      </Row>
                    </Section>
                  </div>
                </Row>
              </Section>
            </Section>

            {/* PROSPECT LIST SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <div style={{ width: "100%" }}>
                <Row>
                  <Column
                    style={{
                      width: "fit-content",
                      marginLeft: "-4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#464646",
                        fontWeight: "800",
                        fontSize: "22px",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      👥 Prospect List
                    </Text>
                  </Column>
                </Row>
              </div>
              <Section>
                <Row
                  style={{
                    border: "2px solid #edebef",
                    borderStyle: "dashed",
                    borderRadius: "8px",
                  }}
                >
                  <Text style={{ fontSize: "14px", fontWeight: "700" }}>
                    Automatically removed 9 prospects from pipeline
                  </Text>
                  <Text style={{ color: "#837f8a", fontSize: "12px" }}>
                    SellScale automatically removes prospects that are <br />
                    not good fits for your target ICP.
                  </Text>
                </Row>
              </Section>
            </Section>

            {/* VISIT DASHBOARD SECTION */}
            <Section style={{ marginTop: "30px" }}>
              <div style={{ width: "100%", textAlign: 'center' }}>
                <Row>
                  <Column
                    style={{
                      width: "fit-content",
                      marginLeft: "-4px",
                    }}
                  >
                    <Text
                      style={{
                        color: "#464646",
                        fontWeight: "800",
                        width: '100%',
                        fontSize: "22px",
                        textAlign: "center",
                      }}
                    >
                      🌐 Visit Dashboard
                    </Text>
                  </Column>
                </Row>
              </div>
              <Section>
                <Row
                  style={{
                    border: "2px solid #edebef",
                    borderStyle: "dashed",
                    borderRadius: "8px",
                  }}
                >
                  <Text style={{ color: "#837f8a", fontSize: "12px" }}>
                    To view our dashboard and access more information,
                    <br />
                    please visit
                    <a
                      href="#"
                      style={{
                        color: "black",
                        fontWeight: "700",
                        marginLeft: "4px",
                      }}
                    >
                      SellScale.
                    </a>
                  </Text>
                </Row>
              </Section>
            </Section>
          </div>

          {/* DONT SEND SECTION */}
          <Section style={{ borderTop: "3px solid #edebef", padding: "40px" }}>
            <Row style={{ textAlign: "center" }}>
              <Text
                style={{ fontSize: "14px", fontWeight: "500", color: "#837f8a" }}
              >
                Do not forward this Email/Link to someone else!
              </Text>
              <Text style={{ fontSize: "14px", fontWeight: "500" }}>
                They will be able to log in as you
              </Text>
            </Row>
          </Section>
        </div>
      </Container>
    </Body>
  );
};
export default function EmailHome() {
  const fetchData = async () => {
    const html = render(<EmailTemplate />, {
      pretty: true,
    });
    const data = {
      html: html,
    };  
    console.log(html)

    const response = await fetch(`${API_URL}/automation/send_resend_email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (res.status === 200) {
          console.log("Email sent");
        } else {
          console.log("Email not sent");
      }
    });
  };
  return (
    <>
    
      <button
        style={{ fontSize: "14px", color: "white", backgroundColor: "green", marginBottom: "14px", marginTop: "14px", marginLeft: "14px" }}
        onClick={fetchData}
      >
        Print Email HTML in Console
      </button>
      <EmailTemplate />
    </>
  );
}
