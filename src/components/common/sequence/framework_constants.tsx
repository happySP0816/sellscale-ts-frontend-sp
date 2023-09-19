export const BUMP_FRAMEWORK_OPTIONS: any = {
    'role-have-to-do-with': {
        "name": "Does your role have to do with?",
        "raw_prompt": "Hi {{first_name}}, I’m {{sdr_name}} from {{company_name}}. I’m reaching out because I noticed you’re a {{role}} at {{company_name}}. I’m curious, does your role have anything to do with {{What do you want their role to have to do with?}}?",
        "human_readable_prompt": "1. Introduce yourself\n2. Mention their role\n3. Ask about their role in the company",
        "context_question": "What do you want their role to have to do with?\nAnswer: _________________",
        "length": 'MEDIUM'
    },
    'short-introduction': {
        "name": "Short Introduction",
        "raw_prompt": "Hi {{first_name}}, I’m {{sdr_name}} from {{company_name}}. Great to connect with you",
        "human_readable_prompt": "1. Introduce yourself\n2. Mention how it's great to connect with them",
        "context_question": null,
        "length": 'SHORT'
    }
}