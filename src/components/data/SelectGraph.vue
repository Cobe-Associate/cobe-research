<template>
  <div>
    <v-row
      v-for="(select, i) in selects" :key="i">
      <v-col
        cols=6>
        {{ select.label }}
        <v-img
        v-if="select.count === no1"
        width=20
        class="float-left mx-2"
        :src="require('../../assets/no1.svg')"/>
      </v-col>
      <v-col
        cols=6
        class="text-right">
        <span class="font-weight-bold">{{ Math.floor(select.count / answer.observers.length * 100) }}%</span> / {{ select.count }}人投票
      </v-col>
      <v-progress-linear
        background-color="grey lighten-3"
        color="success"
        height="8"
        :value="Math.floor(select.count / answer.observers.length * 100)"
        rounded
        class="mx-3">
      </v-progress-linear>
      <br>
    </v-row>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters } from 'vuex'

  export default Vue.extend({
    props: [
      'answerRef'
    ],
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
    },
    data: () => ({
      answer: {},
      selects: [],
      no1: 0,
    }),
    methods: {
      updateAnswer() {
        this.answer = this.findAnswer(this.answerRef)
        const answer = this.answer as any
        const selects: any = []
        for (const label in answer.selects) {
          selects.push({
            label: label,
            count: answer.selects[label]
          })
          selects.sort((a: any, b: any) => {
            return (a.count > b.count) ? -1 : 1
          })
        }
        this.selects = selects
        if (selects.length > 0) {
          this.no1 = selects.reduce((a: any, b: any) => a.count > b.count ? a : b).count
        }
      },
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