import { Avatar, Group, Menu, Button, Text } from '@mantine/core';
import { IconSettings, IconSearch, IconPhoto, IconMessageCircle, IconTrash, IconArrowsLeftRight } from '@tabler/icons';
import { useState } from 'react';

export default function ProfileTab({ name, email }: { name: string, email: string }) {
  return (
    <Menu trigger="hover" openDelay={100} closeDelay={400} shadow="md" width={200}>
      <Menu.Target>
        <Group style={{cursor: 'pointer', width: 200}} className='inline-flex flex-nowrap truncate'>
          <Avatar
            src={null}
            alt={`${name}'s Profile Picture`}
            color="teal"
            radius="xl"
          />
          <div className='inline-flex flex-col'>
            <Text fz="xs" fw={700}>{name}</Text>
            <Text fz="xs" c="dimmed">{email}</Text>
          </div>
        </Group>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item icon={<IconSettings size={14} />}>Settings</Menu.Item>
        <Menu.Item icon={<IconMessageCircle size={14} />}>Messages</Menu.Item>
        <Menu.Item icon={<IconPhoto size={14} />}>Gallery</Menu.Item>
        <Menu.Item
          icon={<IconSearch size={14} />}
          rightSection={<Text size="xs" color="dimmed">⌘K</Text>}
        >
          Search
        </Menu.Item>

        <Menu.Divider />

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item icon={<IconArrowsLeftRight size={14} />}>Transfer my data</Menu.Item>
        <Menu.Item color="red" icon={<IconTrash size={14} />}>Delete my account</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
