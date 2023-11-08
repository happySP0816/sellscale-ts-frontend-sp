export default class LinkedinInitialMessageTemplate {
  active: boolean;
  human_readable_prompt: string;
  id: number;
  labels: string[];
  length: string;
  name: string;
  raw_prompt: string;
  tag: string;
  tone: string;
  transformer_blocklist: any[] | null;

  constructor(data: any) {
    this.active = data.active;
    this.human_readable_prompt = data.human_readable_prompt;
    this.id = data.id;
    this.labels = data.labels;
    this.length = data.length;
    this.name = data.name;
    this.raw_prompt = data.raw_prompt;
    this.tag = data.tag;
    this.tone = data.tone;
    this.transformer_blocklist = data.transformer_blocklist;
  }
}
