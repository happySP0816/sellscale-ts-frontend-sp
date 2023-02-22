import { SetterOrUpdater } from "recoil";

export function isLoggedIn(){
  return localStorage.getItem('user-token')
    && localStorage.getItem('user-email')
    && localStorage.getItem('user-name');
}

export function login(email: string, setUserEmail: SetterOrUpdater<string>){

  setUserEmail(email);
  localStorage.setItem('user-email', email);

}

export async function authorize(token: string, setUserToken: SetterOrUpdater<string>, setUserName: SetterOrUpdater<string>, setUserEmail: SetterOrUpdater<string>){

  setUserToken(token);
  localStorage.setItem('user-token', token);

  const info = await getUserInfo(token);
  if(!info){ logout(); }

  setUserName(info.sdr_name);
  localStorage.setItem('user-name', info.sdr_name);
  setUserEmail(info.sdr_email);
  localStorage.setItem('user-email', info.sdr_email);

}

export function logout(noCheck = false){

  const logoutProcess = () => {
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-name');
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


export async function getUserInfo(userToken: string | null) {
  if(userToken === null){ return null; }

  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/client/sdr`,
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

  console.log(res);

  return res.sdr_info;

}