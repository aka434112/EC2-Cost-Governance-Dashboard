<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs11 sm5 offset-sm1>
          <v-autocomplete v-model="selectedAccount" :items="awsAccessIds" hide-no-data hide-selected label="Lookup an IAM user account" placeholder="Start typing to Search" prepend-icon="mdi-database-search" return-object></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm5 offset-sm1>
            <v-card v-show="costUsageLimits.length > 1" class="top-spacing"> 
              <GChart type="ColumnChart" :data="costUsageLimits" :options="costForCurrentMonthOptions"/>
            </v-card>
        </v-flex>
        <v-flex xs12 sm4 offset-sm1>
            <v-card v-show="costPattern.length > 1" class="top-spacing"> 
              <GChart type="LineChart" :data="costPattern" :options="costPatternChartOptions"/>
            </v-card>
        </v-flex>
        <v-flex xs12 sm10 offset-sm1 style="margin-top:1%;">
          <v-data-table
          :headers="awsHeaders"
          :loading="tableLoading"
          :items="ec2Instances"
          no-data-text="Please select an IAM user account"
          class="elevation-1 top-spacing"
          >
              <template v-slot:items="props">
                  <td class="text-xs-left">{{ props.item.InstanceId }}</td>
                  <td class="text-xs-left">{{ props.item.region }}</td>
                  <td class="text-xs-left">{{ props.item.InstanceType }}</td>
                  <td class="text-xs-left">{{ props.item.status.status }}</td>
                  <td class="text-xs-centre"><v-btn color="green" class="action" v-if="props.item.status.status === 'stopped'">Start Instance</v-btn><v-btn class="action" v-if="props.item.status.status === 'running'" color="red">Stop Instance</v-btn></td>
              </template>
          </v-data-table>           
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import accountsMixin from '../mixins/accounts'

export default {
  name: 'HelloWorld',
  data () {
    return {
      selectedAccount: "",
      costPattern: [],
      seachQuery: "",
      costUsageLimits: [],
      tableLoading: false,
      awsHeaders: [
                {
                    text: 'Instance ID',
                    align: 'left',
                    sortable: false,
                    value: 'name'
                },
                {
                    text: 'Region',
                    align: 'left',
                    sortable: false,
                    value: 'name'
                },
                {
                    text: 'Instance Type',
                    align: 'left',
                    sortable: false,
                    value: 'name'
                },
                {
                    text: 'Instance State',
                    align: 'left',
                    sortable: false,
                    value: 'name'
                },
                {
                    text: 'Action',
                    align: 'centre',
                    sortable: false,
                    value: 'name'                 
                }
      ],
      ec2Instances: [],
      monthNames : ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"],
      costPatternChartOptions: {
        title: 'Costs Incurred over the past few months (in USD)',
        titleTextStyle: {
                      fontSize: 16,
                      fontName: 'Montserrat',
        },
        height: 250,
        vAxis: {
          textStyle: { 
            fontName: 'Montserrat', 
          },
          viewWindow: {
            min: 0
          }
        },
        hAxis: {
          textStyle: { 
            fontName: 'Montserrat', 
          },  
        },
        chartArea:{width:'90%'},
        legend: {textStyle: {fontName: 'Montserrat', fontSize: 14}, position: 'top', alignment: 'start' },
      },
      costForCurrentMonthOptions: {
        title: 'Costs Incurred this month against an Action (in USD)',
        titleTextStyle: {
                      fontSize: 16,
                      fontName: 'Montserrat',
        },
        height: 250,
        series: {
          1: {
            type: 'line'
          },
          2: {
            type: 'line'
          },
          3: {
            type: "line"
          }
        },

        vAxis: {
          textStyle: { 
            fontName: 'Montserrat', 
          },
          viewWindow: {
            min: 0
          }
        },
        hAxis: {
          textStyle: { 
            fontName: 'Montserrat', 
          },  
        },      
        chartArea:{width:'90%'},
        legend: {textStyle: {fontName: 'Montserrat', fontSize: 10}, position: 'top', alignment: 'start' },        
      }
    }
  },
  methods: {
    displayOverlay: function () {
      this.$store.dispatch('toggleOverlay')
    }
  },
  watch: {
    selectedAccount: function (accessId) {
      accessId = accessId.split("-")[0]
      let that = this
      that.tableLoading = true
      let budgets = that.budgetLimitsAccounts[accessId]
      that.costUsageLimits = [];
      that.costPattern = []
      let requestBody = JSON.stringify({"accessId": accessId, "secretKey": that.secretKeys[accessId]})
      fetch("http://localhost:3000/api/v1/ec2Instances/cost/getCostCurrentMonth", {
        method: "POST",
        body: requestBody,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      }).then(response => response.json()).then(currentCost => {
          let currentMonth = that.monthNames[new Date().getMonth()]
          let costsBudgetLimitsAccounts = [["Month", "Costs Incurred (in USD)"], ["", null]];
          costsBudgetLimitsAccounts.push([currentMonth, parseInt(currentCost)])
          budgets["budgetsList"].forEach(budget => {
            costsBudgetLimitsAccounts[0].push("'" + budgets[budget] + "' action limit (in USD)")
            costsBudgetLimitsAccounts[1].push(parseInt(budget))
            costsBudgetLimitsAccounts[2].push(parseInt(budget))
          })
          costsBudgetLimitsAccounts.push(costsBudgetLimitsAccounts[1])
          that.costUsageLimits = costsBudgetLimitsAccounts
          console.log(that.costUsageLimits)
      })
      fetch("http://localhost:3000/api/v1/ec2Instances/cost/getCostPattern", {
        method: "POST",
        body: requestBody,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      }).then(response => response.json()).then(usagePattern => {
        let incurredCosts = [["Month", "Cost Incurred"]]
        for(let month in usagePattern) {
          incurredCosts.push([month, parseInt(usagePattern[month])])
        }
        that.costPattern = incurredCosts
      })
      fetch('http://localhost:3000/api/v1/ec2Instances', {
        method: "POST",
        body: requestBody,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      }).then(response => {
        if (response.status === 200) {
          return response.json()
        }
      }).then(instanceList => {
        that.ec2Instances = instanceList
        that.tableLoading = false
      })
    }
  },
  mixins: [accountsMixin],
  created () {
    let that = this
    that.getAwsAccounts()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.top-spacing {
  margin-top: 15px;
}
#searchResults {
  z-index: 10;
  width: 40vw;
  position: fixed;
  font-size: 16px;
  min-height: 160px;
  max-height: 160px;
  overflow-x: hidden;
  overflow-y: scroll;
  box-shadow: 0 1px 5px 0 black;
}
#searchResult {
  padding: 2%;
  cursor: pointer;
}
#searchResult:hover {
  background: rgba(0, 0, 0, 0.7);
  color: white;
}
#searchResults {
  display: none;
}
@media screen and (max-width: 768px) {
  #searchResults {
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
  }
}
</style>
