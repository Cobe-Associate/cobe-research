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
        const counts: any = {}
        this.segments.forEach((segment: any) => {
          this.headers.push({
            text: segment.name,
            value: segment.ref.id
          })
          counts[segment.ref.id] = 0
        })
        const answer = this.findAnswer(this.answerRef)
        answer.observers.forEach((observer: any) => {
          observer.segmentIds.forEach((id: string) => {
            counts[id] += 1
          })
        })
        for (const i in counts) {
          if (answer.observers.length === 0) {
            counts[i] = 0 + '%'
          } else {
            counts[i] = Math.floor(counts[i] / answer.observers.length * 100) + '%'
          }
        }
        counts.name = this.$vuetify.lang.t('$vuetify.moderator.freeAnswer')
        counts.all = '100%'
        this.items.push(counts)
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