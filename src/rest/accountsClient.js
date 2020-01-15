import axios from 'axios'

const httpSvc = axios.create({
    //baseURL: VUE_APP_ACCOUNTS_CLIENT_BASE_URL,
    baseURL: 'http://localhost:3000/credentials/AWS',
    crossDomain: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

export default {
    fetchIamUsers: async () => {
        let IamUsers = await httpSvc.get('/getAccounts')
        IamUsers = IamUsers.data
        return IamUsers
    },
    AddIamUser: (credentials) => httpSvc.post('/postAccount', credentials),
    postListOfEc2Instances: (details) => httpSvc.post('/postListOfInstances', details)
}