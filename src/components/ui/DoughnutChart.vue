<script lang="ts">
  import Vue from 'vue'
  import { Doughnut } from 'vue-chartjs'

  export default Vue.extend({
    extends: Doughnut,
    props: [
      'data',
      'options'
    ],
    mounted() {
      this.this().renderChart(this.data, this.options)
    },
    methods: {
      this(): any {
        return this
      }
    }
  })
</script>