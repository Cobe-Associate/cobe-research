<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      color="white">
      <v-btn icon>
        <v-img
          class="ma-4"
          :src="require('../../assets/logo.svg')"/>
      </v-btn>
      <v-toolbar-title
        v-if="project.status === 'done' || observer.status === 'done'">
        <span class="font-weight-bold">Cobe</span> <span class="primary--text font-weight-bold">Research</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <div
        v-if="(project.status === 'ready') && observer.status === ''">
        <v-btn
          class="mx-4"
          icon>
          <v-icon color="primary">mdi-av-timer</v-icon>
          {{ questionnaireTimerCountupDisplay }}
        </v-btn>
        <v-btn
          class="mx-4"
          icon>
          <v-icon color="primary">mdi-account-outline</v-icon>
          {{ project.participatedObserverRefs.length }}
        </v-btn>
        <v-btn
          color="primary"
          class="mx-4"
          outlined
          @click="dialog = true">
          退出
        </v-btn>
      </div>
    </v-app-bar>

    <v-main
      style="background: #F5F9FA;">
      <ResearchTimelines
        v-if="projectRef && observerRef && project.status === 'ready' && observer.status === ''"
        :projectRef="projectRef"
        @show-snackbar="showSnackbar">
      </ResearchTimelines>
      <v-container
        v-if="project.status === 'new'"
        class="fill-height"
        fluid>
        <v-row
          align="center"
          justify="center"
          class="text-center">
          <v-col
            v-if="is10minAgo">
            <p class="secondary--text">アンケート開始時間は{{ startAt }}です。時間になりましたら、メールでご共有したURLよりご参加ください。</p>
          </v-col>
          <v-col
            v-else>
            <v-progress-circular
              :size="50"
              indeterminate
              color="primary"
              class="mb-4">
            </v-progress-circular>
            <h3>担当者が準備中です。<br>しばらくお待ちください。</h3>
          </v-col>
        </v-row>
      </v-container>
      <v-container
        v-if="project.status === 'done' || observer.status === 'done'"
        class="fill-height"
        fluid>
        <v-row
          align="center"
          justify="center"
          class="text-center">
          <v-col>
            <v-icon
              :size="70"
              color="primary">
              mdi-check-circle
            </v-icon>
            <h3 class="my-4">アンケートのご協力、<br>ありがとうございました。</h3>
            <p class="secondary--text">ページを閉じてください。</p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer
      app
      padless>
      <SendAnswer
        :observerRef="observerRef"
        :projectRef="projectRef"
        @show-snackbar="showSnackbar">
      </SendAnswer>
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
              退出しますか？
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          退出をした場合、アンケートページには再度参加できません。
        </v-card-text>
        <v-card-actions>
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
            退出
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
  import { DateTime } from 'luxon'
  import ResearchTimelines from '@/components/observer/ResearchTimelines.vue'
  import SendAnswer from '@/components/observer/SendAnswer.vue'
  import Snackbar from '@/components/ui/Snackbar.vue'

  export default Vue.extend({
    components: {
      ResearchTimelines,
      SendAnswer,
      Snackbar,
    },
    data: () => ({
      is10minAgo: false,
      startAt: '',
      observerRef: null,
      projectRef: null,
      dialog: false,
    }),
    computed: {
      ...mapGetters('ProjectsObserverModule', ['observer']),
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('UiQuestionnaireTimerModule', ['questionnaireTimer', 'questionnaireTimerCountupDisplay']),
    },
    methods: {
      ...mapActions('ProjectsAnswersModule', ['listAnswers']),
      ...mapActions('ProjectsObserverModule', ['getObserver', 'updateObserver']),
      ...mapActions('ProjectsObserverAnswersModule', ['listObserverAnswers']),
      ...mapActions('ProjectsProjectModule', ['getProject', 'subscribeProject']),
      ...mapActions('ProjectsQuestionsModule', ['listQuestions']),
      ...mapActions('ProjectsResearchTimelinesModule', ['listResearchTimelines']),
      ...mapActions('ProjectsSegmentsModule', ['listSegments']),
      ...mapActions('UiQuestionnaireTimerModule', ['startTimer', 'stopTimer']),
      refs(): any {
        return this.$refs
      },
      async sendmail() {
        const param = {
          url: this.$vuetify.lang.t('$vuetify.sendgrid.url'),
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_SENDGRID_KEY,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            'personalizations': [{
              'to': [{
                'email': this.observer.email
              }],
              'dynamic_template_data': {
                'projectTitle': this.project.title
              }
            }],
            'from': {
              'email': this.$vuetify.lang.t('$vuetify.sendgrid.from.email'),
              'name': this.$vuetify.lang.t('$vuetify.sendgrid.from.name'),
            },
            'template_id': 'd-4624b69b1d924de081f188b29750047a'
          }
        }
        return await fetch(process.env.VUE_APP_FUNCTION_URL + '/sendmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(param)
        })
      },
      finishQuestionnaire() {
        this.updateObserver({
          ref: this.observerRef,
          status: 'done',
        })
        .then(success => {
          if (!success) {
            return
          }
          this.sendmail()
          .finally(() => {
            location.reload()
          })
          this.dialog = false
        })
      },
      showSnackbar(options: any) {
        this.refs().snackbarRef.showSnackbar(options)
      },
      back() {
        window.location.href = `/observer`
      },
    },
    created() {
      if (!this.$route.query.projectId || !this.$route.query.observerId) {
          this.back()
      }
      this.getProject({
        id: this.$route.query.projectId as string
      })
      .then(project => {
        if (!project) {
          alert('プロジェクトがありません')
          this.back()
        }
        this.projectRef = project.ref
        this.listAnswers({
          projectRef: this.projectRef
        })
        this.listQuestions({
          projectRef: this.projectRef,
          questionRefs: project.questionRefs
        })
        this.listResearchTimelines({
          projectRef: this.projectRef
        })
        this.listSegments({
          projectRef: this.projectRef
        })
        this.subscribeProject({
          ref: this.projectRef
        })
        const startAt = DateTime.fromJSDate(this.project.startAt)
        this.is10minAgo = (startAt.minus({minutes: 10}) > DateTime.local())
        this.startAt = startAt.toFormat('MM月dd日 HH時mm分')
      })
      this.getObserver({
        id: this.$route.query.observerId as string
      })
      .then(observer => {
        if (!observer) {
          alert('回答者ではありません')
          this.back()
        }
        this.observerRef = observer.ref
        this.listObserverAnswers({
          observerRef: this.observerRef
        })
      })
    },
    watch: {
      project() {
        if (this.project.status === 'ready' && this.questionnaireTimer.status === 'stop') {
          this.startTimer({
            countup: (new Date() as any - this.project.readyAt as any) / 1000
          })
        } else if (this.project.status === 'done') {
          this.stopTimer()
        }
        if (this.project.status === 'done' && this.observer.status !== 'done') {
          this.finishQuestionnaire()
        }
      },
    }
  })
</script>