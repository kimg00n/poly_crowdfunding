<template>
    <v-app>
      <v-content>
        <v-container>
          <v-layout class="wrap justify-center" style="padding-top:inherit; padding-bottom: inherit;">
            <v-switch
              label="Change Theme"
              @change="toggleDarkTheme()"
              style="position: absolute; left: 10px;"
            ></v-switch>
            <v-switch
              label="Change Language"
              @change="toggleLanguage()"
              style="position: absolute; left: 10px; top: 60px;"
            ></v-switch>
            <v-flex class="text-center">
              <h1 class="display-2 font-weight-bold mb-3">
                {{ isLanguageToggled ? '크라우드펀딩을 통해 듣는 스토리' : 'Crowdfunding gives a story' }}
              </h1>
              <p class="subheading font-weight-regular">
                {{ isLanguageToggled ? '사연을 듣고 펀딩을 해주세요' : 'Please listen to the story and fund it' }}
              </p>
              <v-btn
              v-if="!account"
              class="btn btn-primary"
              @click="connectWallet()"
              style="position: absolute; right: 10px; top: 20px;"
            >
              Connect Wallet
            </v-btn>
            <v-btn
              v-if="account"
              class="btn btn-primary"
              style="position: absolute; right: 10px; top: 20px;"
            >
              {{ account.substring(0, 6) }}...{{ account.substring(account.length - 4) }}
            </v-btn>
            
            </v-flex>
          </v-layout>
          
          <v-layout class="wrap justify-center">
            <v-dialog v-model="startProjectDialog" width="auto">
              <template v-slot:activator="{props}">
                <v-btn slot="activator" v-bind="props" class="btn btn-primary" >{{ isLanguageToggled ? '펀딩 시작하기' : 'Start a Funding' }}</v-btn>
              </template>
              <v-card width="600px">
                <v-card-title class="headline font-weight-bold mt-2 ml-4 text-center">
                  <span>{{ isLanguageToggled ? '펀딩 내용을 작성해주세요' : 'Bring your project to life' }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-layout class="d-flex flex-column">
                      <v-flex>
                        <v-text-field
                          label=Title
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
          <v-tabs v-model="selectedTab" background-color="transparent">
            <v-tab v-for="(tab, index) in tabs" :key="index" @click="changeTab(index)">
              {{ isLanguageToggled ? tab.korean : tab.english }}
            </v-tab>
          </v-tabs>
  
          <h1 class="display-1 font-weight-bold mb-3">
            {{ isLanguageToggled ? '펀딩 목록' : 'Funding Lists' }}
          </h1>
          <v-layout class="d-flex flex-column">
            <v-flex v-for="(project, index) in projectData" :key="index" :style="getCardStyle(project.currentState, project.projectStarter, project)">
              <v-dialog
                v-model="project.dialog"
                width="800px"
              >
                <v-card>
                  <v-card-title class="headline font-weight-bold text-center">
                    {{ project.projectTitle }}
                  </v-card-title>
                  <v-card-text>
                    <div v-html="project.projectDesc"></div>
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
                        <!-- {{ stateMap[project.currentState].text }} -->
                        {{ isLanguageToggled ? stateMap[project.currentState].korean : stateMap[project.currentState].english }}
                        </v-chip>
                        {{ project.projectTitle }}
                      </div>
                      <br/>
                      <span v-if="project.projectDesc.length > 100"><div v-html="project.projectDesc.substring(0, 100)"></div>...</span>
                      <span v-else><div v-html="project.projectDesc"></div></span>
                      <span v-if="project.projectDesc.length > 100">
                        <br/>
                        <v-btn
                          color="blue darken-1"
                          flat="flat"
                          @click="projectData[index].dialog = true"
                        >
                          {{ isLanguageToggled ? '자세히 보기' : 'View Details' }}
                        </v-btn>
                      </span>
                      <br/><br/>
                      <small>{{ isLanguageToggled ? '만료일:' : 'Up until:' }} <b>{{ new Date(project.deadline * 1000).toLocaleString() }}</b></small>
                      <br/><br/>
                      <small>{{ isLanguageToggled ? '목표 금액' : 'Goal of' }} <b>{{ project.goalAmount / 10**18 }} MATIC ({{ currentPrice.toFixed(2) * (project.goalAmount / 10**18) }} USD)</b></small>
                      <small v-if="project.currentState == 1">{{ isLanguageToggled ? "이 만료일 이내에 달성되지 않았습니다." : "wasn't achieved before deadline" }}</small>
                      <small v-if="project.currentState == 2">{{ isLanguageToggled ? '이 달성되었습니다.' : 'has been achieved' }}</small>
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
                    {{ isLanguageToggled ? '펀드' : 'Fund' }}
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
                    {{ isLanguageToggled ? '환불받기' : 'Get refund' }}
                    </v-btn>
                  </v-flex>
                  <v-card-actions v-if="project.currentState == 0">
                    <v-progress-linear
                      height="20"
                      :color="stateMap[project.currentState].color"
                      :model-value="(project.currentAmount / project.goalAmount) * 100"
                    ></v-progress-linear>
                    <span class="font-weight-bold" style="white-space: nowrap; position: absolute; width: 100%; text-align: center;">
                      {{ project.currentAmount / 10**18 }} MATIC / {{ project.goalAmount / 10**18 }} MATIC
                    </span>
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
          { color: 'primary', korean: '진행중', english: 'Ongoing' },
          { color: 'warning', korean: '만료됨', english: 'Expired' },
          { color: 'success', korean: '완료됨', english: 'Completed' },
        ],
        projectData: [],
        newProject: { isLoading: false },
        currentPrice: 0,
        selectedTab: 0,
        isLanguageToggled: false,
        tabs: [
          { korean: '전체 펀딩', english: 'All' },
          { korean: '진행중인 펀딩', english: 'Ongoing' },
          { korean: '만료된 펀딩', english: 'Expired' },
          { korean: '완료된 펀딩', english: 'Completed' },
          { korean: '내가 시작한 펀딩', english: 'Started by me' },
        ],
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
          const projectPromises = projects.map((projectAddress) => {
            const projectInst = crowdfundProject(projectAddress);
            return projectInst.methods.getDetails().call().then((projectData) => {
              const projectInfo = projectData;
              projectInfo.isLoading = false;
              projectInfo.contract = projectInst;
              return projectInfo;
            });
          });
  
          Promise.all(projectPromises).then((projectData) => {
            // Up Until 날짜를 기준으로 프로젝트를 내림차순으로 정렬
            projectData.sort((a, b) => b.deadline - a.deadline);
  
            // 정렬된 프로젝트를 배열에 추가
            this.projectData = projectData;
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
          this.newProject.description.split('\n').join('<br>'),
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
      toggleLanguage() {
        console.log("언어 변경 토글 버튼을 클릭했습니다.");
        this.isLanguageToggled = !this.isLanguageToggled; // 변수 이름 변경
      },
      changeTab(index) {
        this.selectedTab = index;
      },
      getCardStyle(currentState, projectStarter, project) {
        if (this.selectedTab === 0) {
          console.log("전체 펀딩 버튼을 눌렀습니다.");
          console.log(project);
          return 'display:block';
        } else if (this.selectedTab === 1) {
          console.log("진행중인 펀딩 버튼을 눌렀습니다.");
          console.log(currentState)
          if(currentState == 0){
            return 'display:block'
          }else{
            return 'display:none'
          }
          // return currentState === 0 ? 'display:block' : 'display:none';
        } else if (this.selectedTab === 2) {
          console.log("만료된 펀딩 버튼을 눌렀습니다.");
          console.log(currentState)
          if(currentState == 1){
            return 'display:block'
          }else{
            return 'display:none'
          }
          // return currentState === 1 ? 'display:block' : 'display:none';
        } else if (this.selectedTab === 3) {
          console.log("완료된 펀딩 버튼을 눌렀습니다.");
          console.log(currentState)
          if(currentState == 2){
            return 'display:block'
          }else{
            return 'display:none'
          }
          // return currentState === 2 ? 'display:block' : 'display:none';
        } else if (this.selectedTab === 4) {
          console.log("내 펀딩 버튼을 눌렀습니다.");
          console.log(projectStarter)
          if (projectStarter === this.account) {
            return 'display:block';
          } else {
            return 'display:none';
          }
        }
      },
      connectWallet() {
        window.ethereum.enable().then((accounts) => {
          [this.account] = accounts;
        });
      },
    }
  };
  </script>

  