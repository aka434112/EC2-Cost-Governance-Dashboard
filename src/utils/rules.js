const rules = {
    'emailRules': [
    v => !!v || 'E-mail is required',
    v => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ],
    'nameRules': [
    v => !!v || 'Alias Name is required'
    ],
    'accessIdRules': [
    v => !!v || 'Access ID is required',
    v => new RegExp("AKIA[0-9A-Z]{16}").test(v) || 'Access ID is not valid'
    ],
    'secretKeyRules': [
    v => !!v || 'Secret Key is required',
    v => new RegExp("[0-9a-zA-Z/+]{40}").test(v) || 'Secret Key is not valid'
    ]
}

export default rules
