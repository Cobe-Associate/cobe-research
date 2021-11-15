<template>
  <v-container>
    <h2>組織</h2>
    <p><small>組織の追加、編集、削除をおこなえます。</small></p>
    <template>
      <v-card>
        <v-card-actions
          class="mx-2">
          <v-spacer></v-spacer>
          <v-dialog
            v-model="newOrganizationDialog"
            width="800">
            <template v-slot:activator="{on, attrs}">
              <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on">
                組織の追加
              </v-btn>
            </template>
            <v-card>
              <v-card-title>組織の追加</v-card-title>
              <v-card-text>
                <v-form ref="newOrganizationForm">
                  <v-text-field
                    v-model="newOrganization.name"
                    label="名称"
                    :rules="requiredRules">
                  </v-text-field>
                  <v-select
                    v-model="newOrganization.moderatorIds"
                    :items="moderatorItems"
                    :item-text="item => item.displayName +' (' + item.email + ')'"
                    item-value="uid"
                    label="モデレーター"
                    multiple>
                    <template v-slot:selection="data">
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        @click:close="data.parent.selectItem(data.item)">
                        <span
                          class="pr-2">
                          {{ data.item.displayName +' (' + data.item.email + ')' }}
                        </span>
                      </v-chip>
                    </template>
                  </v-select>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="newOrganizationDialog = false">
                  閉じる
                </v-btn>
                <v-btn
                  @click="createOrganizationWithAny"
                  color="primary">
                  追加
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-actions>
        <v-card-text>
          <v-text-field
            v-model="organizationSearch"
            append-icon="mdi-magnify"
            label="名称で検索"
            single-line
            hide-details>
          </v-text-field>
        </v-card-text>
        <v-data-table
          :headers="organizationHeaders"
          :items="organizationItems"
          :search="organizationSearch">
          <template v-slot:[`item.moderatorIds`]="{item}">
            {{ item.moderatorIds.length }} 人
          </template>
          <template v-slot:[`item.actions`]="{item}">
            <v-icon
              small
              class="mr-2"
              @click="openEditOrganizationDialog(item)">
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="openDeleteOrganizationDialog(item)">
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:top>
            <v-dialog
              v-model="editOrganizationDialog"
              width="800">
              <v-card>
                <v-card-title>組織の編集</v-card-title>
                <v-card-text>
                  <v-form ref="editOrganizationForm">
                    <label>状態</label>
                    <v-checkbox
                      v-model="organization.activated"
                      :label="(organization.activated) ? '有効' : '無効'">
                    </v-checkbox>
                    <v-text-field
                      v-model="organization.name"
                      label="名称"
                      :rules="requiredRules">
                    </v-text-field>
                    <v-select
                    v-model="organization.moderatorIds"
                    :items="moderatorItems"
                    :item-text="item => item.displayName +' (' + item.email + ')'"
                    item-value="uid"
                    label="モデレーター"
                    multiple>
                    <template v-slot:selection="data">
                      <v-chip
                        :key="JSON.stringify(data.item)"
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        @click:close="data.parent.selectItem(data.item)">
                        <span
                          class="pr-2">
                          {{ data.item.displayName +' (' + data.item.email + ')' }}
                        </span>
                      </v-chip>
                    </template>
                  </v-select>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="editOrganizationDialog = false">
                    閉じる
                  </v-btn>
                  <v-btn
                    @click="editOrganization"
                    color="primary">
                    編集
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog
              v-model="deleteOrganizationDialog"
              width="800">
              <v-card>
                <v-card-title>組織の削除</v-card-title>
                <v-card-text>
                  {{ organization.name }}を削除しますか？この組織に属するモデレーターは削除されません。
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="deleteOrganizationDialog = false">
                    閉じる
                  </v-btn>
                  <v-btn
                    @click="deleteOrganizationWithAll"
                    color="primary">
                    削除
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
        </v-data-table>
        <v-card-text>
        </v-card-text>
      </v-card>
      <Snackbar
        ref="snackbarRef">
      </Snackbar>
    </template>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import Snackbar from '@/components/ui/Snackbar.vue'
  import AlgoliasearchModerators from '@/plugins/algoliasearch-moderators'

  export default Vue.extend({
    components: {
      Snackbar,
    },
    data: () => ({
      beforeOrganization: {
        moderatorIds: [],
      },
      moderatorItems: [],
      organizationSearch: '',
      organizationHeaders: [
        {text: '名称', value: 'name'},
        {text: 'モデレーター', value: 'moderatorIds', filterable: false, sortable: false},
        {text: '状態', value: 'activatedText', sortable: false},
        {text: 'ID', value: 'id', filterable: false, sortable: false},
        {text: '', value: 'actions', filterable: false, sortable: false},
      ],
      organizationItems: [],
      organization: {
        ref: {},
        activated: false,
        id: '',
        moderatorIds: [],
        name: '',
      },
      newOrganization: {
        id: '',
        moderatorIds: [],
        name: '',
      },
      requiredRules: [
        (v: any) => !!v || '入力してください'
      ],
      searchModerators: [],
      newOrganizationDialog: false,
      editOrganizationDialog: false,
      deleteOrganizationDialog: false,
    }),
    computed: {
      ...mapGetters('OrganizationsModeratorsModule', ['moderators']),
      ...mapGetters('OrganizationsOrganizationsModule', ['organizations']),
    },
    methods: {
      ...mapActions('OrganizationsOrganizationsModule', ['listOrganizations', 'createOrganization', 'updateOrganization', 'deleteOrganization']),
      refs(): any {
        return this.$refs
      },
      reload() {
        setTimeout(() => {
            location.reload()
          }, 1000)
      },
      createOrganizationWithAny() {
        if (!this.refs().newOrganizationForm.validate()) {
          return
        }
        this.createOrganization({
          activated: true,
          moderatorIds: this.newOrganization.moderatorIds,
          name: this.newOrganization.name,
        })
        .then(result => {
          if (!result) {
            alert('組織を作成できませんでした。')
            return
          }
          this.newOrganizationDialog = false
          this.refs().snackbarRef.showSnackbar({
            color: 'success',
            text: '組織を作成しました。'
          })
          AlgoliasearchModerators.getObjects(this.newOrganization.moderatorIds)
          .then(({results}: any) => {
            const moderators: any = []
            results.forEach((hit: any) => {
              let organizations: Array<string> = hit.organizations || []
              organizations.push(result.ref.id)
              moderators.push({
                objectID: hit.objectID,
                organizations: organizations
              })
            })
            AlgoliasearchModerators.partialUpdateObjects(moderators)
            .then(() => {
              this.reload()
            })
          })
        })
      },
      openEditOrganizationDialog(organization: any) {
        this.organization = organization
        this.beforeOrganization = Object.assign({}, organization)
        this.editOrganizationDialog = true
      },
      editOrganization() {
        if (!this.refs().editOrganizationForm.validate()) {
          return
        }
        this.updateOrganization({
          ref: this.organization.ref,
          activated: this.organization.activated,
          moderatorIds: this.organization.moderatorIds,
          name: this.organization.name,
        })
        .then(result => {
          if (!result) {
            alert('組織を編集できませんでした。')
            return
          }
          this.editOrganizationDialog = false
          this.refs().snackbarRef.showSnackbar({
            color: 'success',
            text: '組織を編集しました。'
          })
          const additions: any = this.organization.moderatorIds.filter(
            (next: string) => !(this.beforeOrganization.moderatorIds as Array<string>).includes(next)
          )
          const subtractions: any = this.beforeOrganization.moderatorIds.filter(
            (old: string) => !(this.organization.moderatorIds  as Array<string>).includes(old)
          )
          AlgoliasearchModerators.getObjects(additions.concat(subtractions))
          .then(({results}: any) => {
            const moderators: any = []
            results.forEach((hit: any) => {
              let organizations: Array<string> = hit.organizations || []
              if (additions.includes(hit.objectID)) {
                organizations.push(this.organization.id)
              }
              if (subtractions.includes(hit.objectID)) {
                organizations = organizations.filter(i => i !== this.organization.id)
              }
              moderators.push({
                objectID: hit.objectID,
                organizations: organizations
              })
            })
            AlgoliasearchModerators.partialUpdateObjects(moderators)
            .then(() => {
              this.reload()
            })
          })
        })
      },
      openDeleteOrganizationDialog(organization: any) {
        this.organization = organization
        this.beforeOrganization = Object.assign({}, organization)
        this.deleteOrganizationDialog = true
      },
      deleteOrganizationWithAll() {
        this.deleteOrganization(this.organization)
        .then(result => {
          if (!result) {
            alert('組織を削除できませんでした。')
            return
          }
          this.deleteOrganizationDialog = false
          this.refs().snackbarRef.showSnackbar({
            color: 'success',
            text: '組織を削除しました。'
          })
          AlgoliasearchModerators.getObjects(this.beforeOrganization.moderatorIds)
          .then(({results}: any) => {
            const moderators: any = []
            results.forEach((hit: any) => {
              let organizations: Array<string> = hit.organizations || []
              organizations = organizations.filter(i => i !== this.organization.id)
              moderators.push({
                objectID: hit.objectID,
                organizations: organizations
              })
            })
            AlgoliasearchModerators.partialUpdateObjects(moderators)
            .then(() => {
              this.reload()
            })
          })
        })
      }
    },
    created() {
      this.listOrganizations()
    },
    watch: {
      organizations() {
        const items: any = []
        this.organizations.forEach((organization: any) => {

          const item = Object.assign(organization, {
            activatedText: (organization.activated) ? '有効' : '無効',
          })
          items.push(item)
        })
        this.organizationItems = items
      },
      moderators() {
        const items: any = []
        this.moderators.forEach((moderator: any) => {
          if (process.env.VUE_APP_OBSERVER_EMAIL === moderator.email) {
            return
          }
          items.push(moderator)
        })
        this.moderatorItems = items
      }
    }
  })
</script>
