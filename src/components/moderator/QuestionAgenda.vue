<template>
  <v-container>
    <draggable
      v-model="draggableQuestions"
      draggable=".question">
      <v-row
        v-for="(question, i) in draggableQuestions"
        :key="i"
        class="question">
        <v-col>
          <v-card
            :style="{'background-image': 'url(' + typeNoThumbnail(question.type, i) + ')'}"
            :disabled="!!question.sentAt">
            <v-row>
              <v-col
                cols="1"
                class="px-0">
                <v-row
                  class="fill-height">
                  <v-col></v-col>
                  <v-col
                    class="ml-2">
                    <v-icon>mdi-drag-vertical</v-icon>
                  </v-col>
                  <v-col></v-col>
                 </v-row>
              </v-col>
              <v-col cols="11">
                <v-list-item
                  three-line>
                  <v-list-item-avatar
                    rounded
                    size="40">
                    <v-img
                      :src="typeThumbnail(question.type)">
                    </v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      class="font-weight-bold">
                      {{ question.subject }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ question.body }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-card-actions>
                  <span
                    class="text--secondary mx-2">
                    配分時間
                  </span>
                  <span>
                    {{ sec2min(question.time) }}
                  </span>
                  <v-spacer></v-spacer>
                  <v-tooltip
                    top>
                  <template
                    v-slot:activator="{on, attrs}">
                    <v-btn
                      v-bind="attrs"
                      v-on="on"
                      outlined
                      text>
                      メモ
                    </v-btn>
                  </template>
                  <span>{{ question.note }}</span>
                </v-tooltip>
                  <v-btn
                    @click="sendQuestion(question)"
                    :disabled="project.status === 'done' || answerTimer.status === 'start'"
                    outlined
                    text>
                    送信
                  </v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </draggable>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import draggable from 'vuedraggable'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    components: {
      draggable
    },
    data: () => ({
      //
    }),
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['questions', 'findQuestion']),
      ...mapGetters('UiAnswerTimerModule', ['answerTimer']),
      draggableQuestions: {
        get() {
          return this.questions
        },
        set(questions: any) {
          const that = this as any
          that.changeOrder(questions)
          const questionRefs: Array<any> = []
          questions.forEach((q: any) => {
            questionRefs.push(q.ref)
          })
          that.updateProject({
            ref: this.projectRef,
            questionRefs: questionRefs
          })
        }
      }
    },
    methods: {
      ...mapActions('ProjectsAnswersModule', ['createAnswer', 'subscribeAnswer', 'unsubscribeAnswer']),
      ...mapActions('ProjectsProjectModule', ['updateProject']),
      ...mapActions('ProjectsQuestionsModule', ['updateQuestion', 'changeOrder', 'subscribeLastQuestion']),
      ...mapActions('ProjectsResearchTimelinesModule', ['createResearchTimeline', 'updateResearchTimeline']),
      ...mapActions('UiAnswerTimerModule', ['startTimer']),
      sendQuestion(question: any) {
        const that = this as any
        // 質問済み（sentAt）を更新
        that.updateQuestion({
          projectRef: this.projectRef,
          ref: question.ref,
          sentAt: new Date()
        })
        // タイムラインに質問を投稿
        that.createResearchTimeline({
          message: null,
          projectRef: this.projectRef,
          questionRef: question.ref,
          type: question.type
        })
        // 質問の場合、回答をタイムラインに追加
        if (question.type === 'question') {
          // 空の回答を生成。function で watch するため
          that.createAnswer({
            observers: [],
            projectRef: this.projectRef,
            questionRef: question.ref,
            matrices: {},
            selects: [],
            sliders: [],
            texts: [],
            type: question.answerType
          })
          .then((answer: any) => {
            // タイムラインに回答を投稿
            that.createResearchTimeline({
              answerRef: answer.ref,
              answerType: question.answerType,
              message: null,
              projectRef: this.projectRef,
              questionRef: question.ref,
              type: 'answer'
            })
            .then((researchTimeline: any) => {
              // 回答を監視
              that.subscribeAnswer({
                projectRef: this.projectRef,
                ref: answer.ref
              }).then((unsubscribe: any) => {
                // 回答残り時間を表示
                that.startTimer({
                  answerId: answer.ref.id,
                  countdown: question.time
                })
                .then(() => {
                  // 回答終了後に通知を表示
                  that.unsubscribeAnswer(unsubscribe)
                  this.$emit('show-snackbar', {
                    color: 'success',
                    show: true,
                    text: '質問を終了しました。'
                  })
                })
                // 回答待ちの通知を表示
                this.$emit('show-snackbar', {
                  color: 'success',
                  show: true,
                  text: '「'+ question.subject +'」を質問中です。' + '右の「×」ボタンを押すと途中で質問を終わらせられます。',
                  timeout: question.time * 1000,
                  click: () => {
                    // 質問を途中で終了する場合、endOfAnswer を指定
                    // endOfAnswer の変更を observer 側で監視している
                    that.updateResearchTimeline({
                      ref: researchTimeline.ref,
                      endOfAnswer: true
                    })
                    .then(() => {
                      this.$emit('show-snackbar', {
                        color: 'success',
                        show: true,
                        text: '質問を終了しました。回答者にお知らせしておりますので、しばらくお待ちください。'
                      })
                      setTimeout(() => {
                        location.reload()
                      }, 7000)
                    })
                  }
                })
              })
            })
          })
        }
      },
      typeNoThumbnail(type: string, no: number) {
        no += 1
        if (no > 10) {
          no = 0
        }
        return require('../../assets/question_' + type + '_no/' + no + '.svg')
      },
      typeThumbnail(type: string) {
        return require('../../assets/question_' + type + '.svg')
      },
      sec2min(time: number) {
        let min: string = Math.floor(time / 60).toString() + '分'
        if (time % 60) {
          min += (time % 60).toString() + '秒'
        }
        return min
      }
    },
    created() {
      // 共同モデレータによる質問作成・送信を監視
      (this as any).subscribeLastQuestion({
        projectRef: this.projectRef
      })
    },
    watch: {
      project() {
        // 共同モデレータによる質問並び替えの反映
        const that = this as any
        const questions: any = []
        this.project.questionRefs.forEach((questionRef: any) => {
          questions.push(this.findQuestion(questionRef))
        })
        that.changeOrder(questions)
      }
    }
  })
</script>