<template>
  <v-card>
    <v-container>
      <v-row>
        <v-col
          cols=6>
          <span
            class="text-subtitle-1 font-weight-bold">
            {{ question.subject }}
          </span>
        </v-col>
        <v-col
          cols=6
          class="text-right">
          <span
            class="font-weight-bold">
            <small>残り</small>&nbsp;
            <span v-if="answerTimer.answerId === answer.ref.id">{{ answerTimerCountdownDisplay }}</span>
            <span v-else>00:00:00</span>
          </span>
          <span class="mx-2"></span>
          <span class="font-weight-bold">{{ answer.observers.length }}人</span> <small>/{{ project.participatedObserverRefs.length }}人</small>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      <DataMatrixGraph
        :answerRef="answerRef"
        :questionRef="questionRef">
      </DataMatrixGraph>
      <v-row
        v-if="showDetailData !== false">
        <v-col
          class="text-right">
          <v-btn
            color="primary"
            outlined
            @click="drawDetailData">
            データ詳細へ
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import DataMatrixGraph from '@/components/data/MatrixGraph.vue'

  export default Vue.extend({
    components: {
      DataMatrixGraph,
    },
    props: [
      'questionRef',
      'answerRef',
      'showDetailData',
    ],
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('UiAnswerTimerModule', ['answerTimer', 'answerTimerCountdownDisplay']),
    },
    data: () => ({
      answer: {},
      question: {},
    }),
    methods: {
      ...mapActions('UiDetailDataModule', ['setDetailData']),
      updateAnswer() {
        this.answer = this.findAnswer(this.answerRef)
      },
      drawDetailData() {
        this.setDetailData({
          answerRef: this.answerRef,
          questionRef: this.questionRef
        })
        this.$emit('draw-detail-data')
      }
    },
    watch: {
      answers() {
        this.updateAnswer()
      }
    },
    created() {
      this.question = this.findQuestion(this.questionRef)
      this.updateAnswer()
    }
  })
</script>