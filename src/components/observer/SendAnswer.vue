<template>
  <v-container
    v-show="answerTimer.status === 'start'">
    <v-row
      dense>
      <v-col
        cols=10>
        <v-btn
          v-show="question.answerType !== 'text' && question.isFreeAnswer && stepper === 1"
          color="primary"
          text
          @click="stepper = 2;resetForm()">
          フリーテキストで回答
        </v-btn>
        <v-btn
          v-show="stepper === 2"
          color="primary"
          text
          @click="stepper = 1;resetForm()">
          <v-icon>mdi-chevron-left-box</v-icon>戻る
        </v-btn>
      </v-col>
      <v-col
        cols=2>
        <v-progress-circular
          :rotate="-90"
          :size="44"
          :width="4"
          :value="answerTimerCountdownProgress"
          color="primary">
          <small>{{ answerTimerCountdownmmssDisplay }}</small>
        </v-progress-circular>
      </v-col>
      <v-col
        cols=12>
        <v-form ref="answerForm">
          <v-stepper v-model="stepper">
            <v-stepper-content step="1">
              <v-radio-group
                v-if="question.answerType === 'radio'"
                v-model="select"
                class="mx-4">
                <v-radio
                  v-for="option in question.answerOptions"
                  :key="option"
                  :label="`${option}`"
                  :value="option">
                </v-radio>
              </v-radio-group>
              <div
                v-if="question.answerType === 'checkbox'"
                class="ma-4">
                <v-checkbox
                  v-model="selects"
                  v-for="option in question.answerOptions"
                  :key="option"
                  :label="`${option}`"
                  :value="option"
                  hide-details>
                </v-checkbox>
              </div>
              <div
                v-if="question.answerType === 'slider'"
                class="ma-4">
                <v-row
                  dense>
                  <v-col
                    cols=6>
                    {{ question.answerSliderLabel[0] }}
                  </v-col>
                  <v-col
                    class="text-right">
                    {{ question.answerSliderLabel[1] }}
                  </v-col>
                </v-row>
                <v-slider
                  v-model="sliderScoreLabel"
                  step="1"
                  max="10"
                  ticks
                  :tick-labels="sliderScoreLabels">
                </v-slider>
              </div>
              <v-text-field
                v-if="question.answerType === 'text'"
                v-model="text"
                class="mt-2"
                label="テキストで回答"
                outlined>
              </v-text-field>
              <div
                v-if="question.answerType === 'matrixRadio'"
                class="ma-4">
                <v-simple-table>
                  <thead>
                    <tr>
                      <th></th>
                      <th
                        v-for="answerOption in question.answerOptions" :key="answerOption">
                        {{ answerOption }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                      <tr
                        v-for="questionItem in question.questionItems" :key="questionItem">
                        <td>{{ questionItem }}</td>
                        <td
                          v-for="answerOption in question.answerOptions" :key="answerOption">
                          <v-radio-group
                            v-model="matrixRadio[questionItem]">
                            <v-radio
                              :value="answerOption"></v-radio>
                          </v-radio-group>
                        </td>
                      </tr>
                  </tbody>
                </v-simple-table>
              </div>
              <div
                v-if="question.answerType === 'matrixCheckbox'"
                class="ma-4">
                <v-simple-table>
                  <thead>
                    <tr>
                      <th></th>
                      <th
                        v-for="answerOption in question.answerOptions" :key="answerOption">
                        {{ answerOption }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                      <tr
                        v-for="questionItem in question.questionItems" :key="questionItem">
                        <td>{{ questionItem }}</td>
                        <td
                          v-for="answerOption in question.answerOptions" :key="answerOption">
                          <v-checkbox
                            v-model="matrixCheckbox"
                            :value="questionItem + '.' + answerOption">
                          </v-checkbox>
                        </td>
                      </tr>
                  </tbody>
                </v-simple-table>
              </div>
              <v-btn
                @click="sendAnswer"
                block
                color="primary"
                large>
                回答を送信
              </v-btn>
            </v-stepper-content>
            <v-stepper-content step="2">
              <v-text-field
                v-model="text"
                class="mt-2"
                label="フリーテキストで回答"
                outlined>
              </v-text-field>
              <v-btn
                @click="sendAnswer"
                block
                color="primary"
                large>
                回答を送信
              </v-btn>
            </v-stepper-content>
          </v-stepper>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'

  export default Vue.extend({
    props: [
      'observerRef',
      'projectRef'
    ],
    data: () => ({
      question: {
        ref: {id: null},
        answerType: null,
        answerSliderLabel: ['', ''],
        questionItems: [],
      },
      matrixRadio: {},
      matrixCheckbox: [],
      stepper: 1,
      select: null,
      selects: [],
      sliderLabel: null,
      sliderScore: null,
      sliderScoreLabel: 5,
      sliderScoreLabels: [5, 4, 3, 2, 1, 0, 1, 2, 3, 4, 5],
      text: null,
    }),
    computed: {
      ...mapGetters('ProjectsObserverModule', ['observer']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsResearchTimelinesModule', ['lastAnswerOfTimelines']),
      ...mapGetters('ProjectsSegmentsModule', ['segments']),
      ...mapGetters('UiAnswerTimerModule', ['answerTimer', 'answerTimerCountdownmmssDisplay', 'answerTimerCountdownProgress']),
    },
    methods: {
      ...mapActions('ProjectsObserverAnswersModule', ['createObserverAnswer']),
      ...mapActions('UiAnswerTimerModule', ['stopTimer']),
      refs(): any {
        return this.$refs
      },
      resetForm() {
        this.refs().answerForm.reset()
        setTimeout(() => {
          this.matrixRadio = {}
          this.matrixCheckbox = []
          this.select = null
          this.selects = []
          this.sliderLabel = null
          this.sliderScore = null
          this.sliderScoreLabel = 5
          this.text = null
        }, 1)
      },
      segmentRefs() {
        // 回答者が属するセグメントを求める
        const segmentRefs: any = []
        this.segments.forEach((segment: any) => {
          if (this.observer.age && segment.age.length > 0) {
            if (segment.age[0] > this.observer.age || segment.age[1] < this.observer.age) {
              return
            }
          }
          if (this.observer.gender && segment.gender) {
            if (this.observer.gender !== segment.gender) {
              return
            }
          }
          let includesSegment = true
          if (segment.questions.length > 0) {
            for (const i in segment.questions) {
              if (this.question.ref.id === segment.questions[i].ref.id) {
                if (!this.selects.some(value => segment.questions[i].values.includes(value))) {
                  includesSegment = false
                  return
                }
              }
            }
          }
          if (includesSegment) {
            segmentRefs.push(segment.ref)
          }
        })
        return segmentRefs
      },
      sendAnswer() {
        if (!this.refs().answerForm.validate()) {
          return
        }
        const timeline = this.lastAnswerOfTimelines
        let selects: any = []
        const matrices: any = {}
        // 質問が単一選択の場合
        if (this.question.answerType === 'radio') {
          if (this.stepper === 1 && !this.select) {
            this.showWarning()
            return
          }
          if (this.stepper === 2 && !this.text) {
            this.showWarning()
            return
          }
          if (this.select) {
            selects.push(this.select)
          }
          if (this.text) {
            selects.push(this.$vuetify.lang.t('$vuetify.moderator.freeAnswer'))
          }
          this.selects = selects
        // 質問が複数選択の場合
        } else if (this.question.answerType === 'checkbox') {
          selects = this.selects
          if (this.stepper === 1 && selects.length === 0) {
            this.showWarning()
            return
          }
          if (this.stepper === 2 && !this.text) {
            this.showWarning()
            return
          }
          if (this.text) {
            selects.push(this.$vuetify.lang.t('$vuetify.moderator.freeAnswer'))
          }
          this.selects = selects
        // 質問がスライダーの場合
        } else if (this.question.answerType === 'slider') {
          if (this.stepper === 1 && this.sliderScoreLabel === 5) {
            this.showWarning()
            return
          }
          if (this.stepper === 2 && !this.text) {
            this.showWarning()
            return
          }
          this.sliderScore = this.sliderScoreLabels[this.sliderScoreLabel] as any
          if (this.sliderScoreLabel < 5) {
            this.sliderLabel = this.question.answerSliderLabel[0] as any
          } else if (this.sliderScoreLabel === 5) {
            this.sliderScore = null
            this.sliderLabel = null
          } else {
            this.sliderLabel = this.question.answerSliderLabel[1] as any
          }
        // 質問がマトリックス単一選択の場合
        } else if (this.question.answerType === 'matrixRadio') {
          if (this.stepper === 1) {
            for (const i in this.question.questionItems) {
              const answerOption = (this.matrixRadio || {} as any)[this.question.questionItems[i]]
              if (!answerOption) {
                this.showWarning()
                return
              }
              matrices[this.question.questionItems[i]] = [answerOption]
            }
          }
          if (this.stepper === 2 && !this.text) {
            this.showWarning()
            return
          }
        // 質問がマトリックス複数選択の場合
        } else if (this.question.answerType === 'matrixCheckbox') {
          if (this.stepper === 1) {
            this.question.questionItems.forEach((questionItem: string) => {
              matrices[questionItem] = []
            })
            this.matrixCheckbox.forEach((matrix: any) => {
              matrix = matrix.split('.')
              matrices[matrix[0]].push(matrix[1])
            })
            for (const questionItem in matrices) {
              if (matrices[questionItem].length === 0) {
                this.showWarning()
                return
              }
            }
          }
          if (this.stepper === 2 && !this.text) {
            this.showWarning()
            return
          }
        }
        // 回答する
        this.createObserverAnswer({
          answerRef: timeline.answerRef,
          matrices: matrices,
          observerRef: this.observerRef,
          projectRef: this.projectRef,
          segmentRefs: this.segmentRefs(),
          selects: this.selects,
          sliderLabel: this.sliderLabel,
          sliderScore: this.sliderScore,
          text: this.text,
          type: timeline.answerType
        }).then((success) => {
          if (!success) {
            this.$emit('show-snackbar', {
              color: 'error',
              show: true,
              text: '回答を送信できませんでした。'
            })
            return
          }
          this.resetForm()
          this.stepper = 1
          this.stopTimer()
          this.$emit('show-snackbar', {
            color: 'success',
            show: true,
            text: '回答を送信しました。'
          })
        })
      },
      showWarning() {
        this.$emit('show-snackbar', {
          color: 'warning',
          show: true,
          text: '不正な回答です。'
        })
      },
    },
    watch: {
      lastAnswerOfTimelines() {
        this.question = this.findQuestion(this.lastAnswerOfTimelines.questionRef)
      }
    },
  })
</script>