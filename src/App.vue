<template>
  <v-app>
    <v-content>
      <v-container>
        <v-layout class="wrap justify-center">
          <v-switch
            label="Change Theme"
            @change="toggleDarkTheme()"
            style="position: absolute; left: 10px;"
          ></v-switch>
          <v-flex class="text-center">
            <h1 class="display-2 font-weight-bold mb-3">
              Poly-Crowdfunding
            </h1>
            <p class="subheading font-weight-regular">
              Utilizing Ethereum for Decentralized Crowdfunding
            </p>
          </v-flex>
        </v-layout>
        
        <v-layout class="wrap justify-center">
          <v-dialog v-model="startProjectDialog" width="auto">
            <template v-slot:activator="{props}">
              <v-btn slot="activator" v-bind="props" class="btn btn-primary">Start a Project</v-btn>
            </template>
            <v-card width="600px">
              <v-card-title class="headline font-weight-bold mt-2 ml-4 text-center">
                <span>Bring your project to life</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-layout class="d-flex flex-column">
                    <v-flex>
                      <v-text-field
                        label="Title"
                        persistent-hint
                        v-model="newProject.title">
                      </v-text-field>
                    </v-flex>
                    <v-flex>
                      <v-textarea
                        label="Description"
                        persistent-hint
                        v-model="newProject.description">
                      </v-textarea>
                    </v-flex>
                    <v-flex>
                      <v-text-field
                        label="Amount Needed (MATIC)"
                        type="number"
                        step="0.0001"
                        min="0"
                        v-model="newProject.amountGoal">
                      </v-text-field>
                    </v-flex>
                    <v-flex>
                      <v-text-field
                        label="Duration (in days)"
                        type="number"
                        v-model="newProject.duration">
                      </v-text-field>
                    </v-flex>
                  </v-layout>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1"
                  flat
                  @click="startProject"
                  :loading="newProject.isLoading">
                  Save
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  flat
                  @click="startProjectDialog = false;
                  newProject.isLoading = false;">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-layout>
      </v-container>

      <v-container>
        <h1 class="display-1 font-weight-bold mb-3">
          Projects
        </h1>
        <v-layout class="d-flex flex-column">
          <v-flex v-for="(project, index) in projectData" :key="index">
            <v-dialog
              v-model="project.dialog"
              width="800px"
            >
              <v-card>
                <v-card-title class="headline font-weight-bold text-center">
                  {{ project.projectTitle }}
                </v-card-title>
                <v-card-text>
                  {{ project.projectDesc }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="blue darken-1"
                    flat="flat"
                    @click="projectData[index].dialog = false"
                  >
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-hover
            v-slot="{ isHovering, props }"
            disabled
            >
              <v-card
                class=" elevation-12 mb-12 "
                :elevation="isHovering ? 10 : 2"
                v-bind="props"
                width="auto"
              >
                <v-card-title primary-title>
                  <div>
                    <div class="headline font-weight-bold">
                      <v-chip
                        label
                        :color="stateMap[project.currentState].color"
                        text-color="white" class="mt-0">
                      {{ stateMap[project.currentState].text }}
                      </v-chip>
                      {{ project.projectTitle }}
                    </div>
                    <br/>
                    <span>{{ project.projectDesc.substring(0, 100) }}</span>
                    <span v-if="project.projectDesc.length > 100">
                      ... <a @click="projectData[index].dialog = true">[Show full]</a>
                    </span>
                    <br/><br/>
                    <small>Up Until: <b>{{ new Date(project.deadline * 1000) }}</b></small>
                    <br/><br/>
                    <small>Goal of <b>{{ project.goalAmount / 10**18 }} MATIC ({{ currentPrice.toFixed(2) * (project.goalAmount / 10**18) }} USD)</b></small>
                    <small v-if="project.currentState == 1">wasn't achieved before deadline</small>
                    <small v-if="project.currentState == 2">has been achieved</small>
                  </div>
                </v-card-title>
                <v-flex
                  v-if="project.currentState == 0 && account != project.projectStarter"
                  class="d-flex ml-3" xs12 sm6 md3>
                  <v-text-field
                    label="Amount (in MATIC)"
                    type="number"
                    step="0.0001"
                    min="0"
                    v-model="project.fundAmount"
                  ></v-text-field>
                  <v-btn
                    class="mt-3"
                    color="light-blue darken-1 white--text"
                    @click="fundProject(index)"
                    :loading="project.isLoading"
                  >
                    Fund
                  </v-btn>
                </v-flex>
                <v-flex class="d-flex ml-3" xs12 sm6 md3>
                  <v-btn
                    class="mt-3"
                    color="amber darken-1 white--text"
                    v-if="project.currentState == 1"
                    @click="getRefund(index)"
                    :loading="project.isLoading"
                  >
                    Get refund
                  </v-btn>
                </v-flex>
                <v-card-actions v-if="project.currentState == 0">
                  <span class="font-weight-bold" style="white-space: nowrap; position: absolute; width: 100%; text-align: center;">
                    {{ project.currentAmount / 10**18 }} MATIC / {{ project.goalAmount / 10**18 }} MATIC
                  </span>
                  <v-progress-linear
                    height="20"
                    :color="stateMap[project.currentState].color"
                    :value="(project.currentAmount / project.goalAmount) * 100"
                  ></v-progress-linear>
                </v-card-actions>
              </v-card>
            </v-hover>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import crowdfundInstance from '../contracts/crowdfundInstance';
import crowdfundProject from '../contracts/crowdfundProjectInstance';
import web3 from '../contracts/web3';

export default {
  name: 'App',
  data() {
    return {
      startProjectDialog: false,
      account: null,
      stateMap: [
        { color: 'primary', text: 'Ongoing' },
        { color: 'warning', text: 'Expired' },
        { color: 'success', text: 'Completed' },
      ],
      projectData: [],
      newProject: { isLoading: false },
      currentPrice: 0,
    };
  },
  mounted() {
    web3.eth.getAccounts().then((accounts) => {
      [this.account] = accounts;
      this.getProjects();
    });
  },
  methods: {
    getProjects() {
      crowdfundInstance.methods.returnAllProjects().call().then((projects) => {
        projects.forEach((projectAddress) => {
          const projectInst = crowdfundProject(projectAddress);
          projectInst.methods.getDetails().call().then((projectData) => {
            const projectInfo = projectData;
            projectInfo.isLoading = false;
            projectInfo.contract = projectInst;
            this.projectData.push(projectInfo);
          });
        });
      });
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd')
          .then((res) => res.json())
          .then((res) => {
            this.currentPrice = res['matic-network'].usd;
      });
    },
    startProject() {
      this.newProject.isLoading = true;
      crowdfundInstance.methods.startProject(
        this.newProject.title,
        this.newProject.description,
        this.newProject.duration,
        web3.utils.toWei(this.newProject.amountGoal, 'ether'),
      ).send({
        from: this.account,
      }).then((res) => {
        const projectInfo = res.events.ProjectStarted.returnValues;
        projectInfo.isLoading = false;
        projectInfo.currentAmount = 0;
        projectInfo.currentState = 0;
        projectInfo.contract = crowdfundProject(projectInfo.contractAddress);
        this.startProjectDialog = false;
        this.newProject = { isLoading: false };
      });
    },
    fundProject(index) {
      if (!this.projectData[index].fundAmount) {
        return;
      }

      const projectContract = this.projectData[index].contract;
      this.projectData[index].isLoading = true;
      projectContract.methods.contribute().send({
        from: this.account,
        value: web3.utils.toWei(this.projectData[index].fundAmount, 'ether'),
      }).then((res) => {
        const newTotal = parseInt(res.events.FundingReceived.returnValues.currentTotal, 10);
        const projectGoal = parseInt(this.projectData[index].goalAmount, 10);
        this.projectData[index].currentAmount = newTotal;
        this.projectData[index].isLoading = false;

        // Set project state to success
        if (newTotal >= projectGoal) {
          this.projectData[index].currentState = 2;
        }
      });
    },
    getRefund(index) {
      this.projectData[index].isLoading = true;
      this.projectData[index].contract.methods.getRefund().send({
        from: this.account,
      }).then(() => {
        this.projectData[index].isLoading = false;
      });
    },
    toggleDarkTheme() {
      this.$vuetify.theme.global.name = this.$vuetify.theme.global.name === 'light' ? 'dark' : 'light';
    },
  },
};

</script>