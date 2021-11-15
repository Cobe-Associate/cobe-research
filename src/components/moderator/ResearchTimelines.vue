<template>
  <v-container
    :class="{'fill-height': researchTimelines.length === 0}"
    fluid>
    <v-row
      v-if="researchTimelines.length === 0"
      align="center"
      justify="center"
      class="text-center text--secondary">
      <v-col>
      <p
        class="text-subtitle-1 font-weight-bold">メッセージを入力して送信するか、もしくは右のアジェンダから<br>ブロックを送信して調査を始めてください。</p>
      <p
        class="text--secondary text-caption">この文言は参加者には見えません。</p>
      </v-col>
    </v-row>
    <v-row
      v-for="(timeline, i) in researchTimelines"
      :key="i">
      <template v-if="timeline.type === 'message'">
        <v-col
          cols=4>
        </v-col>
        <v-col
          cols=8>
          <v-card
            color="primary"
            outlined
            style="border-radius:16px;">
            <v-card-text class="white--text subtitle-1">
              {{ timeline.message }}
            </v-card-text>
          </v-card>
        </v-col>
      </template>
      <template v-if="timeline.type === 'normal' || timeline.type === 'question'">
        <v-col
          cols=4>
        </v-col>
        <v-col
          cols=8>
          <v-card
            color="primary"
            outlined
            style="border-radius:16px;">
            <v-card-text class="white--text subtitle-1">
              <span v-if="timeline.message">
                {{ timeline.message }}
              </span>
              <span v-if="timeline.questionRef">
                {{ findQuestion(timeline.questionRef).body }}
              </span>
            </v-card-text>
          </v-card>
          <br>
          <div
            v-for="(file, j) in questionFiles[timeline.ref.id]" :key="j"
            class="mx-12 my-2">
            <v-img
              v-if="file.type === 'image'"
              :src="file.url">
            </v-img>
            <video
              v-if="file.type === 'video'"
              controls
              style="max-width: 100%">
              <source
                :src="file.url"
                :type="file.mimeType">
            </video>
          </div>
        </v-col>
      </template>
      <template v-if="timeline.type === 'answer'">
        <v-col
          cols=8>
          <DataSelect
            v-if="timeline.answerType === 'radio' || timeline.answerType === 'checkbox'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            @draw-detail-data="drawDetailData">
          </DataSelect>
          <DataSlider
            v-if="timeline.answerType === 'slider'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            @draw-detail-data="drawDetailData">
          </DataSlider>
          <DataText
            v-if="timeline.answerType === 'text'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            @draw-detail-data="drawDetailData">
          </DataText>
          <DataMatrix
            v-if="timeline.answerType === 'matrixRadio' || timeline.answerType === 'matrixCheckbox'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            @draw-detail-data="drawDetailData">
          </DataMatrix>
        </v-col>
        <v-col
          cols=4>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import firebase from '@/firebase'
  import DataMatrix from '@/components/data/Matrix.vue'
  import DataSelect from '@/components/data/Select.vue'
  import DataSlider from '@/components/data/Slider.vue'
  import DataText from '@/components/data/Text.vue'
  import { getFileMeta } from '@/utils/file-meta'

  export default Vue.extend({
    components: {
      DataMatrix,
      DataSelect,
      DataSlider,
      DataText,
    },
    props: [
      'projectRef'
    ],
    data: () => ({
      questionFiles: {},
    }),
    computed: {
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsResearchTimelinesModule', ['researchTimelines', 'lastAnswerOfTimelines', 'subscribedResearchTimeline']),
    },
    methods: {
      ...mapActions('ProjectsAnswersModule', ['subscribeAnswer', 'unsubscribeAnswer', 'subscribeLastAnswer']),
      ...mapActions('ProjectsResearchTimelinesModule', ['subscribeLastResearchTimeline', 'subscribeResearchTimeline']),
      ...mapActions('StorageQuestionFileModule', ['getQuestionFile']),
      ...mapActions('UiAnswerTimerModule', ['startTimer']),
      drawDetailData() {
        this.$emit('draw-detail-data')
      },
      async getFiles(names: Array<string>) {
        const urls: Array<{url: string, type: string, mimeType: string}> = []
        await Promise.all(names.map(async name => await this.getQuestionFile({
          name: name
        }).then((url: string) => {
          const fileMeta = getFileMeta(name)
          if (fileMeta && url) {
            urls.push({
              url: url,
              type: fileMeta.type,
              mimeType: fileMeta.mimeType,
            })
          }
        })))
        return urls
      },
      updateQuestionFiles() {
        for (const i in this.researchTimelines) {
          const questionFiles: any = this.questionFiles
          if (!(this.researchTimelines[i].ref.id in this.questionFiles) && (this.researchTimelines[i].type === 'normal' || this.researchTimelines[i].type === 'question')) {
            questionFiles[this.researchTimelines[i].ref.id] = []
            const question = this.findQuestion(this.researchTimelines[i].questionRef)
            if (question) {
              this.getFiles(question.files)
              .then(urls => {
                questionFiles[this.researchTimelines[i].ref.id] = urls
                this.questionFiles = Object.assign({}, questionFiles)
              })
            }
          } else {
            questionFiles[this.researchTimelines[i].ref.id] = []
            this.questionFiles = questionFiles
          }
        }
      },
      updateLastAnswerForCoModerators(timeline: any) {
        if (!this.lastAnswerOfTimelines.answerRef) {
          return
        }
        this.subscribeAnswer({
          projectRef: this.projectRef,
          ref: this.lastAnswerOfTimelines.answerRef
        }).then((unsubscribe: any) => {
          const question = this.findQuestion(timeline.questionRef)
          this.startTimer({
            answerId: timeline.answerRef.id,
            countdown: question.time
          })
          .then(() => {
            this.unsubscribeAnswer(unsubscribe)
            this.$emit('show-snackbar', {
              color: 'success',
              show: true,
              text: '共同モデレーターによる質問が終了しました。'
            })
          })
          // 回答待ちの通知を表示
          this.$emit('show-snackbar', {
            color: 'success',
            show: true,
            text: '「'+ question.subject +'」を共同モデレーターが質問中です。',
            timeout: question.time * 1000
          })
        })
        // 回答途中での質問終了を監視
        this.subscribeResearchTimeline({
          projectRef: this.projectRef,
          ref: this.lastAnswerOfTimelines.ref
        })
      },
      endAnswerByCoModerator() {
        if (!this.subscribedResearchTimeline.endOfAnswer) {
          return
        }
        this.$emit('show-snackbar', {
          color: 'success',
          show: true,
          text: '共同モデレーターが質問を終了しました。'
        })
        setTimeout(() => {
          location.reload()
        }, 5000)
      },
      scrollDown() {
        setTimeout(() => {
          this.$vuetify.goTo(document.body.scrollHeight)
        }, 1)
      }
    },
    created() {
      if (!this.projectRef) {
        console.warn('projectRef is null, so failed to subscribe.')
      }
      this.subscribeLastAnswer({
        projectRef: this.projectRef
      })
      this.subscribeLastResearchTimeline({
        projectRef: this.projectRef
      })
    },
    watch: {
      researchTimelines() {
        this.updateQuestionFiles()
        this.scrollDown()
        // 共同モデレーターの場合、タイムラインや回答を監視
        const lastTimeline = this.researchTimelines[this.researchTimelines.length - 1]
        if (lastTimeline.senderId !== (firebase.auth().currentUser || {}).uid && lastTimeline.type === 'answer') {
          this.updateLastAnswerForCoModerators(lastTimeline)
        }
      },
      subscribedResearchTimeline() {
        this.endAnswerByCoModerator()
      },
    },
  })
</script>