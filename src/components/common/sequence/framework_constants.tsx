export const BUMP_FRAMEWORK_OPTIONS: any = {
    'role-have-to-do-with': {
        "name": "Does your role have to do with?",
        "raw_prompt": "Hi {{first_name}}, I’m {{sdr_name}} from {{company_name}}. I’m reaching out because I noticed you’re a {{role}} at {{company_name}}. I’m curious, does your role have anything to do with {{What do you want their role to have to do with?}}?",
        "human_readable_prompt": "Connect with their role and ask them if their role has anything to do with what you want to connect with them on",
        "context_question": "What do you want their role to have to do with?\nAnswer: _________________",
        "length": 'MEDIUM'
    },
    'short-introduction': {
        "name": "Short Introduction",
        "raw_prompt": "Hi {{first_name}}, I’m {{sdr_name}} from {{company_name}}. Great to connect with you",
        "human_readable_prompt": "Simply introduce yourself and mention how it's great to connect with them",
        "context_question": null,
        "length": 'SHORT'
    },
    'pain-points-opener': {
        'name': 'Paint Points Opener',
        'raw_prompt': '1. Thank them for connecting\n2. Connect with their role and any pain points that they have in their role based on what our company does\n3. How is it going with pain points they my face in their role?',
        'human_readable_prompt': 'Tap into a potential pain point that they may have in their role and connect with them on that',
        'context_question': "What pain points would this persona have? (bullet points)\nAnswer: \n- _________________",
        'length': 'MEDIUM'
    }
}