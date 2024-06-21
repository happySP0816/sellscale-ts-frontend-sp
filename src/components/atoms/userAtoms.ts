import { emailSequencesDataType, linkedinSequencesDataType } from "@pages/CampaignV2/Sequences";
import { atom } from "recoil";
import { ClientSDR } from "src";
import { Contact } from "src/components/pages/CampaignV2/ContactsInfiniteScroll";

const userTokenState = atom({
  key: "user-token",
  default: localStorage.getItem("user-token") || "",
});

const userDataState = atom({
  key: "user-data",
  default: (JSON.parse(localStorage.getItem("user-data") ?? "{}") || {}) as ClientSDR,
});

const campaignContactsState = atom({
  key: "user-contacts",
  default: (JSON.parse(localStorage.getItem("userContacts") ?? "{}") || {}) as Contact[],
});

const linkedinSequenceState = atom({
  key: "linkedin-sequence",
  default: (JSON.parse(localStorage.getItem("linkedin-sequence") ?? "{}") || {}) as linkedinSequencesDataType,
});

const emailSequenceState = atom({
  key: "email-sequence",
  default: (JSON.parse(localStorage.getItem("email-sequence") ?? "{}") || {}) as emailSequencesDataType,
});

const adminDataState = atom({
  key: "admin-data",
  default: (JSON.parse(localStorage.getItem("admin-data") ?? "{}") || {}) as ClientSDR | null,
});

export { userTokenState, userDataState, adminDataState, campaignContactsState, linkedinSequenceState, emailSequenceState };
