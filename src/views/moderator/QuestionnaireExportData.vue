<template>
  <v-app>
    <v-container
      class="sheets">
      <p><v-btn onclick="window.print()" color="info">ダウンロード</v-btn> をクリックして、「PDFに保存」を指定してください。完了しましたら、ページを閉じてください。</p>
      <div class="sheet">
        <v-row
          style="background: #F5F9FA;">
          <v-col
            cols=6>
            <v-btn icon>
              <v-img
                class="ma-4"
                :src="require('../../assets/logo.svg')"/>
            </v-btn>
            <span class="font-weight-bold">Cobe</span> <span class="primary--text font-weight-bold">Research</span>
          </v-col>
          <v-col
            cols=6
            class="text-right">
            {{ project.startJST }}
          </v-col>
          <v-col
            cols=12
            class="text-center">
            <h2>{{ project.title }}</h2>
          </v-col>
          <v-col
            cols=12
            class="text-center mb-4">
            <v-avatar
              class="mx-2">
              <img
                :src="profile.photoURL">
            </v-avatar>
            <span class="mx-2">{{ profile.displayName }}</span>
          </v-col>
        </v-row>
        <br>
        <v-alert
          text
          color="info">
          基本データ
        </v-alert>
        <v-row>
          <v-col
            cols=2>
            <h4>{{ project.participatedObserverRefs.length }}人</h4>
            <small>参加者</small>
          </v-col>
          <v-col
            cols=3>
            <h4>{{ timerJikan(project.timer) }}</h4>
            <small>実施時間</small>
          </v-col>
          <v-col
            cols=2>
            <h4>{{ questions.length }}件</h4>
            <small>質問数</small>
          </v-col>
        </v-row>
        <v-alert
          text
          color="info">
          回答データ
        </v-alert>
        <div
          v-for="(answer, i) in answers" :key="i">
          <h3>{{ findQuestion(answer.questionRef).subject }}</h3>
          <small>{{ findQuestion(answer.questionRef).body }}</small>
          <v-row>
            <v-col
              :cols="(answer.type === 'matrixRadio' || answer.type === 'matrixCheckbox') ? 12 : 6">
              <v-row>
                <v-col
                  cols=6>
                  <h4>分布</h4>
                </v-col>
                <v-col
                  cols=6
                  class="text-right">
                  <span class="font-weight-bold">{{ answer.observers.length }}人</span> <small>/{{ project.participatedObserverRefs.length }}人</small>
                </v-col>
              </v-row>
              <DataMatrixGraph
                v-if="answer.type === 'matrixRadio' || answer.type === 'matrixCheckbox'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataMatrixGraph>
              <DataSelectGraph
                v-if="answer.type === 'radio' || answer.type === 'checkbox'"
                :answerRef="answer.ref">
              </DataSelectGraph>
              <DataSliderGraph
                v-if="answer.type === 'slider'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataSliderGraph>
              <DataTextGraph
                v-if="answer.type === 'text'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataTextGraph>
              <h4>セグメント</h4>
              <DataSegmentMatrix
                v-if="answer.type === 'matrixRadio' || answer.type === 'matrixCheckbox'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataSegmentMatrix>
              <DataSegmentSelect
                v-if="answer.type === 'radio' || answer.type === 'checkbox'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataSegmentSelect>
              <DataSegmentSlider
                v-if="answer.type === 'slider'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataSegmentSlider>
              <DataSegmentText
                v-if="answer.type === 'text'"
                :answerRef="answer.ref"
                :questionRef="answer.questionRef">
              </DataSegmentText>
            </v-col>
            <v-col
              v-if="answer.texts.length > 0"
              cols=6>
              <h4>フリーアンサー</h4>
              <v-row
                v-for="(text, i) in answer.texts" :key="i"
                class="my-2 ma-0"
                style="background-color:#EEEEEE">
                <v-col>
                  <v-icon>mdi-message</v-icon>
                  {{ text.text }}
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider
            class="my-8">
          </v-divider>
        </div>
      </div>
    </v-container>

    <v-dialog
      v-model="dialog"
      max-width="512">
      <v-card
        align="center">
        <v-progress-circular
          :size="50"
          indeterminate
          color="primary"
          class="ma-8">
        </v-progress-circular>
        <v-card-text>
          回答データのPDFファイルを準備しています。しばらくお待ちください。
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<style lang="scss" scoped>
  .sheet {
    page-break-after: always;
  }

  /* hide in print */
  @media print {
    .sheets > :not(.sheet) {
      display: none;
    }
  }

  /* for preview */
  @media screen {
    .sheet {
      width: 200mm;
      margin: 5mm;
      padding: 5mm;
      background: white;
      box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
    }
  }
