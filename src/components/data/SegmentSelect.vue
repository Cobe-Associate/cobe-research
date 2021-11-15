<template>
  <v-data-table
    :headers="headers"
    :items="items"
    item-key="name"
    hide-default-footer>
  </v-data-table>
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
      headers: [{}],
      items: [{}],
    }),
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsSegmentsModule', ['segments']),
    },
    methods: {
      updateAnswer() {
        this.headers = [{
            text: '',
            align: 'start',
            value: 'name',
          }, {
          text: 'すべて',
          value: 'all'
        }]
        this.items = []
        this.segments.forEach((segment: any) => {
          this.headers.push({
            text: segment.name,
            value: segment.ref.id
          })
        })
        const answer = this.findAnswer(this.answerRef)
        const question = this.findQuestion(this.questionRef)
        const options: Array<string> = question.answerOptions
        const counts: any = {}
        options.push(this.$vuetify.lang.t('$vuetify.moderator.freeAnswer'))
        for (const i in answer.segmentSelects) {
          options.forEach((name: string) => {
            const count = answer.segmentSelects[i][name]
            let proportion = Math.floor(count / answer.segmentObservers[i].length * 100) || 0
            if (!counts[name]) {
              counts[name] = {
                name: name
              }
            }
            counts[name][i] = proportion + '%'
            proportion = Math.floor(answer.selects[name] / answer.observers.length * 100) || 0
            counts[name]['all'] = proportion + '%'
          })
        }
        for (const i in counts) {
          this.items.push(counts[i])
        }
      }
    },
    watch: {
      answers() {
        this.updateAnswer()
      }
    },
    created() {
      this.updateAnswer()
    }
  })
</script>