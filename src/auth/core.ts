import { API_URL } from "@constants/data";
import { SetterOrUpdater } from "recoil";

export function isLoggedIn(){
  return localStorage.getItem('user-token')
    && localStorage.getItem('user-data');
}

export function login(email: string, setUserData: SetterOrUpdater<any>){

  setUserData({ sdr_email: email });
  localStorage.setItem('user-data', JSON.stringify({ sdr_email: email }));

}

export async function authorize(token: string, setUserToken: SetterOrUpdater<string>, setUserData: SetterOrUpdater<any>){

  setUserToken(token);
  localStorage.setItem('user-token', token);

  const info = await getUserInfo(token);
  if(!info){ logout(); }

  setUserData(info);
  localStorage.setItem('user-data', JSON.stringify(info));
  document.cookie = `token=${token}; SameSite=None; Secure`;

}

export function logout(noCheck = false){

  const logoutProcess = () => {
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-data');
    document.cookie = `token=; SameSite=None; Secure`;
    window.location.href = '/';
  }

  if(noCheck){
    logoutProcess();
  } else {
    // Check to confirm that the token is invalid
    getUserInfo(localStorage.getItem('user-token')).then((info) => {
      if(!info){
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
export async function syncLocalStorage(userToken: string){
  if(!isLoggedIn()){ return; }

  const info = await getUserInfo(userToken);
  if(!info){ logout(); }
  localStorage.setItem('user-data', JSON.stringify(info));
  document.cookie = `token=${userToken}; SameSite=None; Secure`;
}

export async function getUserInfo(userToken: string | null) {
  if(userToken === null){ return null; }

  const response = await fetch(
    `${API_URL}/client/sdr`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    }
  );
  if (response.status === 401) {
    return null;
  }
  const res = await response.json();
  if (!res || !res.sdr_info) {
    return null;
  }

  return res.sdr_info;
}
