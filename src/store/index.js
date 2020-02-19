import Vuex from 'vuex'
import Vue from 'vue'

Vue.use(Vuex)

export default new Vuex.Store ({
    state: {
        displayOverlay: false,
        awsAccessIds: [],
        secretKeys: {},
        budgetLimitsAccounts: {},
        emailIds: {},
        pollingIntervals: {}
    },
    mutations: {
        toggleOverlay: function (state) {
            state.displayOverlay = !state.displayOverlay
        },
        budgetLimitsAccounts: function (state, credentials) {
            state.awsAccessIds = credentials['awsAccessIds']
            state.secretKeys = credentials['secretKeys']
            state.budgetLimitsAccounts = credentials['budgetLimitsAccounts']
            state.emailIds = credentials['emailIds']
            state.pollingIntervals = credentials['pollingIntervals']
        }
    },
    actions: {
        toggleOverlay: function (context) {
            context.commit('toggleOverlay')
        },
        updateAwsAccounts: function (context, credentials) {
            context.commit('budgetLimitsAccounts', credentials)
        }
    },
    getters: {
        displayOverlay: state => state.displayOverlay,
        awsAccessIds: state => state.awsAccessIds,
        secretKeys: state => state.secretKeys,
        budgetLimitsAccounts: state => state.budgetLimitsAccounts,
        emailIds: state => state.emailIds
    }
})
