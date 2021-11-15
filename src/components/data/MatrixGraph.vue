<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="items"
      disable-sort
      hide-default-footer>
    </v-data-table>
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
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
    },
    data: () => ({
      answer: {},
      question: {},
      headers: [],
      items: [],
    }),
    methods: {
      updateAnswer() {
        this.answer = this.findAnswer(this.answerRef)
        const answer = this.answer as any
        const question = this.question as any
        const headers: any = [{
          text: '',
          value: 'questionItem',
        }]
        question.answerOptions.forEach((answerOption: string) => {
          headers.push({
            text: answerOption,
            value: answerOption
          })
        })
        this.headers = headers
        const items: any = []
        question.questionItems.forEach((questionItem: string) => {
          const item: any = {
            questionItem: questionItem
          }
          question.answerOptions.forEach((answerOption: string) => {
            if (!answer.matrices[questionItem]) {
              item[answerOption] = '0'
            } else {
              if (!answer.matrices[questionItem][answerOption]) {
                item[answerOption] = '0'
              } else {
                item[answerOption] = Math.floor(answer.matrices[questionItem][answerOption] / answer.observers.length * 100) + '% / ' + answer.matrices[questionItem][answerOption] + '人'
              }
            }
          })
          items.push(item)
          this.items = items
        })
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