<template>
  <v-container>
    <v-form ref="newSegmentForm">
      <v-row
        class="ma-0">
        <v-col
         cols=4>
         <h3>
          <span
            v-if="segmentFromNewProject.willUpdate">
            セグメントの編集
          </span>
          <span
            v-else>
            セグメントの作成
          </span>
        </h3>
        </v-col>
        <v-col
          cols=8
          class="text-right">
          <v-btn
            @click="$emit('draw-new-segment')"
            class="mx-4"
            outlined
            text>
            閉じる
          </v-btn>
          <v-btn
            v-if="segmentFromNewProject.willUpdate"
            color="primary"
            @click="editSegment">
            保存
          </v-btn>
          <v-btn
            v-else
            color="primary"
            @click="createNewSegment">
            保存
          </v-btn>
        </v-col>
        <v-col>
          <h3>基本情報</h3>
          <v-divider class="my-4"></v-divider>
          <h4>セグメント名</h4>
          <v-text-field
            v-model="segment.name"
            :rules="[required]"
            filled
          ></v-text-field>
          <h4>年齢</h4>
          <v-radio-group
            v-model="segment.age"
            row>
            <v-radio
              label="18~29"
              value="0">
            </v-radio>
            <v-radio
              label="30~39"
              value="1">
            </v-radio>
            <v-radio
              label="40~49"
              value="2">
            </v-radio>
            <v-radio
              label="50~59"
              value="3">
            </v-radio>
            <v-radio
              label="60~"
              value="4">
            </v-radio>
          </v-radio-group>
          <h4>性別</h4>
          <v-radio-group
            v-model="segment.gender"
            row>
            <v-radio
              label="男性"
              value="1">
            </v-radio>
            <v-radio
              label="女性"
              value="2">
            </v-radio>
            <v-radio
              label="ノンバイナリー"
              value="9">
            </v-radio>
          </v-radio-group>
          <br>
          <h3>回答条件</h3>
          <v-divider class="my-4"></v-divider>
          <div
            v-for="(question, i) in questions" :key="i">
            <div
              v-if="question.answerType === 'radio' || question.answerType === 'checkbox'">
              <h4>{{ question.body }}</h4>
              <v-checkbox
                v-model="segment.questions[question.ref.id]"
                v-for="option in question.answerOptions"
                :key="option"
                :label="`${option}`"
                :value="option"
                hide-details>
              </v-checkbox>
              <br>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    data: () => ({
      segment: {
        ref: null,
        name: null,
        age: null,
        gender: null,
        questions: {},
      },
      required: (v: any) => !!v || '入力してください',
    }),
    computed: {
      ...mapGetters('ProjectsQuestionsModule', ['questions', 'findQuestion', 'findQuestionById']),
      ...mapGetters('ProjectsSegmentsModule', ['findSegment']),
      ...mapGetters('UiSegmentFromNewProjectModule', ['segmentFromNewProject']),
    },
    methods: {
      ...mapActions('ProjectsSegmentsModule', ['createSegment', 'updateSegment']),
      refs(): any {
        return this.$refs
      },
      resetForm() {
        this.refs().newSegmentForm.reset()
        this.segment = {
          ref: null,
          name: null,
          age: null,
          gender: null,
          questions: {},
        }
      },
      mapAge(age: string | null) {
        if (!age) {
          return []
        }
        const map: any = {
          '0': [18, 29],
          '1': [30, 39],
          '2': [40, 49],
          '3': [50, 59],
          '4': [60, 99],
        }
        return map[age]
      },
      mapGender(gender: string | null) {
        if (!gender) {
          return null
        }
        return Number(gender)
      },
      mapQuestions(options: any) {
        const questions = []
        for (const i in options) {
          if (options[i].length > 0) {
            const values: Array<string> = []
            options[i].forEach((option: string) => {
              values.push(option)
            })
            questions.push({
              ref: this.findQuestionById(i).ref,
              values: values
            })
          }
        }
        return questions
      },
      createNewSegment() {
        if (!this.refs().newSegmentForm.validate()) {
          return
        }
        this.createSegment({
          name: this.segment.name,
          age: this.mapAge(this.segment.age),
          gender: this.mapGender(this.segment.gender),
          questions: this.mapQuestions(this.segment.questions),
          projectRef: this.projectRef,
        })
        .then(segment => {
          if (!segment) {
            this.$emit('show-snackbar', {
              color: 'error',
              show: true,
              text: 'セグメントを作成できませんでした。'
            })
            return
          }
          this.resetForm()
          this.$emit('show-snackbar', {
            color: 'success',
            show: true,
            text: 'セグメントを作成しました。'
          })
          this.$emit('draw-new-segment')
        })
      },
      editSegment() {
        if (!this.refs().newSegmentForm.validate()) {
          return
        }
        this.updateSegment({
          ref: this.segment.ref,
          name: this.segment.name,
          age: this.mapAge(this.segment.age),
          gender: this.mapGender(this.segment.gender),
          questions: this.mapQuestions(this.segment.questions),
          projectRef: this.projectRef,
        })
        .then(() => {
          this.resetForm()
          this.$emit('show-snackbar', {
            color: 'success',
            show: true,
            text: 'セグメントを更新しました。'
          })
          this.$emit('draw-new-segment')
        })
      },
      resetAge(age: Array<number>) {
        if (age.length === 0) {
          return null
        }
        if (age[0] === 18 && age[1] === 29) {
          return '0'
        } else if (age[0] === 30 && age[1] === 39) {
          return '1'
        } else if (age[0] === 40 && age[1] === 49) {
          return '2'
        } else if (age[0] === 50 && age[1] === 59) {
          return '3'
        } else if (age[0] === 60 && age[1] === 99) {
          return '4'
        }
      },
      resetSegmentQuestions() {
        const segmentQuestions: any = {}
        this.questions.forEach((question: any) => {
          segmentQuestions[question.ref.id] = []
        })
        this.segment.questions = segmentQuestions
      }
    },
    watch: {
      questions() {
        this.resetSegmentQuestions()
      },
      segmentFromNewProject() {
        if (this.segmentFromNewProject.willUpdate) {
          let segment = this.findSegment(this.segmentFromNewProject.segmentRef)
          segment = Object.assign({}, segment)
          segment.age = this.resetAge(segment.age)
          if (segment.gender) {
            segment.gender = String(segment.gender)
          }
          const segmentQuestions: any = {}
          this.questions.forEach((question: any) => {
            segmentQuestions[question.ref.id] = []
          })
          segment.questions.forEach((question: any) => {
            segmentQuestions[this.findQuestion(question.ref).ref.id] = question.values
          })
          segment.questions = segmentQuestions
          this.segment = segment
        } else {
          this.resetForm()
          this.resetSegmentQuestions()
        }
      }
    }
  })
</script>
