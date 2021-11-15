<template>
	<v-container
		v-if="detailData.answerRef && detailData.questionRef">
		<v-row>
			<v-col
				cols=8>
				<h3>{{ question.subject }}</h3>
			</v-col>
			<v-col
				cols=4
				class="text-right">
				<v-btn
					@click="$emit('draw-detail-data')"
					class="mx-2"
					outlined
					text>
					閉じる
				</v-btn>
			</v-col>
		</v-row>
    <v-row>
      <v-col
        cols=6>
        <h4>セグメント</h4>
      </v-col>
      <v-col
        cols=6>
      </v-col>
      <v-col>
        <DataSegmentMatrix
          v-if="answer.type === 'matrixRadio' || answer.type === 'matrixCheckbox'"
          :answerRef="detailData.answerRef"
          :questionRef="detailData.questionRef">
        </DataSegmentMatrix>
        <DataSegmentSelect
          v-if="answer.type === 'radio' || answer.type === 'checkbox'"
          :answerRef="detailData.answerRef"
          :questionRef="detailData.questionRef">
        </DataSegmentSelect>
        <DataSegmentSlider
          v-if="answer.type === 'slider'"
          :answerRef="detailData.answerRef"
          :questionRef="detailData.questionRef">
        </DataSegmentSlider>
        <DataSegmentText
          v-if="answer.type === 'text'"
          :answerRef="detailData.answerRef"
          :questionRef="detailData.questionRef">
        </DataSegmentText>
      </v-col>
    </v-row>
    <br>
    <div
      v-if="answer.texts.length > 0">
      <h4>フリーアンサー</h4>
      <v-row
        v-for="(text, i) in answer.texts" :key="i"
        class="my-2 ma-0"
        style="background-color:#EEEEEE">
        <v-col
          cols=9>
          <v-icon>mdi-message</v-icon>
          {{ text.text }}
        </v-col>
        <v-col
          cols=3
          class="text-right">
          <v-btn
            @click="createNewQuestionFromData(text.text)"
            color="white"
            small
            :disabled="project.status === 'done'">
          質問する</v-btn>
        </v-col>
      </v-row>
    </div>
	</v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import DataSegmentMatrix from '@/components/data/SegmentMatrix.vue'
  import DataSegmentSelect from '@/components/data/SegmentSelect.vue'
  import DataSegmentSlider from '@/components/data/SegmentSlider.vue'
  import DataSegmentText from '@/components/data/SegmentText.vue'

  export default Vue.extend({
    components: {
      DataSegmentMatrix,
      DataSegmentSelect,
      DataSegmentSlider,
      DataSegmentText,
    },
    props: [
      'projectRef'
    ],
    data: () => ({
      answer: {},
      question: {},
    }),
    computed: {
      ...mapGetters('UiDetailDataModule', ['detailData']),
      ...mapGetters('ProjectsAnswersModule', ['findAnswer']),
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsSegmentsModule', ['segments']),
    },
    methods: {
      ...mapActions('UiNewQuestionFromDataModule', ['setNewQuestionFromData']),
      updateDetailData() {
        this.answer = this.findAnswer(this.detailData.answerRef)
        this.question = this.findQuestion(this.detailData.questionRef)
      },
      createNewQuestionFromData(body: string) {
        this.setNewQuestionFromData({
          questionRef: this.detailData.questionRef,
          questionBody: body
        })
        this.$emit('draw-detail-data')
      }
    },
    watch: {
      detailData() {
        this.updateDetailData()
      },
    }
  })
</script>