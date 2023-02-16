import { logout } from "@auth/core";
import { Tooltip, Text, Center, Popover, Container } from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons";

export default function LogoutBtn() {
  return (
    <Tooltip
      label="Logout"
      position="right"
      className="cursor-pointer"
      onClick={() => logout()}
      withArrow
    >
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 55,
            userSelect: "none",
          }}
        >
          <IconLogout size={22} />
        </div>
      </div>
    </Tooltip>
  );
}
