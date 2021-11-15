<template>
  <div></div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'

  export default Vue.extend({
    computed: {
      ...mapGetters('ProjectsProjectModule', ['findProject']),
      ...mapGetters('ProjectsQuestionsModule', ['questions'])
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['deleteProject']),
      ...mapActions('ProjectsQuestionsModule', ['listQuestions']),
      ...mapActions('StorageNdaFileModule', ['deleteNdaFile']),
      ...mapActions('StorageProjectCoverModule', ['deleteProjectCover']),
      ...mapActions('StorageQuestionFileModule', ['deleteQuestionFile']),
      deleteProjectWithAll(projectRef: any) {
        let files: Array<string> = []
        this.listQuestions({
          projectRef: projectRef,
          questionRefs: this.findProject(projectRef).questionRefs
        })
        .then(() => {
          this.questions.forEach((question: any) => {
            files = files.concat(question.files)
          })
          Promise.all(files.map(async (name: string) => await this.deleteQuestionFile({
            name: name
          })))
          setTimeout(() => {
            this.deleteProject({
              ref: projectRef
            })
            .then(() => {
              this.deleteProjectCover({
                name: projectRef.id
              })
              this.deleteNdaFile({
                name: projectRef.id
              })
            })
          }, 100)
        })
      },
      async deleteAllProjects(projectRefs: any) {
        await Promise.all(projectRefs.map(async (ref: any) => await this.deleteProjectWithAll(ref)))
      }
    }
  })
</script>