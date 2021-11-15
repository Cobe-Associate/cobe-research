<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      color="blue-grey darken-4"
      dark>
      <v-btn
        onclick="location.reload()"
        icon>
        <v-img
          class="ma-4"
          :src="require('../../assets/pengin.svg')"/>
      </v-btn>
      <v-toolbar-title>
        {{ project.title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        class="mx-4"
        icon>
        <v-icon>mdi-av-timer</v-icon>
        {{ questionnaireTimerCountupDisplay }}
      </v-btn>
      <v-btn
        class="mx-4"
        icon>
        <v-icon>mdi-account-outline</v-icon>
        {{ project.participatedObserverRefs.length }}
      </v-btn>
      <ExportDataMenu
        v-if="project.status === 'done'"
        :projectRef="projectRef">
      </ExportDataMenu>
      <v-btn
        color="white"
        class="mx-4 primary--text"
        @click="dialog = true">
        アンケートを終了
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="agendaDrawer"
      app
      clipped
      permanent
      right
      width="32%">
      <v-tabs
        grow>
        <v-tab>アジェンダ</v-tab>
        <v-tab>ノート</v-tab>
        <v-tab>データ</v-tab>
        <v-tab-item>
          <QuestionAgenda
            v-if="projectRef"
            :projectRef="projectRef"
            @show-snackbar="showSnackbar">
          </QuestionAgenda>
        </v-tab-item>
        <v-tab-item>
          <QuestionNote
            :projectRef="projectRef">
          </QuestionNote>
        </v-tab-item>
        <v-tab-item>
          <QuestionData
            :projectRef="projectRef">
          </QuestionData>
        </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="newQuestionDrawer"
      fixed
      overflow
      right
      temporary
      width="32%">
      <NewQuestion
        :projectRef="projectRef"
        @draw-new-question="drawNewQuestion"
        @show-snackbar="showSnackbar"></NewQuestion>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="detailDataDrawer"
      fixed
      overflow
      right
      temporary
      width="32%">
      <DetailData
        :projectRef="projectRef"
        @draw-detail-data="drawDetailData">
      </DetailData>
    </v-navigation-drawer>

    <v-main
      style="background: #F5F9FA;">
      <!-- v-if="projectRef" により project 取得後に子コンポーネント ResearchTimelines に projectRef を渡して created() で使える -->
      <ResearchTimelines
        v-if="projectRef"
        :projectRef="projectRef"
        @draw-detail-data="drawDetailData"
        @show-snackbar="showSnackbar">
      </ResearchTimelines>
    </v-main>

    <v-footer
      color="white"
      app
      inset>
      <v-text-field
        v-model="message"
        class="mr-2"
        dense
        hide-details
        outlined
        :disabled="project.status === 'done'">
      </v-text-field>
      <v-btn
        @click="sendMessage"
        color="primary"
        class="mx-2"
        :disabled="project.status === 'done'">
        送信
      </v-btn>
      <v-btn
        @click.stop="newQuestionDrawer = !newQuestionDrawer"
        class="ml-2"
        outlined
        text
        :disabled="project.status === 'done'">
        質問を作成
      </v-btn>
    </v-footer>

    <v-dialog
      v-model="dialog"
      max-width="512">
      <v-card
        align="center">
        <v-card-title>
          <v-row>
            <v-col
              cols=12>
              <v-img
              :src="require('../../assets/finish_questionnaire.svg')"
              max-width="128"/>
            </v-col>
            <v-col
              cols=12>
              アンケートを終了しますか？
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          モデレーターがアンケートを終了すると、すべての参加者もアンケートページから移動します。再度再開する場合は、参加者に再開メールが通知されます。
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="mr-2 mb-4"
            text
            @click="back">
            ホームに戻る
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            class="mr-2 mb-4"
            outlined
            text
            @click="dialog = false">
            閉じる
          </v-btn>
          <v-btn
            class="mr-4 mb-4"
            color="primary"
            @click="finishQuestionnaire">
            終了
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <Snackbar
      ref="snackbarRef">
    </Snackbar>
  </v-app>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import DetailData from '@/components/moderator/DetailData.vue'
  import ExportDataMenu from '@/components/moderator/ExportDataMenu.vue'
  import NewQuestion from '@/components/moderator/NewQuestion.vue'
  import QuestionAgenda from '@/components/moderator/QuestionAgenda.vue'
  import QuestionNote from '@/components/moderator/QuestionNote.vue'
  import QuestionData from '@/components/moderator/QuestionData.vue'
  import ResearchTimelines from '@/components/moderator/ResearchTimelines.vue'
  import Snackbar from '@/components/ui/Snackbar.vue'

  export default Vue.extend({
    components: {
      DetailData,
      ExportDataMenu,
      NewQuestion,
      QuestionAgenda,
      QuestionNote,
      QuestionData,
      ResearchTimelines,
      Snackbar,
    },
    data: () => ({
      message: null,
      newQuestionDrawer: false,
      detailDataDrawer: false,
      agendaDrawer: true,
      projectRef: '',
      dialog: false,
    }),
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('UiQuestionnaireTimerModule', ['questionnaireTimer', 'questionnaireTimerCountupDisplay']),
    },
    methods: {
      ...mapActions('ProjectsAnswersModule', ['listAnswers']),
      ...mapActions('ProjectsProjectModule', ['getProject', 'updateProject', 'subscribeProject']),
      ...mapActions('ProjectsQuestionsModule', ['listQuestions']),
      ...mapActions('ProjectsResearchTimelinesModule', ['createResearchTimeline', 'listResearchTimelines']),
      ...mapActions('ProjectsSegmentsModule', ['listSegments']),
      ...mapActions('UiQuestionnaireTimerModule', ['startTimer']),
      refs(): any {
        return this.$refs
      },
      sendMessage() {
        if (!this.message) return
        this.createResearchTimeline({
          message: this.message,
          projectRef: this.projectRef,
          questionRef: null,
          type: 'message'
        }).then(success => {
          if (!success) {
            this.showSnackbar({
              color: 'error',
              show: true,
              text: 'メッセージを送信できませんでした。'
            })
          } else {
            this.message = null
          }
        })
      },
      back() {
        window.location.href = `/moderator`
      },
      finishQuestionnaire() {
        if (this.project.status === 'done') {
          this.back()
        } else {
          this.updateProject({
            ref: this.projectRef,
            status: 'done',
            timer: parseInt(this.questionnaireTimer.countup)
          })
          .then(() => {
            location.reload()
          })
        }
        this.dialog = true
      },
      startTimerFromReadyAt() {
        this.startTimer({
          countup: (new Date() as any - this.project.readyAt as any) / 1000
        })
      },
      drawNewQuestion() {
        this.newQuestionDrawer = !this.newQuestionDrawer
      },
      drawDetailData() {
        this.detailDataDrawer = !this.detailDataDrawer
      },
      showSnackbar(options: any) {
        this.refs().snackbarRef.showSnackbar(options)
      }
    },
    created() {
      if (!this.$route.query.projectId) {
        this.back()
      }
      this.getProject({
        id: this.$route.query.projectId as string
      })
      .then(project => {
        if (!project) {
          alert('プロジェクトがありません。')
          this.back()
        }
        this.projectRef = project.ref
        this.listAnswers({
          projectRef: this.projectRef
        })
        this.listQuestions({
          projectRef: this.projectRef,
          questionRefs: this.project.questionRefs
        })
        this.listResearchTimelines({
          projectRef: this.projectRef
        })
        this.listSegments({
          projectRef: this.projectRef
        })
        if (project.status !== 'done') {
          this.subscribeProject({
            ref: this.projectRef
          })
          setTimeout(() => {
            if (this.project.readyAt) {
              this.startTimerFromReadyAt()
            } else {
              this.updateProject({
                ref: this.projectRef,
                status: 'ready',
                readyAt: new Date()
              })
              .then(() => {
                this.startTimerFromReadyAt()
              })
            }
          }, 3000)
        }
      })
    },
    watch: {
      project() {
        if (this.project.status === 'done') {
          this.showSnackbar({
            color: 'success',
            show: true,
            timeout: 60000,
            text: 'アンケートは終了しました。データの書き出しは右上の「データの書き出し」からお進みください。'
          })
        }
      }
    }
  })
</script>