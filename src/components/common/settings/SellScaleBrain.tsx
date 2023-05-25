import {
  Card,
  Paper,
  Text,
  Title,
  Button,
  MultiSelect,
  Box,
  Divider,
  Tabs,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { useRecoilState } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  IconBrandSuperhuman,
  IconBriefcase,
  IconFingerprint,
  IconPackages,
  IconPoint,
} from "@tabler/icons";
import ComingSoonCard from "@common/library/ComingSoonCard";
import SellScaleBrainPersonasTab from "./SellScaleBrain/SellScaleBrainPersonasTab";
import SellScaleBrainUserTab from "./SellScaleBrain/SellScaleBrainUserTab";
import SellScaleBrainCompanyTab from "./SellScaleBrain/SellScaleBrainCompanyTab";
import SellScaleBrainProductsTab from "./SellScaleBrain/SellScaleBrainProductsTab";

export default function SellScaleBrain() {
  const [userToken] = useRecoilState(userTokenState);

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Box>
        <Title order={3}>SellScale Brain</Title>
        <Text size="sm" mt="md">
          The SellScale Brain is a network of information that is used to
          customize your experience on SellScale. The more correct information
          you provide, the more accurate your experience will be.
        </Text>

        <Tabs variant="outline" defaultValue="company_info" mt="lg">
          <Tabs.List>
            <Tabs.Tab
              value="company_info"
              icon={<IconBriefcase size="0.8rem" />}
            >
              Company Info
            </Tabs.Tab>
            <Tabs.Tab
              value="user_info"
              icon={<IconFingerprint size="0.8rem" />}
            >
              User Info
            </Tabs.Tab>
            <Tabs.Tab
              value="persona_info"
              icon={<IconBrandSuperhuman size="0.8rem" />}
            >
              Persona Info
            </Tabs.Tab>
            <Tabs.Tab
              value="product_info"
              icon={<IconPackages size="0.8rem" />}
            >
              Products
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="company_info" pt="xs">
            <SellScaleBrainCompanyTab />
          </Tabs.Panel>

          <Tabs.Panel value="user_info" pt="xs">
            <SellScaleBrainUserTab />
          </Tabs.Panel>

          <Tabs.Panel value="persona_info" pt="xs">
            <SellScaleBrainPersonasTab />
          </Tabs.Panel>

          <Tabs.Panel value="product_info" pt="xs">
            <SellScaleBrainProductsTab />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Paper>
  );
}
