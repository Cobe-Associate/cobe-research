<template>
  <div>
    <v-row>
      <v-col
        cols=6>
        フリーアンサー
      </v-col>
      <v-col
        cols=6
        class="text-right">
        <span class="font-weight-bold">{{ Math.floor(answer.observers.length / answer.observers.length * 100) }}%</span> / {{ answer.observers.length }}人投票
      </v-col>
      <v-progress-linear
        background-color="grey lighten-3"
        color="success"
        height="8"
        :value="Math.floor(answer.observers.length / answer.observers.length * 100)"
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
      'questionRef',
      'answerRef'
    ],
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
    },
    data: () => ({
      answer: {},
    }),
    methods: {
      updateAnswer() {
        this.answer = this.findAnswer(this.answerRef)
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