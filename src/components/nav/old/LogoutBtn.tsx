import { logout } from "@auth/core";
import { Tooltip, Text, Center, Popover, Container } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons";

export default function LogoutBtn() {
  return (
    <Tooltip
      disabled={true}
      label="Logout"
      position="right"
      className="cursor-pointer"
      onClick={() => logout(true)}
      withArrow
    >
      <div
        style={{
          display: "flex",
          paddingLeft: 4,
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: 55,
            userSelect: 'none',
          }}
        >
          <Container p={5} m={0} sx={{ lineHeight: '0px' }}>
            <IconLogout size={22} />
          </Container>
          <Container p={5} m={0}>
            <Text fz="sm">Logout</Text>
          </Container>
        </div>
      </div>
    </Tooltip>
  );
}
