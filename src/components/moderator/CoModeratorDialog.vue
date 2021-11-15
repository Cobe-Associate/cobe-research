<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="1024">
      <v-form
        v-if="currentUser.uid === coModeratorProject.moderatorId"
        ref="coModeratorForm">
        <v-card>
          <v-card-title>共同モデレーターの追加</v-card-title>
          <v-card-subtitle>アンケートを共同実施するモデレーターをプロジェクトに招待できます。</v-card-subtitle>
          <v-card-text>
            <v-combobox
              @input="inputCoModerators"
              v-model="coModerators"
              :error="coModeratorError"
              :error-messages="coModeratorErrorMessages"
              :items="coModeratorItems"
              :item-text="item => item.displayName +' (' + item.email + ')'"
              item-value="objectID"
              multiple>
              <template v-slot:selection="data">
                <v-chip
                  :color="(typeof data.item === 'object' || !coModeratorError) ? '' : 'error'"
                  :key="JSON.stringify(data.item)"
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  @click:close="data.parent.selectItem(data.item)">
                  <span
                    class="pr-2">
                    <span
                      v-if="typeof data.item === 'object'">
                      {{ data.item.displayName +' (' + data.item.email + ')' }}
                    </span>
                    <span
                      v-else>
                      {{ data.item }}
                    </span>
                  </span>
                  <v-icon
                    small
                    @click="data.parent.selectItem(data.item)">mdi-close
                  </v-icon>
                </v-chip>
              </template>
            </v-combobox>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              @click="dialog = false"
              outlined
              text>
              閉じる
            </v-btn>
            <v-btn
              color="primary"
              @click="selectCoModerators">
              保存
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
      <v-card
        v-else>
        <v-card-title>共同モデレーター</v-card-title>
        <v-card-subtitle>アンケートを共同実施するモデレーターの一覧です。モデレーターの追加はプロジェクトのオーナーにご依頼ください。</v-card-subtitle>
        <v-card-text>
          <v-combobox
            v-model="coModerators"
            disabled
            multiple>
            <template v-slot:selection="data">
              <v-chip>
                <span
                  class="pr-2">
                  {{ data.item.displayName +' (' + data.item.email + ')' }}
                </span>
                <span
                  v-if="data.item.objectID === coModeratorProject.moderatorId">
                  オーナー
                </span>
              </v-chip>
            </template>
          </v-combobox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="dialog = false"
            outlined
            text>
            閉じる
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <Snackbar
      ref="snackbarRef">
    </Snackbar>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import { DateTime } from 'luxon'
  import firebase from '@/firebase'
  import Snackbar from '@/components/ui/Snackbar.vue'
  import AlgoliasearchModerators from '@/plugins/algoliasearch-moderators'

  export default Vue.extend({
    components: {
      Snackbar,
    },
    data: () => ({
      beforeCoModerators: [],
      coModerators: [],
      coModeratorItems: [],
      coModeratorProject: {ref: null, title:  null, startAt: new Date()},
      coModeratorDialog: false,
      coModeratorError: false,
      coModeratorErrorMessages: '',
      currentUser: firebase.auth().currentUser || {uid: null, email: null, displayName: null},
      dialog: false,
    }),
    computed: {
      ...mapGetters('UiOrganizationModule', ['organization'])
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['updateProject']),
      refs(): any {
        return this.$refs
      },
      openCoModeratorDialog(project: any) {
        this.coModerators = []
        // 組織に属するモデレーターを検索
        this.coModeratorProject = project
        AlgoliasearchModerators.search(this.organization.id, {
          filters: 'NOT objectID:' + this.currentUser.uid
        })
        .then(({hits}: any) => {
          this.coModeratorItems = hits
          // ログインが共同モデレーターの場合、オーナーを先頭に追加して検索
          const coModeratorIds: Array<string> = [].concat(project.coModeratorIds)
          if (this.currentUser.uid !== project.moderatorId) {
            coModeratorIds.unshift(project.moderatorId)
          }
          // 追加済みの共同モデレーターを取得・初期化
          AlgoliasearchModerators.getObjects(coModeratorIds)
          .then(({results}: any) => {
            this.coModerators = results
            this.beforeCoModerators = [].concat(this.coModerators)
          })
          this.coModeratorDialog = true
        })
      },
      sendCoModeratorEmail(emails: Array<string>) {
        if (emails.length === 0) {
          return new Promise((resolve) => {
            resolve(true)
          })
        }
        const personalizations: Array<any> = []
        emails.forEach((email: string) => {
          personalizations.push({
            'to': [{
              'email': email
            }],
            'dynamic_template_data': {
              'projectTitle': this.coModeratorProject.title,
              'projectStartAt': DateTime.fromJSDate(this.coModeratorProject.startAt).toFormat('yyyy.MM.dd HH:mm'),
              'moderatorDisplayName': this.currentUser.displayName,
              'projectInvitationUrl': location.protocol + '//' + location.host + '/moderator'
            }
          })
        })
        const param = {
          url: this.$vuetify.lang.t('$vuetify.sendgrid.url'),
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_SENDGRID_KEY,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            'personalizations': personalizations,
            'from': {
              'email': this.$vuetify.lang.t('$vuetify.sendgrid.from.email'),
              'name': this.$vuetify.lang.t('$vuetify.sendgrid.from.name'),
            },
            'template_id': 'd-07dcfdd1a9784c9bbe431e1a88f304f1'
          }
        }
        return fetch(process.env.VUE_APP_FUNCTION_URL + '/sendmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(param)
        })
      },
      selectCoModerators() {
        if (!this.refs().coModeratorForm.validate() || this.coModeratorError) {
          return
        }
        // 追加した共同モデレーターにメール通知
        const afterCoModerators = this.coModerators.filter((after: any) => {
          return this.beforeCoModerators.findIndex((before: any) => before.email === after.email) === -1
        })
        const coModeratorEmails: Array<string> = []
        afterCoModerators.forEach((moderator: any) => {
          if (this.currentUser.email === moderator.email) {
            return
          }
          coModeratorEmails.push(moderator.email)
        })
        this.sendCoModeratorEmail(coModeratorEmails)
        .finally(() => {
          const coModeratorIds: Array<string> = []
          this.coModerators.forEach((item: any) => {
            // オーナーのIDは共同モデレーターに入れないこと！
            if (this.currentUser.uid === item.objectID) {
              return
            }
            coModeratorIds.push(item.objectID)
          })
          this.updateProject({
            ref: this.coModeratorProject.ref,
            coModeratorIds: coModeratorIds
          })
          this.coModeratorDialog = false
          this.refs().snackbarRef.showSnackbar({
            color: 'success',
            text: '追加した共同モデレーターに招待メールを送りました。'
          })
          setTimeout(() => {
            location.reload()
          }, 3000)
        })
      },
      inputCoModerators($e: any) {
        this.coModeratorError = false
        this.coModeratorErrorMessages = ''
        $e.forEach((e: any, i: number) => {
          if (typeof e === 'string') {
            if (!/.+@.+\..+/.test(e)) {
              this.coModeratorError = true
              this.coModeratorErrorMessages = '有効なメールアドレスを入力してください。'
              return
            }
            if (this.coModerators.find((moderator: any) => moderator.email === e)) {
              this.coModeratorError = true
              this.coModeratorErrorMessages = '追加済みのモデレーターは削除してください。'
              return
            }
            if (e === this.currentUser.email) {
              Vue.delete(this.coModerators, i)
              return
            }
            AlgoliasearchModerators.search(e)
            .then(({hits}: any) => {
              if (hits.length === 0) {
                this.coModeratorError = true
                this.coModeratorErrorMessages = 'モデレーターがみつかりませんでした。追加したいモデレーターから正しいメールアドレスをお尋ねください。'
                return
              }
              Vue.set(this.coModerators, i, hits[0])
            })
          }
        })
      },
      openDialog(project: any) {
        this.openCoModeratorDialog(project)
        this.dialog = true
      },
    },
  })
</script>