<template>
  <v-dialog
    v-model="dialog"
    max-width="512">
    <template
      v-slot:activator="{on, attrs}">
      <v-list-item
        v-bind="attrs"
        v-on="on">
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>組織</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-form ref="organizationForm">
        <v-card-title>組織</v-card-title>
        <v-card-subtitle>所属する組織を切り替えれられます。</v-card-subtitle>
        <v-card-text>
          <v-radio-group v-model="selectedOrganization">
            <v-radio
              v-for="(o, i) in organizations"
              :key="i"
              :label="o.name"
              :value="o"
              :disabled="!o.activated"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="dialog = false"
            outlined
            text>閉じる</v-btn>
          <v-btn
            @click="cacheOrganization"
            color="primary">
            保存
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'

  export default Vue.extend({
    data: () => ({
      selectedOrganization: {
        id: '',
        activated: false,
        moderatorIds: [],
        name: ''
      },
      dialog: false
    }),
    computed: {
      ...mapGetters('OrganizationsOrganizationsModule', ['organizations', 'findOrganizationById']),
      ...mapGetters('UiOrganizationModule', ['organization'])
    },
    methods: {
      ...mapActions('UiOrganizationModule', ['setUiOrganization']),
      openDialog() {
        this.dialog = true
      },
      cacheOrganization() {
        this.setUiOrganization({
          id: this.selectedOrganization.id,
          activated: this.selectedOrganization.activated,
          moderatorIds: this.selectedOrganization.moderatorIds,
          name: this.selectedOrganization.name,
        })
        this.dialog = false
        setTimeout(() => {
          location.reload()
        }, 100)
      }
    },
    created() {
      this.selectedOrganization = this.findOrganizationById(this.organization.id)
    }
  })
</script>