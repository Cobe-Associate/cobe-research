<template>
  <div>
    <Snackbar
      ref="snackbarRef">
    </Snackbar>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import Snackbar from '@/components/ui/Snackbar.vue'

  export default Vue.extend({
    components: {
      Snackbar,
    },
    computed: {
      ...mapGetters('ProjectsQuestionsModule', ['questions']),
      ...mapGetters('ProjectsSegmentsModule', ['segments']),
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['createProject', 'updateProject']),
      ...mapActions('ProjectsQuestionsModule', ['listQuestions', 'createQuestion']),
      ...mapActions('ProjectsSegmentsModule', ['listSegments', 'createSegment',]),
      ...mapActions('StorageNdaFileModule', ['createNdaFile', 'getNdaFile']),
      ...mapActions('StorageProjectCoverModule', ['createProjectCover', 'getProjectCover']),
      refs(): any {
        return this.$refs
      },
      uploadNdaFile(newProject: any, ndaFile: string) {
        this.getNdaFile({
          name: ndaFile
        })
        .then(url => {
          fetch(url)
          .then(res => res.blob())
          .then(blob => {
            this.createNdaFile({
              file: blob,
              name: newProject.ref.id,
            })
            .then((filename) => {
              this.updateProject({
                ref: newProject.ref,
                ndaFile: filename
              })
            })
          })
        })
      },
      uploadCoverFile(newProject: any, coverFile: string) {
        this.getProjectCover({
          name: coverFile
        })
        .then(url => {
          fetch(url)
          .then(res => res.blob())
          .then(blob => {
            this.createProjectCover({
              file: blob,
              name: newProject.ref.id,
            })
            .then((filename) => {
              this.updateProject({
                ref: newProject.ref,
                coverFile: filename
              })
            })
          })
        })
      },
      mapSegmentQuestions(questionRefMap: any, segmentQuestions: any) {
        segmentQuestions.forEach((segmentQuestion: any, i: number) => {
          segmentQuestion.ref = questionRefMap[segmentQuestion.ref.id]
          segmentQuestions[i] = segmentQuestion
        })
        return segmentQuestions
      },
      copy(project: any) {
        // プロジェクトの作成
        this.createProject({
          coverFile: null,
          coModeratorIds: [],
          demographics: project.demographics,
          invitedObserverEmails: [],
          moderatorId: project.moderatorId,
          maxOfInvitedObservers: 0,
          note: project.note,
          ndaFile: null,
          participatedObserverRefs: [],
          questionRefs: [],
          status: 'draft',
          timer: 0,
          title: project.title
        })
        .then((newProject: any) => {
          // TODO: 質問のファイルのコピー
          // 質問のコピー
          this.listQuestions({
            projectRef: project.ref,
            questionRefs: project.questionRefs
          })
          .then(() => {
            const questionRefMap: any = {}
            const newQuestionRefs: Array<any> = []
            Promise.all(this.questions.map(async (question: any) => await this.createQuestion({
              answerType: question.answerType,
              answerOptions: question.answerOptions,
              answerSliderLabel: question.answerSliderLabel,
              body: question.body,
              files: [],
              isFreeAnswer: question.isFreeAnswer,
              note: question.note,
              projectRef: newProject.ref,
              questionItems: question.questionItems,
              subject: question.subject,
              time: question.time,
              type: question.type,
            })
            .then((newQuestion: any) => {
              questionRefMap[question.ref.id] = newQuestion.ref
              newQuestionRefs.push(newQuestion.ref)
            })))
            .then(() => {
              // セグメントのコピー
              this.listSegments({
                projectRef: project.ref
              })
              .then(() => {
                Promise.all(this.segments.map(async (segment: any) => await this.createSegment({
                  name: segment.name,
                  age: segment.age,
                  gender: segment.gender,
                  questions: this.mapSegmentQuestions(questionRefMap, segment.questions),
                  projectRef: newProject.ref,
                })))
              })
              this.updateProject({
                ref: newProject.ref,
                questionRefs: newQuestionRefs
              })
              .then(() => {
                this.refs().snackbarRef.showSnackbar({
                  color: 'success',
                  text: 'コピーしたプロジェクトは未公開の状態です。開始日時の設定や参加者の招待をおこない、プロジェクトを公開してください。'
                })
                setTimeout(() => {
                  location.reload()
                }, 5000)
              })
            })
          })
          // NDAファイルをコピー
          if (project.ndaFile) {
            this.uploadNdaFile(newProject, project.ndaFile)
          }
          // カバー画像をコピー
          if (project.coverFile) {
            this.uploadCoverFile(newProject, project.coverFile)
          }
        })
      }
    }
  })
</script>