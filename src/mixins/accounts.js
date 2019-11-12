export default {
    methods: {
        getAwsAccounts: function () {
            let awsAccessIds = []
            let emailIds = {}
            let secretKeys = {}
            let budgetLimitsAccounts = {}
            let credentials = {}
            fetch('http://localhost:3000/credentials/AWS/getAccounts').then(accountsResponse => accountsResponse.json()).then(accountsResponse => {
                let accessId = ''
                accountsResponse.forEach(account => {
                  accessId = account['accessId'] 
                  awsAccessIds.push(accessId + '-' + account['aliasName'])
                  secretKeys[accessId] = account['secretKey']
                  budgetLimitsAccounts[accessId] = account['budgets']
                  emailIds[accessId] = account['email']
                })
            })
            credentials['awsAccessIds'] = awsAccessIds
            credentials['secretKeys'] = secretKeys
            credentials['budgetLimitsAccounts'] = budgetLimitsAccounts
            credentials['emailIds'] = emailIds
            this.$store.dispatch('updateAwsAccounts', credentials)
        }
    },
    computed: {
        awsAccessIds () {
          return this.$store.getters.awsAccessIds
        },
        secretKeys () {
          return this.$store.state.secretKeys
        },
        budgetLimitsAccounts () {
          return this.$store.state.budgetLimitsAccounts
        },
        emailIds () {
          return this.$store.getters.emailIds
        }
    }
}