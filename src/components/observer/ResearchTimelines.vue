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
        class="text-subtitle-1 font-weight-bold">アンケートが開始されました。<br>最初のメッセージが届くまで、しばらくお待ちください。</p>
      </v-col>
    </v-row>
    <v-row
      v-for="(timeline, i) in researchTimelines"
      :key="i">
      <template
        v-if="timeline.type === 'message'">
        <v-col
          cols=2>
          <v-avatar>
          <img
            :src="moderatorPhotoUrl(timeline.senderId)">
          </v-avatar>
        </v-col>
        <v-col
          cols=10>
          <v-card
            outlined
            style="border-radius:16px;border-color: white;">
            <v-card-text class="secondary--text subtitle-1">
              {{ timeline.message }}
            </v-card-text>
          </v-card>
        </v-col>
      </template>
      <template
        v-if="timeline.type === 'normal' || timeline.type === 'question'">
        <v-col
          cols=2>
          <v-avatar>
          <img
            :src="moderatorPhotoUrl(timeline.senderId)">
          </v-avatar>
        </v-col>
        <v-col
          cols=10>
          <v-card
            outlined
            style="border-radius:16px;border-color: white;">
            <v-card-text class="secondary--text subtitle-1">
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
                :src="file.url + '#t=0.001'"
                :type="file.mimeType">
            </video>
          </div>
        </v-col>
      </template>
      <template v-if="timeline.type === 'answer'">
        <v-col
          cols=2>
        </v-col>
        <v-col
          cols=10>
          <v-card
            v-if="observerAnswerList[timeline.answerRef.id]"
            color="primary"
            class="mb-2"
            outlined
            style="border-radius:16px;">
            <v-card-text
              class="white--text subtitle-1">
              <div
                v-if="observerAnswerList[timeline.answerRef.id].type === 'radio' || observerAnswerList[timeline.answerRef.id].type === 'checkbox'">
                <span
                  v-for="(select, j) in observerAnswerList[timeline.answerRef.id].selects" :key="j">
                  「{{ select }}」&nbsp;
                </span>
              </div>
              <div
                v-else-if="observerAnswerList[timeline.answerRef.id].type === 'slider'">
                <span
                  v-if="observerAnswerList[timeline.answerRef.id].sliderScore">
                  {{ observerAnswerList[timeline.answerRef.id].sliderLabel }}&nbsp;({{ observerAnswerList[timeline.answerRef.id].sliderScore }})
                </span>
                <span
                  v-else>
                  {{ observerAnswerList[timeline.answerRef.id].text }}
                </span>
              </div>
              <span
                v-else-if="observerAnswerList[timeline.answerRef.id].type === 'text'">
                {{ observerAnswerList[timeline.answerRef.id].text }}
              </span>
              <div
                v-else-if="observerAnswerList[timeline.answerRef.id].type === 'matrixRadio' || observerAnswerList[timeline.answerRef.id].type === 'matrixCheckbox'">
                <span
                  v-for="(matrix, questionItem) in observerAnswerList[timeline.answerRef.id].matrices" :key="questionItem">
                  {{ questionItem }}「
                  <span
                    v-for="(answerOption, j) in matrix" :key="j">
                    {{ answerOption }},&nbsp;
                  </span>
                  」&nbsp;
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          v-show="showAnswers[timeline.ref.id] === undefined || showAnswers[timeline.ref.id] === true"
          cols=12
          class="my-4">
          <DataMatrix
            v-if="timeline.answerType === 'matrixRadio' || timeline.answerType === 'matrixCheckbox'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            :showDetailData="false">
          </DataMatrix>
          <DataSelect
            v-if="timeline.answerType === 'radio' || timeline.answerType === 'checkbox'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            :showDetailData="false">
          </DataSelect>
          <DataSlider
            v-if="timeline.answerType === 'slider'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            :showDetailData="false">
          </DataSlider>
          <DataText
            v-if="timeline.answerType === 'text'"
            :answerRef="timeline.answerRef"
            :questionRef="timeline.questionRef"
            :showDetailData="false">
          </DataText>
        </v-col>
      </template>
    </v-row>
    <br
      v-for="n in showSendAnswerSpace" :key="n +'loop'">
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
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
      observerAnswerList: {},
      questionFiles: {},
      showAnswers: {},
      showSendAnswerSpace: 0,
      moderatorPhotoUrls: {},
    }),
    computed: {
      ...mapGetters('ProjectsResearchTimelinesModule', ['lastAnswerOfTimelines']),
      ...mapGetters('ProjectsObserverAnswersModule', ['observerAnswers']),
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsResearchTimelinesModule', ['researchTimelines', 'subscribedResearchTimeline']),
    },
    methods: {
      ...mapActions('ProjectsAnswersModule', ['subscribeAnswer', 'unsubscribeAnswer', 'subscribeLastAnswer']),
      ...mapActions('ProjectsQuestionsModule', ['subscribeLastQuestion']),
      ...mapActions('ProjectsResearchTimelinesModule', ['getResearchTimeline', 'subscribeLastResearchTimeline', 'subscribeResearchTimeline']),
      ...mapActions('StorageQuestionFileModule', ['getQuestionFile']),
      ...mapActions('StorageProfilePhotoModule', ['getProfilePhoto']),
      ...mapActions('UiAnswerTimerModule', ['startTimer']),
      initModeratorPhotoUrls(senderIds: Array<string>) {
        Promise.all(senderIds.map(async senderId => await this.getProfilePhoto({
          name: senderId + '.jpeg'
        })
        .then(url => {
          if (url) {
            Vue.set(this.moderatorPhotoUrls, senderId, url)
          }
        })))
      },
      moderatorPhotoUrl(senderId: string) {
        const urls: any = this.moderatorPhotoUrls
        if (senderId && urls[senderId]) {
          return urls[senderId]
        }
        return require('../../assets/profile_photo.jpg')
      },
      async getFiles(names: Array<string>) {
        const urls: Array<{url: string, type: string, mimeType: string}> = []
        await Promise.all(names.map(async name => await this.getQuestionFile({
          name: name
        }).then(url => {
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
      updateLastAnswer(timeline: any) {
        if (!this.lastAnswerOfTimelines.answerRef) {
          return
        }
        // 回答を監視
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
          })
          // 質問終了後に回答を表示
          // 回答結果が隠れるのでタイムライン表示の位置を調整
          this.$set(this.showAnswers, timeline.ref.id, false)
          this.showSendAnswerSpace = 10 + question.answerOptions.length
          setTimeout(() => {
            this.$set(this.showAnswers, timeline.ref.id, true)
            this.showSendAnswerSpace = 0
          }, question.time * 1000)
        })
        // 回答途中での質問終了を監視
        this.subscribeResearchTimeline({
          projectRef: this.projectRef,
          ref: this.lastAnswerOfTimelines.ref
        })
      },
      endAnswerByModerator() {
        if (!this.subscribedResearchTimeline.endOfAnswer) {
          return
        }
        this.$emit('show-snackbar', {
          color: 'success',
          show: true,
          text: 'モデレーターが質問を終了しました。次の質問までしばらくお待ちください。'
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
    watch: {
      researchTimelines() {
        this.updateQuestionFiles()
        const lastTimeline = this.researchTimelines[this.researchTimelines.length - 1]
        if (lastTimeline.type === 'answer') {
          this.updateLastAnswer(lastTimeline)
        }
        this.scrollDown()
      },
      subscribedResearchTimeline() {
        this.endAnswerByModerator()
      },
      observerAnswers() {
        this.observerAnswers.forEach((observerAnswer: any) => {
          this.$set(this.observerAnswerList, observerAnswer.answerRef.id, observerAnswer)
        })
      }
    },
    created() {
      if (!this.projectRef) {
        console.warn('projectRef is null, so failed to subscribe.')
      }
      this.subscribeLastAnswer({
        projectRef: this.projectRef
      })
      this.subscribeLastQuestion({
        projectRef: this.projectRef
      })
      this.subscribeLastResearchTimeline({
        projectRef: this.projectRef
      })
      this.initModeratorPhotoUrls([this.project.moderatorId].concat(this.project.coModeratorIds))
      this.scrollDown()
    }
  })
</script>