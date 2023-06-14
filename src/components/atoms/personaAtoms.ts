import { ArchetypeCreation } from "@modals/CreatePersonaModal";
import { atom } from "recoil";

const uploadDrawerOpenState = atom({
  key: "persona-upload-drawer-open",
  default: false,
});

const detailsDrawerOpenState = atom({
  key: "persona-details-drawer-open",
  default: false,
});

const currentPersonaIdState = atom({
  key: "persona-current-id",
  default: -1,
});

// NOT USED
const personaCreationState = atom({
  key: "persona-creation-data",
  default: {
    persona: {
      active: true,
      archetype: '',
      client_id: -1,
      client_sdr_id: -1,
      disable_ai_after_prospect_engaged: false,
      filters: null,
      id: -1,
      performance: {
        status_map: {},
        total_prospects: -1,
      },
      transformer_blocklist: null,
      vessel_sequence_id: -1,
      uploads: [],
      icp_matching_prompt: '',
      is_unassigned_contact_archetype: false,
      ctas: [],
  
      fitReason: '',
      contactObjective: '',
      fileJSON: [],
    } as ArchetypeCreation,
    step: 0,
  },
});


export {
  uploadDrawerOpenState,
  detailsDrawerOpenState,
  currentPersonaIdState,
  personaCreationState,
};
