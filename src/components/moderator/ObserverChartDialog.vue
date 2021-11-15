<template>
  <v-dialog
    v-model="dialog"
    max-width="1024">
    <v-card>
      <v-card-title>
        参加者の基本情報
        <v-spacer></v-spacer>
        {{ project.participatedObserverRefs.length }}人 <small> / {{ project.invitedObserverEmails.length }}人</small>
      </v-card-title>
      <v-card-subtitle>アンケート開始前に基本情報を入力した参加者の年齢、性別です。セグメントの把握、参加者追加のご判断にお役立てください。</v-card-subtitle>
      <v-card-text>
        <v-row>
          <v-col
            cols="6">
            <h3>年齢</h3>
            <DoughnutChart
              v-if="showChart"
              :data="ageChartData"
              class="mx-12">
            </DoughnutChart>
          </v-col>
          <v-col
            cols="6">
            <h3>性別</h3>
            <DoughnutChart
              v-if="showChart"
              :data="genderChartData"
              class="mx-12">
            </DoughnutChart>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click="dialog = false"
          outlined
          text>
          閉じる
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapActions } from 'vuex'
  import DoughnutChart from '@/components/ui/DoughnutChart.vue'

  export default Vue.extend({
    components: {
      DoughnutChart,
    },
    data: () => ({
      ageChartData: {},
      genderChartData: {},
      project: {
        ref: null,
        invitedObserverEmails: [],
        participatedObserverRefs: [],
      },
      showChart: false,
      dialog: false,
    }),
    computed: {
    },
    methods: {
      ...mapActions('ProjectsObserverModule', ['findObservers']),
      countAge(ageData: Array<number>, age: number) {
        if (!age) {
          ageData[5] = ageData[5] + 1
        } else if (18 <= age && age <=29) {
          ageData[0] = ageData[0] + 1
        } else if (30 <= age && age <=39) {
          ageData[1] = ageData[1] + 1
        } else if (40 <= age && age <=49) {
          ageData[2] = ageData[2] + 1
        } else if (50 <= age && age <=59) {
          ageData[3] = ageData[3] + 1
        } else if (60 <= age && age <=99) {
          ageData[4] = ageData[4] + 1
        } else {
          ageData[5] = ageData[5] + 1
        }
        return ageData
      },
      countGender(genderData: Array<number>, gender: number) {
        if (!gender) {
          genderData[3] = genderData[3] + 1
        } else if (gender === 1) {
          genderData[0] = genderData[0] + 1
        } else if (gender === 2) {
          genderData[1] = genderData[1] + 1
        } else if (gender === 9) {
          genderData[2] = genderData[2] + 1
        } else {
          genderData[3] = genderData[3] + 1
        }
        return genderData
      },
      initChartData() {
        this.showChart = false
        let ageData: any = [0, 0, 0, 0, 0, 0]
        let genderData: any = [0, 0, 0, 0]
        this.findObservers({
          projectRef: this.project.ref,
        })
        .then(observers => {
          observers.forEach((observer: any) => {
            ageData = this.countAge(ageData, observer.age)
            genderData = this.countGender(genderData, observer.gender)
          })
          this.ageChartData = {
            labels: ['18~29', '30~39', '40~49', '50~59', '60~', 'データなし'],
            datasets: [{
              backgroundColor: ['#90CAF9', '#EF9A9A', '#A5D6A7', '#FFF59D', '#BCAAA4', '#B0BEC5'],
              data: ageData
            }]
          }
          this.genderChartData = {
            labels: ['男性', '女性', 'ノンバイナリー', 'データなし'],
            datasets: [{
              backgroundColor: ['#90CAF9', '#EF9A9A', '#A5D6A7', '#B0BEC5'],
              data: genderData
            }]
          }
          this.showChart = true
        })
      },
      openDialog(project: any) {
        this.project = project
        this.initChartData()
        this.dialog = true
      },
    }
  })
</script>