<template>
  <div>
    <v-row
      v-for="(segment, i) in segments" :key="i">
      <v-col>
        <v-card
          @click="updateSegmentByRef(segment)">
          <v-card-title>
            {{ segment.name }}
            <v-spacer></v-spacer>
            <v-btn
              @click.stop="deleteSegmentByRef(segment)"
              icon>
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-card
      @click="createNewSegmentByRef"
      class="my-3">
      <v-card-title
        class="justify-center primary--text">
        <v-icon
          color="primary">
          mdi-plus-circle-outline
        </v-icon>
        セグメントを追加
      </v-card-title>
    </v-card>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    computed: {
      ...mapGetters('ProjectsSegmentsModule', ['segments']),
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['updateProject']),
      ...mapActions('ProjectsSegmentsModule', ['deleteSegment']),
      ...mapActions('UiSegmentFromNewProjectModule', ['setSegmentFromNewProject']),
      deleteSegmentByRef(segment: any) {
        if (confirm('「' + segment.name + '」を削除しますか？')) {
          this.deleteSegment({
            ref: segment.ref
          })
        }
      },
      updateSegmentByRef(segment: any) {
        this.setSegmentFromNewProject({
          segmentRef: segment.ref,
          willUpdate: true
        })
        this.$emit('draw-new-segment')
      },
      createNewSegmentByRef() {
        this.setSegmentFromNewProject({
          willUpdate: false
        })
        this.$emit('draw-new-segment')
      },
    }
  })
</script>