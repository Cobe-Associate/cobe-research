<template>
  <div>
    <div
      v-for="(items, i) in segmentItems" :key="i"
      class="mb-4">
      <h4
        class="my-2">
        {{ segmentNames[i] }}
        </h4>
      <v-data-table
        :headers="headers"
        :items="items"
        disable-sort
        hide-default-footer>
      </v-data-table>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters } from 'vuex'

  export default Vue.extend({
    props: [
      'answerRef',
      'questionRef',
    ],
    data: () => ({
      question: {},
      headers: [{
        text: '',
        value: 'questionItem',
      }],
      segmentItems: [],
      segmentNames: [],
    }),
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsSegmentsModule', ['findSegmentById']),
    },
    methods: {
      updateAnswer() {
        const answer = this.findAnswer(this.answerRef)
        const question = this.question as any
        question.answerOptions.forEach((answerOption: string) => {
          this.headers.push({
            text: answerOption,
            value: answerOption
          })
        })
        const segmentItems: any = []
        const segmentNames: any = []
        for (const i in answer.segmentMatrices) {
          const items: any = []
          question.questionItems.forEach((questionItem: string) => {
            const item: any = {
              questionItem: questionItem
            }
            question.answerOptions.forEach((answerOption: string) => {
              if (!answer.segmentMatrices[i][questionItem][answerOption]) {
                item[answerOption] = '0'
              } else {
                item[answerOption] = Math.floor(answer.segmentMatrices[i][questionItem][answerOption] / answer.observers.length * 100) + '% / ' + answer.segmentMatrices[i][questionItem][answerOption] + '人'
              }
            })
            items.push(item)
          })
          segmentItems.push(items)
          this.segmentItems = segmentItems
          segmentNames.push(this.findSegmentById(i).name)
          this.segmentNames = segmentNames
        }
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