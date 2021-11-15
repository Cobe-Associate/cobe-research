<template>
  <div>
    <draggable
      v-model="draggableQuestions"
      draggable=".question">
      <v-row
        v-for="(question, i) in draggableQuestions"
        :key="i"
        class="question">
        <v-col>
          <v-card
            @click="updateQuestionByRef(question)"
            :style="{'background-image': 'url(' + typeNoThumbnail(question.type, i) + ')'}">
            <v-row
              dense>
              <v-col
                cols="1"
                class="px-0">
                <v-row
                  class="fill-height">
                  <v-col></v-col>
                  <v-col
                    class="ml-12">
                    <v-icon>mdi-drag-vertical</v-icon>
                  </v-col>
                  <v-col></v-col>
                </v-row>
              </v-col>
              <v-col cols="11">
                <v-list-item
                  three-line>
                  <v-list-item-avatar
                    rounded
                    size="60">
                    <v-img
                      :src="typeThumbnail(question.type)">
                    </v-img>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title
                      class="font-weight-bold">
                      {{ question.subject }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ question.body }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-card-actions>
                  <span
                    class="text--secondary mx-2">
                    配分時間
                  </span>
                  <span>
                    {{ sec2min(question.time) }}
                  </span>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click.stop="deleteQuestionByRef(question)"
                    icon>
                    <v-icon>mdi-trash-can-outline</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </draggable>
    <v-card
      @click="createNewQuestionByRef"
      class="my-3">
      <v-card-title
        class="justify-center primary--text">
        <v-icon
          color="primary">
          mdi-plus-circle-outline
        </v-icon>
        ブロックを追加
      </v-card-title>
    </v-card>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import draggable from 'vuedraggable'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    components: {
      draggable
    },
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['questions']),
      ...mapGetters('ProjectsSegmentsModule', ['findSegmentByQuestionRef']),
      draggableQuestions: {
        get() {
          return this.questions
        },
        set(questions: any) {
          const that = this as any
          that.changeOrder(questions)
          const questionRefs: Array<any> = []
          questions.forEach((q: any) => {
            questionRefs.push(q.ref)
          })
          that.updateProject({
            ref: this.projectRef,
            questionRefs: questionRefs
          })
        }
      }
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['updateProject']),
      ...mapActions('ProjectsQuestionsModule', ['deleteQuestion', 'changeOrder']),
      ...mapActions('StorageQuestionFileModule', ['deleteQuestionFile']),
      ...mapActions('UiQuestionFromNewProjectModule', ['setQuestionFromNewProject']),
      deleteQuestionByRef(question: any) {
        const segment = this.findSegmentByQuestionRef(question.ref)
        if (segment) {
          alert('セグメント「' + segment.name + '」の回答条件で利用しているため削除できません。' )
          return
        }
        if (confirm('「' + question.subject + '」を削除しますか？')) {
          const that = this as any
          that.deleteQuestion({
            ref: question.ref
          })
          .then(() => {
            const questionRefs: Array<any> = []
            this.questions.forEach((q: any) => {
              questionRefs.push(q.ref)
            })
            that.updateProject({
              ref: this.projectRef,
              questionRefs: questionRefs
            })
          })
          Promise.all(question.files.map(async (name: string) => await that.deleteQuestionFile({
              name: name
            })
          ))
        }
      },
      updateQuestionByRef(question: any) {
        const that = this as any
        that.setQuestionFromNewProject({
          questionRef: question.ref,
          willUpdate: true
        })
        that.$emit('draw-new-question')
      },
      createNewQuestionByRef() {
        const that = this as any
        that.setQuestionFromNewProject({
          willUpdate: false
        })
        that.$emit('draw-new-question')
      },
      typeNoThumbnail(type: string, no: number) {
        no += 1
        if (no > 10) {
          no = 0
        }
        return require('../../assets/question_' + type + '_no/' + no + '.svg')
      },
      typeThumbnail(type: string) {
        return require('../../assets/question_' + type + '.svg')
      },
      sec2min(time: number) {
        let min: string = Math.floor(time / 60).toString() + '分'
        if (time % 60) {
          min += (time % 60).toString() + '秒'
        }
        return min
      }
    }
  })
</script>