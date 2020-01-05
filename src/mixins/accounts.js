import accountsClient from '../rest/accountsClient';
import Account from '../models/accountModel';

export default {
    methods: {
      fetchIamUsers: async function () {
            let awsAccessIds = []
            let emailIds = {}
            let secretKeys = {}
            let budgetLimitsAccounts = {}
            let credentials = {}
            let accountsResponse = await accountsClient.fetchIamUsers();
            let accessId = ''
            accountsResponse.forEach(iamUser => {
              let account = new Account()
              account.populateCredentialsFromObj(iamUser)
              accessId = account.getAccessId()
              awsAccessIds.push(accessId + '-' + account.getAliasName())
              secretKeys[accessId] = account.getSecretKey()
              budgetLimitsAccounts[accessId] = account.getBudgets()
              emailIds[accessId] = account.getEmail()
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