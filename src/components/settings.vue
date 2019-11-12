<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs12 sm6>
              <v-dialog v-model="enableBillingCap" v-if="addBillingLimits" persistent max-width="900px">
                <v-card>
                  <v-card-title>
                    <div class="headliner">Set Budget Limits</div>
                  </v-card-title>
                  <v-card-text>
                    <v-container grid-list-md>
                      <v-layout wrap>
                        <v-flex xs12 sm9 class="text-xs-left">
                          <v-text-field label="Budget Limit (in USD)*" type="number" v-model="billingLimit" required></v-text-field>
                          <v-select :items="actions" label="Select an action*" required v-model="action"></v-select>
                          <div v-show="inputsDidNotPassValidation" class="red--text"><v-icon color="red" style="vertical-align:middle">close</v-icon>Please specify a valid budget/action</div>
                          <v-btn color="blue darken-1" text @click="addBudget()">Add Limit</v-btn>
                          <v-btn color="blue darken-1" text @click="resetBudget()">Reset Limits</v-btn>
                          <v-btn color="blue darken-1" text @click="setBudgets()">Save</v-btn>
                          <v-spacer></v-spacer>
                          <v-chip v-for="(action, budget) in budgetObj" v-if="budget !== 'budgetsList'" class="ma-2" color="red" label text-color="white"><v-icon left>attach_money</v-icon>{{budget}}-{{action}}</v-chip>
                        </v-flex>
                        <v-flex xs12>
                          <v-alert style="text-align: justify" class="alert" v-show="action === actionsObj['terminate']" type="warning">When you terminate an EC2 instance, the instance will be shutdown and the virtual machine that was provisioned for you will be permanently taken away and you will no longer be charged for instance usage. Any data that was stored locally on the instance will be lost. Any attached EBS volumes will be detached and deleted</v-alert>
                          <v-alert style="text-align: justify" class="alert" v-show="action === actionsObj['stop']" type="warning">When you stop an EC2 instance, the instance will be shutdown and the virtual machine that was provisioned for you will be permanently taken away and you will no longer be charged for instance usage. The key difference between stopping and terminating an instance is that the attached bootable EBS volume will not be deleted. The data on your EBS volume will remain after stopping while all information on the local (ephemeral) hard drive will be lost as usual. The volume will continue to persist in its availability zone.</v-alert>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card-text>
                </v-card>
              </v-dialog>
            <v-card> 
              <v-card-title>
                <div v-show="addNewUser" class="headliner">ADD A NEW IAM USER</div>
                <div v-show="!addNewUser" class="headliner">DETAILS WITH RESPECT TO IAM USER</div>
              </v-card-title>
              <v-card-text>
                <v-form v-model="formValid" ref="form">
                  <v-flex xs12>
                    <v-text-field v-model="accessId" v-show="editEnabled && addNewUser" @focus="showInfo = true" @blur="showInfo = false" label="Access ID" :rules="formRules['accessIdRules']">
                    </v-text-field>
                    <v-text-field v-model="secretKey" v-show="editEnabled && addNewUser" @focus="showInfo = true" @blur="showInfo = false" label="Secret Key" :rules="formRules['secretKeyRules']">
                    </v-text-field>
                    <v-text-field v-model="aliasName" v-show="editEnabled" label="Alias Name" :rules="formRules['nameRules']">
                    </v-text-field>
                    <v-text-field v-model="aliasName" v-show="!editEnabled" disabled label="Alias Name" :rules="formRules['nameRules']">
                    </v-text-field>
                    <v-text-field v-model="email" v-show="editEnabled" label="Email ID" :rules="formRules['emailRules']">
                    </v-text-field>
                    <v-text-field v-model="email" v-show="!editEnabled" disabled label="Email ID" :rules="formRules['emailRules']">
                    </v-text-field>
                    <v-chip v-show="!editEnabled" v-for="(action, budget) in budgetObj" v-if="budget !== 'budgetsList'" class="ma-2" color="red" label text-color="white"><v-icon left>attach_money</v-icon>{{budget}}-{{action}}</v-chip>
                  </v-flex>
                  <v-alert v-show="showInfo" class="alert" type="info">Please specify IAM credentials with respect to a user who has access to the AWS Billing and Cost Management console. Visit <a style="color:white" href="https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/grantaccess.html" target="_blank">AWS</a> for more information</v-alert>
                  <v-flex xs12 class="text-xs-left">
                    <v-flex xs6>
                      <v-switch v-show="editEnabled" v-model="enableBillingCap" class="ma-4" label="Billing limits"></v-switch>
                    </v-flex>
                    <v-btn v-show="budgetList.length && editEnabled" color="warning" @click="editBudget()">Edit Limits</v-btn>
                    <v-btn color="success" @click="saveCredentials()" v-show='editEnabled'>Save Details</v-btn>
                  </v-flex>
                </v-form>
              </v-card-text>
            </v-card>
        </v-flex>
        <v-flex xs12 sm5 offset-sm1>
          <v-card>
            <v-card-title class="headliner">
              LOOKUP DETAILS CONFIGURED FOR A USER
            </v-card-title>
            <v-card-text>
              <v-autocomplete v-model="selectedAccount" :items="awsAccessIds" hide-no-data hide-selected label="Lookup an IAM user account" placeholder="Start typing to Search" append-outer-icon="search" return-object></v-autocomplete>
              <v-btn icon title="Edit Details" @click="editSettingsForExistingUser()"><v-icon>edit</v-icon></v-btn><v-btn @click="deleteUser()" icon title="Delete User"><v-icon>delete</v-icon></v-btn><v-btn icon title="Add User" @click="addUser()"><v-icon>person_add</v-icon></v-btn>
            </v-card-text>
          </v-card>
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import alertMessages from '../utils/alerts'
import formRules from '../utils/rules'
import accountsMixin from '../mixins/accounts'

