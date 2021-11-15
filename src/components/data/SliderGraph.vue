<template>
  <div>
    <span
      class="font-weight-bold mx-3">
      {{ question.answerSliderLabel[0] }}
    </span>
    <v-row
      v-for="(item, i) in summary" :key="i"
      no-gutters
      align="center">
      <v-col
        cols=9>
        <v-progress-linear
          background-color="grey lighten-5"
          :color="item.label === question.answerSliderLabel[0] ? 'success' : 'success'"
          height="8"
          :value="Math.floor(item.count / maxCount * 100) || 0"
          rounded
          class="mx-3">
        </v-progress-linear>
      </v-col>
      <v-col
        cols=3
        class="text-right">
        <span
          class="font-weight-bold">
          {{ item.proportion }}%
        </span> / {{ item.count }}人
      </v-col>
    </v-row>
    <span
      class="font-weight-bold mx-3">
      {{ question.answerSliderLabel[1] }}
    </span>
    <!-- <v-row>
      <v-col
        cols=6>
        <span
          class="font-weight-bold">
          {{ summary[0].label }}
        </span>
      </v-col>
      <v-col
        cols=6
        class="text-right">
        <span
          class="font-weight-bold">
          {{ summary[1].label }}
        </span>
      </v-col>
      <v-progress-linear
        background-color="grey lighten-3"
        color="primary"
        height="8"
        :value="summary[0].proportion"
        rounded
        class="mx-3">
      </v-progress-linear>
      <v-col
        cols=6>
        <span
          class="font-weight-bold">
          {{ summary[0].proportion }}%</span> / {{ summary[0].count }}人
      </v-col>
      <v-col
        cols=6
        class="text-right">
        <span
          class="font-weight-bold">
          {{ summary[1].proportion }}%</span> / {{ summary[1].count }}人
      </v-col>
    </v-row> -->
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters } from 'vuex'

  export default Vue.extend({
    props: [
      'questionRef',
      'answerRef'
    ],
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
    },
    data: () => ({
      question: {},
      answer: {},
      summary: [{
        label: '',
        count: 0,
        score: 0,
        proportion: 0,
      }],
      maxCount: 0,
    }),
    methods: {
      updateAnswer() {
        this.answer = this.findAnswer(this.answerRef)
        const answer = this.answer as any
        const question = this.question as any
        this.summary = []
        this.maxCount = 0
        const scores = [[5, 4, 3, 2, 1], [1, 2, 3, 4, 5]]
        question.answerSliderLabel.forEach((label: string, i: number) => {
          scores[i].forEach(score => {
            const count = (answer.sliders[label] || {})[score]
            if (count) {
              const proportion = Math.floor(count / answer.observers.length * 100) || 0
              if (Number(count) > this.maxCount) {
                this.maxCount = Number(count)
              }
              this.summary.push({
                label: label,
                count: Number(count),
                score: score,
                proportion: proportion
              })
            } else {
              this.summary.push({
                label: label,
                count: 0,
                score: score,
                proportion: 0
              })
            }
          })
        })
        // question.answerSliderLabel.forEach((label: string) => {
        //   let count = 0
        //   if (answer.sliders[label]) {
        //     for (const score in answer.sliders[label]) {
        //       count += answer.sliders[label][score]
        //     }
        //   }
        //   const proportion = Math.floor(count / this.numberOfAnswers * 100) || 0
        //   this.summary.push({
        //     label: label,
        //     count: count,
        //     proportion: proportion
        //   })
        // })
      },
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