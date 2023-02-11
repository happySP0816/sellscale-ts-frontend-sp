import { hideNotification, showNotification, updateNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";

type NotificationDetails = {
  title: string;
  message: string;
  color: string;
};

export default async function displayNotification(id: string, fn: () => Promise<boolean>, loading: NotificationDetails, success: NotificationDetails, error: NotificationDetails) {

  hideNotification(id);
  showNotification({
    id: id,
    loading: true,
    title: loading.title,
    message: loading.message,
    color: loading.color,
    autoClose: false,
    disallowClose: true,
  });

  const showError = (message: string) => {
    updateNotification({
      id: id,
      autoClose: 5000,
      title: error.title,
      message,
      color: error.color,
      icon: <IconX />,
    });
  };

  let result = await fn();

  if (result) {
    updateNotification({
      id: id,
      autoClose: 5000,
      title: success.title,
      message: success.message,
      color: success.color,
      icon: <IconCheck />,
    });
  } else {
    showError(error.message);
  }

}