export default {
    name: 'Settings',
    data: function () {
        return {
            secretKey: "",
            accessId: "",
            selectedAccount: "",
            editEnabled: true,
            addNewUser: true,
            enableBillingCap: false,
            inputsDidNotPassValidation: false,
            billingLimit: 0,
            addBillingLimits: false,
            formValid: true,
            action: "",
            email: "",
            budgetListDisplay: {},
            credentialsObj: {},
            budgetList: [],
            budgetObj: {},
            showInfo: false,
            aliasName: "",
            actions: alertMessages,
            actionsObj: {},
            formRules,
        }
    }, 
    methods: {
        editSettingsForExistingUser: function () {
          let that = this
          that.editEnabled = true
          if(that.budgetList.length)
          that.enableBillingCap = true
        },
        resetBudget: function () {
          let that = this
          that.budgetList = []
          that.budgetObj = {}
          that.inputsDidNotPassValidation = false
        },
        saveCredentials: function () {
          let that = this
          fetch('http://localhost:3000/credentials/AWS/postAccount', { //All the Ajax calls (the fetch API in this case) need to moved to a separate file/module. Refactoring needed here. Probably needs to be re-written making use of async/await to make this block look clean
            method: "POST",
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({"credentials": {"accessId": that.accessId, "secretKey": that.secretKey, "aliasName": that.aliasName, "email": that.email, "budgets": that.credentialsObj}})
          }).then(postResponse => {
            if (postResponse.status === 201) {
              that.clearCredentials()
            } 
          })
        },
        clearCredentials: function () {
          let that = this
          that.aliasName = ""
          that.secretKey = ""
          that.accessId = ""
          that.email = ""
          that.selectedAccount = ""
          that.enableBillingCap = false
          that.editEnabled = true
          that.addNewUser = true
        },
        setBudgets: function () {
          let that = this
          if(!that.budgetList.length) {
            that.enableBillingCap = false
            return
          }
          that.budgetList.sort((a,b) => {
            return parseInt(b)-parseInt(a);
          }) 
          that.credentialsObj = that.budgetObj
          that.credentialsObj["budgetsList"] = that.budgetList
          that.addBillingLimits = false
        },
        addBudget: function () {
          let that = this
          let billingLimit = that.billingLimit
          if(parseFloat(billingLimit) > 0 && that.action !== ""){
              that.inputsDidNotPassValidation = false
              if(!that.budgetList.includes(billingLimit))
              that.budgetList.push(billingLimit)
              that.budgetObj[billingLimit] = that.action
              that.billingLimit = 0;
              that.action = ""; 
          } else {
            that.inputsDidNotPassValidation = true
          }             
        },
        editBudget: function () {
          let that = this
          that.addBillingLimits = true
        },
        addUser: function () {
          let that = this
          that.clearCredentials()
        },
        deleteUser: function () {

        }
    },
    watch: {
      enableBillingCap: function(billingCap) {
        let that = this
        if(billingCap){
          if(!that.budgetList.length)
          that.addBillingLimits = true
        } else {
          that.budgetObj = {}
          that.budgetList = []
          that.credentialsObj = {}
        }
      },
      selectedAccount: function (accessId) {
        if(accessId !== "") {
          let that = this
          that.editEnabled = false
          that.addNewUser = false
          that.accessId = accessId.split("-")[0]
          that.aliasName = accessId.split('-')[1]
          that.secretKey = that.secretKeys[that.accessId]
          that.email = that.emailIds[that.accessId]
          that.budgetObj = that.budgetLimitsAccounts[that.accessId]
          if(that.budgetObj && Object.keys(that.budgetObj).length) {
            that.budgetList = that.budgetObj.budgetsList
          } else {
            that.budgetList = []
          }
        }
      }
    },
    mixins: [accountsMixin],
    created () {
      let that = this
      that.actionsObj["terminate"] = that.actions[0]
      that.actionsObj["stop"] = that.actions[1]
      that.actions["email"] = that.action[2]
    }
}
</script>

<style scoped>
.fieldPadding {
    padding: 2%;
}
</style>
