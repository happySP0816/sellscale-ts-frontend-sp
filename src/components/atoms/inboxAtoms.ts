import { atom } from 'recoil';
import {
  BumpFramework,
  Channel,
  EmailSequenceStep,
  EmailMessage,
  EmailThread,
  LinkedInMessage,
  ProspectEmail,
  EmailReplyFramework,
} from 'src';

const openedProspectIdState = atom({
  key: 'inbox-opened-prospect-id',
  default: -1,
});
const openedProspectLoadingState = atom({
  key: 'inbox-opened-prospect-loading',
  default: false,
});

const openedProspectListState = atom({
  key: 'inbox-opened-prospect-list',
  default: true,
});

// Hacky solution to temp hiding prospects
const tempHiddenProspectsState = atom({
  key: 'inbox-temp-hidden-prospects',
  default: [] as number[], // ids of prospects that are temp hidden
});

const bumpFrameworkSelectedSubstatusState = atom({
  key: 'inbox-bump-framework-selected-substatus',
  default: undefined as string | undefined,
});

const openedBumpFameworksState = atom({
  key: 'inbox-opened-bump-framework-modal',
  default: false,
});

const fetchingProspectIdState = atom({
  key: 'inbox-fetching-prospect-id',
  default: -1,
});

const nurturingModeState = atom({
  key: 'inbox-nurturing-mode',
  default: false,
});

const mainTabState = atom({
  key: 'inbox-main-tab',
  default: 'manual_bucket',
});

const selectedBumpFrameworkState = atom({
  key: 'inbox-selected-bump-framework',
  default: undefined as BumpFramework | undefined,
});
const allBumpFrameworksState = atom({
  key: 'inbox-all-bump-frameworks',
  default: [] as BumpFramework[] | undefined,
});

const selectedEmailSequenceStepState = atom({
  key: 'inbox-selected-email-bump-framework',
  default: undefined as EmailSequenceStep | undefined,
});
const allEmailSequenceStepsState = atom({
  key: 'inbox-all-email-bump-frameworks',
  default: [] as EmailSequenceStep[] | undefined,
});

const selectedEmailReplyFrameworkState = atom({
  key: 'inbox-selected-email-reply-framework',
  default: undefined as EmailReplyFramework | undefined,
});
const allEmailReplyFrameworksState = atom({
  key: 'inbox-all-email-reply-frameworks',
  default: [] as EmailReplyFramework[] | undefined,
});

const selectedEmailThread = atom({
  key: 'inbox-selected-email-thread',
  default: undefined as EmailThread | undefined,
});

const currentConvoChannelState = atom({
  key: 'inbox-current-convo-channel',
  default: 'LINKEDIN' as Channel,
});
const currentConvoLiMessageState = atom({
  key: 'inbox-current-convo-li-messages',
  default: undefined as LinkedInMessage[] | undefined,
});
const currentConvoEmailMessageState = atom({
  key: 'inbox-current-convo-email-messages',
  default: undefined as EmailMessage[] | undefined,
});

export {
  openedProspectIdState,
  openedProspectLoadingState,
  openedBumpFameworksState,
  nurturingModeState,
  selectedBumpFrameworkState,
  currentConvoChannelState,
  currentConvoLiMessageState,
  currentConvoEmailMessageState,
  fetchingProspectIdState,
  allBumpFrameworksState,
  tempHiddenProspectsState,
  selectedEmailSequenceStepState,
  allEmailSequenceStepsState,
  selectedEmailThread,
  mainTabState,
  bumpFrameworkSelectedSubstatusState,
  selectedEmailReplyFrameworkState,
  allEmailReplyFrameworksState,
  openedProspectListState,
};
