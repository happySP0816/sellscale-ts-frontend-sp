import { API_URL } from "@constants/data";
import { getPersonasOverview } from "@utils/requests/getPersonas";
import { set } from "lodash";
import { SetterOrUpdater } from "recoil";
import { ClientSDR, PersonaOverview } from "src";

export function isLoggedIn() {
  return !!(
    localStorage.getItem("user-token") && localStorage.getItem("user-data")
  );
}

export function isFreeUser() {
  const userData = localStorage.getItem("user-data");
  if (!userData) {
    return false;
  }

  const data = JSON.parse(userData);
  return data.role === "FREE";
}

export function login(email: string, setUserData: SetterOrUpdater<any>) {
  setUserData({ sdr_email: email });
  localStorage.setItem("user-data", JSON.stringify({ sdr_email: email }));
}

export async function authorize(
  token: string,
  setUserToken: SetterOrUpdater<string>,
  setUserData: SetterOrUpdater<any>
) {
  setUserToken(token);
  localStorage.setItem("user-token", token);

  const info = await getUserInfo(token);
  if (!info) {
    logout();
  }

  setUserData(info);
  localStorage.setItem("user-data", JSON.stringify(info));
  document.cookie = `token=${token}; SameSite=None; Secure`;
}

export function logout(noCheck = false, redirect = true, clearAdmin = true) {
  const logoutProcess = () => {
    localStorage.removeItem("user-token");
    localStorage.removeItem("user-data");
    if (clearAdmin) {
      localStorage.removeItem("admin-data");
    }
    document.cookie = `token=; SameSite=None; Secure`;
    if (window.location.href.includes("login")) {
      return;
    }
    if (redirect) {
      window.location.href = "/";
    }
  };

  if (noCheck) {
    logoutProcess();
  } else {
    // Check to confirm that the token is invalid
    getUserInfo(localStorage.getItem("user-token")).then((info) => {
      if (!info) {
        logoutProcess();
      }
    });
  }
}

/**
 * Syncs the local storage with the server user data
 * @param userToken
 * @returns
 */
export async function syncLocalStorage(
  userToken: string,
  setUserData: SetterOrUpdater<any>
) {
  if (!isLoggedIn()) {
    return;
  }

  const info = await getUserInfo(userToken);
  if (!info) {
    logout();
  }
  localStorage.setItem("user-data", JSON.stringify(info));
  document.cookie = `token=${userToken}; SameSite=None; Secure`;
  setUserData(info);
}

export async function getUserInfo(userToken: string | null) {
  if (userToken === null) {
    return null;
  }

  const response = await fetch(`${API_URL}/client/sdr`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  if (response.status === 401) {
    return null;
  }
  const res = await response.json();
  if (!res || !res.sdr_info) {
    return null;
  }

  return res.sdr_info as ClientSDR;
}

export function saveCurrentPersonaId(personaId: string) {
  localStorage.setItem("opened-persona-id", personaId);
}

export function getCurrentPersonaId() {
  return localStorage.getItem("opened-persona-id");
}

export async function getFreshCurrentProject(
  userToken: string,
  projectId: number
) {
  const response = await getPersonasOverview(userToken);
  const result =
    response.status === "success" ? (response.data as PersonaOverview[]) : [];

  const project = result.find((p) => p.id === projectId);
  return project || null;
}

export async function handleAdminUser(
  userToken: string,
  setAdminData: SetterOrUpdater<any>
) {
  const info = await getUserInfo(userToken);
  if (info && info.role === "ADMIN") {
    setAdminData(info);
    localStorage.setItem("admin-data", JSON.stringify(info));
  } else {
    localStorage.removeItem("admin-data");
  }
}

export async function impersonateSDR(
  sdr: ClientSDR,
  impersonate: ClientSDR,
  setUserToken: SetterOrUpdater<string>,
  setUserData: SetterOrUpdater<any>,
  reload: boolean = true
) {
  if (sdr.role !== "ADMIN") {
    return;
  }

  logout(true, false, false);

  await authorize(impersonate.auth_token, setUserToken, setUserData);

  if (reload) {
    window.location.reload();
  }
}
