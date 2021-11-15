<template>
  <v-container>
    <div
      v-for="(answer, i) in answers" :key="i"
      class="ma-4">
      <h3>{{ findQuestion(answer.questionRef).subject }}</h3>
      <small>{{ findQuestion(answer.questionRef).body }}</small>
      <v-row>
        <v-col
          cols=6>
          <h4>分布</h4>
        </v-col>
        <v-col
          cols=6
          class="text-right">
          <span class="font-weight-bold">{{ answer.observers.length }}人</span> <small>/{{ project.participatedObserverRefs.length }}人</small>
        </v-col>
      </v-row>
      <DataSelectGraph
        v-if="answer.type === 'radio' || answer.type === 'checkbox'"
        :answerRef="answer.ref">
      </DataSelectGraph>
      <DataSliderGraph
        v-if="answer.type === 'slider'"
        :answerRef="answer.ref"
        :questionRef="answer.questionRef">
      </DataSliderGraph>
      <DataTextGraph
        v-if="answer.type === 'text'"
        :answerRef="answer.ref"
        :questionRef="answer.questionRef">
      </DataTextGraph>
      <h4>セグメント</h4>
      <DataSegmentSelect
        v-if="answer.type === 'radio' || answer.type === 'checkbox'"
        :answerRef="answer.ref"
        :questionRef="answer.questionRef">
      </DataSegmentSelect>
      <DataSegmentSlider
        v-if="answer.type === 'slider'"
        :answerRef="answer.ref"
        :questionRef="answer.questionRef">
      </DataSegmentSlider>
      <DataSegmentText
        v-if="answer.type === 'text'"
        :answerRef="answer.ref"
        :questionRef="answer.questionRef">
      </DataSegmentText>
      <h4>フリーアンサー</h4>
      <v-row
        v-for="(text, i) in answer.texts" :key="i"
        class="my-2 ma-0"
        style="background-color:#EEEEEE">
        <v-col>
          <v-icon>mdi-message</v-icon>
          {{ text.text }}
        </v-col>
      </v-row>
      <v-divider
        class="my-8">
      </v-divider>
    </div>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters } from 'vuex'
  import DataSelectGraph from '@/components/data/SelectGraph.vue'
  import DataSliderGraph from '@/components/data/SliderGraph.vue'
  import DataTextGraph from '@/components/data/TextGraph.vue'
  import DataSegmentSelect from '@/components/data/SegmentSelect.vue'
  import DataSegmentSlider from '@/components/data/SegmentSlider.vue'
  import DataSegmentText from '@/components/data/SegmentText.vue'

  export default Vue.extend({
    components: {
      DataSelectGraph,
      DataSliderGraph,
      DataTextGraph,
      DataSegmentSelect,
      DataSegmentSlider,
      DataSegmentText,
    },
    props: [
      'projectRef'
    ],
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers', 'findAnswer']),
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
    }
  })
</script>