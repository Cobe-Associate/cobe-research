<template>
  <v-container>
    <v-row>
      <v-col>
        <v-textarea
          v-model="project.note"
          auto-grow
          readonly
          rounded>
        </v-textarea>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters } from 'vuex'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project'])
    }
  })
</script>