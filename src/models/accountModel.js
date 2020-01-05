class Account {
    constructor (accessId, secretKey, aliasName, email, budgets) {
        this.accessId = accessId
        this.secretKey = secretKey
        this.aliasName = aliasName
        this.email = email
        this.budgets = budgets
    }

    getAccessId = () => this.accessId
    getSecretKey = () => this.secretKey
    getAliasName = () => this.aliasName
    getEmail = () => this.email
    getBudgets = () => this.budgets

    populateCredentialsFromObj = (credentials) => {
        this.accessId = credentials.accessId
        this.secretKey = credentials.secretKey
        this.budgets = credentials.budgets
        this.email = credentials.email
        this.aliasName = credentials.aliasName
    }
}

export default Account
