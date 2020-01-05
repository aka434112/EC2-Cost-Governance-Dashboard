<template>
  <v-container>
    <v-layout row wrap>
        <v-flex xs11 sm7>
          <v-autocomplete v-model="selectedAccount" :items="awsAccessIds" hide-no-data hide-selected label="Lookup an IAM user account" placeholder="Start typing to Search" prepend-icon="mdi-database-search" return-object></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm6>
            <v-card v-show="costUsageLimits.length > 1" class="top-spacing"> 
              <GChart type="BarChart" :data="costUsageLimits" :options="costForCurrentMonthOptions"/>
            </v-card>
        </v-flex>
        <v-flex xs12 sm5 offset-sm1>
            <v-card v-show="costPattern.length > 1" class="top-spacing"> 
              <GChart type="LineChart" :data="costPattern" :options="costPatternChartOptions"/>
            </v-card>
        </v-flex>
        <v-flex xs12 style="margin-top:1%;">
          <v-data-table
          :headers="awsHeaders"
          :loading="tableLoading"
          :items="ec2Instances"
          no-data-text="Please select an IAM user account"
          class="elevation-1 top-spacing"
          >
              <template v-slot:item="props">
                <tr>
                  <td class="text-xs-left">{{ props.item.InstanceId }}</td>
                  <td class="text-xs-left">{{ props.item.region }}</td>
                  <td class="text-xs-left">{{ props.item.InstanceType }}</td>
                  <td class="text-xs-left">{{ props.item.status.status }}</td>
                  <td class="text-xs-left" v-if="props.item.Tags.length">
                    <br/>
                    <div v-for="Tag in props.item.Tags"><v-chip pill color="primary">{{Tag.Key}} : {{Tag.Value}}</v-chip></div><br/>
                  </td>
                  <td class="text-xs-left" v-else>Not defined</td>
                  <td class="text-xs-centre"><v-btn color="green" class="action" v-if="props.item.status.status === 'stopped'">Start Instance</v-btn><v-btn class="action" v-if="props.item.status.status === 'running'" color="red">Stop Instance</v-btn></td>
                </tr>
              </template>
          </v-data-table>           
        </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import accountsMixin from '../mixins/accounts'
import awsClient from '../rest/awsClient'

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
                },
                {
                    text: 'Region',
                    align: 'left',
                    sortable: false,
                },
                {
                    text: 'Instance Type',
                    align: 'left',
                    sortable: false,
                },
                {
                    text: 'Instance State',
                    align: 'left',
                    sortable: false,
                },
                {
                    text: 'Tags',
                    align: 'left',
                    sortable: false,
                },
                {
                    text: 'Action',
                    align: 'left',
                    sortable: false,                
                }
      ],
      ec2Instances: [],
      monthNames : ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"],
      costPatternChartOptions: {
        title: 'Cost Incurred over the past few months (in USD)',
        titleTextStyle: {
                      fontSize: 16,
                      fontName: 'Montserrat',
        },
        height: 250,
        vAxis: {
          minValue: 0,
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
        title: 'Cost Incurred this month against an Action (in USD)',
        titleTextStyle: {
                      fontSize: 16,
                      fontName: 'Montserrat'
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
          textPosition: 'none',
        },
        hAxis: {
          title: 'Cost Incurred (in USD)',
          titleTextStyle: {
                        fontName: 'Montserrat',
                        italic: false,
                        bold: true
          },
          textStyle: { 
            fontName: 'Montserrat', 
          },  
          viewWindow: {
            min: 0
          }
        },      
        chartArea:{width:'95%'},
        legend: {textStyle: {fontName: 'Montserrat', fontSize: 10}, position: 'top', alignment: 'start' },        
      }
    }
  },
  methods: {
    displayOverlay: function () {
      this.$store.dispatch('toggleOverlay')
    },
    fetchAccountRelatedData: function (accessId) {
      let vm = this
      let budgets = vm.budgetLimitsAccounts[accessId]
      let requestBody = JSON.stringify({"accessId": accessId, "secretKey": vm.secretKeys[accessId]})
      awsClient.getCurrentMonthSpend(requestBody).then(currentCostData => {
          const currentCost = currentCostData.data
          let currentMonth = vm.monthNames[new Date().getMonth()]
          let costsBudgetLimitsAccounts;
          if(budgets["budgetsList"]) {
            costsBudgetLimitsAccounts = [["Month", "Costs Incurred (in USD)"], ["", null]];
            costsBudgetLimitsAccounts.push([currentMonth, parseFloat(currentCost)]);
            budgets["budgetsList"].forEach(budget => {
              costsBudgetLimitsAccounts[0].push("'" + budgets[budget] + "' action limit (in USD)");
              costsBudgetLimitsAccounts[1].push(parseFloat(budget));
              costsBudgetLimitsAccounts[2].push(parseFloat(budget));
            })
            costsBudgetLimitsAccounts.push(costsBudgetLimitsAccounts[1]);
          } else {
              costsBudgetLimitsAccounts = [["Month", "Costs Incurred (in USD)"]];
              costsBudgetLimitsAccounts.push([currentMonth, parseFloat(currentCost)]);
          }
          vm.costUsageLimits = costsBudgetLimitsAccounts;
      })
      awsClient.getSpendPattern(requestBody).then(usagePatternData => {
        const usagePattern = usagePatternData.data
        let incurredCosts = [["Month", "Cost Incurred"]]
        for(let month in usagePattern) {
          incurredCosts.push([month, parseFloat(usagePattern[month])])
        }
        vm.costPattern = incurredCosts
      })
      awsClient.getListOfEc2Instances(requestBody).then(instanceListData => {
        const instanceList = instanceListData.data
        vm.ec2Instances = instanceList
        vm.tableLoading = false
      })
    }
  },
  watch: {
    selectedAccount: function (accessId) {
      accessId = accessId.split("-")[0]
      let vm = this
      vm.tableLoading = true
      vm.costUsageLimits = [];
      vm.costPattern = []
      vm.fetchAccountRelatedData(accessId)
    }
  },
  mixins: [accountsMixin],
  created () {
    let vm = this;
    vm.fetchIamUsers();
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
