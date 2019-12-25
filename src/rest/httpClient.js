import axios from 'axios'

const httpSvc = axios.create({
    //baseURL: process.env.VUE_APP_BASE_URL,
    baseURL: 'http://localhost:3000/api/v1/ec2Instances/',
    crossDomain: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

 export default {
     getListOfEc2Instances: (iamUserCredentials) => httpSvc.post('/', iamUserCredentials),
     getSpendPattern: (iamUserCredentials) => httpSvc.post('/cost/getCostPattern', iamUserCredentials),
     getCurrentMonthSpend: (iamUserCredentials) => httpSvc.post('/cost/getCostCurrentMonth', iamUserCredentials)
 }