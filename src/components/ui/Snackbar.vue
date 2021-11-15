<template>
	<v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="snackbar.timeout"
    top>
    {{ snackbar.text }}
    <v-spacer></v-spacer>
    <template v-slot:action="{ attrs }">
      <v-btn
        v-if="snackbar.click"
        @click="snackbar.click();snackbar.show = false"
        v-bind="attrs"
        icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-btn
        v-else
        @click="snackbar.show = false"
        v-bind="attrs"
        icon>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
  import Vue from 'vue'

  export default Vue.extend({
    data: () => ({
      snackbar: {
        color: '',
        show: false,
        text: '',
        click: null,
      }
    }),
    methods: {
      showSnackbar(options: any) {
        options.show = true
        this.snackbar = options
      }
    }
  })
</script>