</style>

<script lang="ts">
  import Vue from 'vue'
  import { DateTime } from 'luxon'
  import { mapGetters, mapActions } from 'vuex'
  import firebase from '@/firebase'
  import DataMatrixGraph from '@/components/data/MatrixGraph.vue'
  import DataSelectGraph from '@/components/data/SelectGraph.vue'
  import DataSliderGraph from '@/components/data/SliderGraph.vue'
  import DataTextGraph from '@/components/data/TextGraph.vue'
  import DataSegmentMatrix from '@/components/data/SegmentMatrix.vue'
  import DataSegmentSelect from '@/components/data/SegmentSelect.vue'
  import DataSegmentSlider from '@/components/data/SegmentSlider.vue'
  import DataSegmentText from '@/components/data/SegmentText.vue'

  export default Vue.extend({
    components: {
      DataMatrixGraph,
      DataSelectGraph,
      DataSliderGraph,
      DataTextGraph,
      DataSegmentMatrix,
      DataSegmentSelect,
      DataSegmentSlider,
      DataSegmentText,
    },
    data: () => ({
      currentUser: firebase.auth().currentUser,
      projectRef: null,
      profile: {
        displayName: '',
        email: '',
        photoURL: ''
      },
      dialog: true,
    }),
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['questions', 'findQuestion']),
    },
    methods: {
      ...mapActions('ProjectsAnswersModule', ['listAnswers']),
      ...mapActions('ProjectsProjectModule', ['getProject']),
      ...mapActions('ProjectsQuestionsModule', ['listQuestions']),
      ...mapActions('ProjectsSegmentsModule', ['listSegments']),
      ...mapActions('StorageProfilePhotoModule', ['getProfilePhoto']),
      timerJikan(sec: number) {
        return DateTime.fromSeconds(sec, {zone: 'utc'}).toFormat('HH時間mm分ss秒')
      },
      back() {
        window.location.href = `/moderator`
      }
    },
    created() {
      this.getProject({
        id: this.$route.query.projectId as string
      })
      .then(project => {
        if (!project) {
          alert('プロジェクトがありません')
          this.back()
        }
        this.listQuestions({
          projectRef: project.ref,
          questionRefs: this.project.questionRefs
        })
        this.listSegments({
          projectRef: project.ref,
        })
        this.listAnswers({
          projectRef: project.ref,
        })
        document.title = project.title
      })
      if (!this.currentUser || !this.currentUser.providerData[0]) return
      this.profile.email = this.currentUser.providerData[0].email || ''
      this.profile.displayName = this.currentUser.providerData[0].displayName || this.profile.email
      this.profile.photoURL = require('../../assets/profile_photo.jpg')
      if (this.currentUser.providerData[0].photoURL) {
        this.getProfilePhoto({
          name: this.currentUser.uid
        })
        .then(url => {
          this.profile.photoURL = url
        })
      }
    },
    mounted() {
      setTimeout(() => {
        this.dialog = false
      }, 4500)
      setTimeout(() => {
        this.$nextTick(() => {
          window.print()
        })
      }, 5000)
    },
  })
</script>