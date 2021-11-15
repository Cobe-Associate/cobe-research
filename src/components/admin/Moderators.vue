<template>
  <v-container>
    <h2>モデレーター</h2>
    <p><small>モデレーターの追加、パスワード再設定、利用停止／再開をおこなえます。</small></p>
    <template>
      <v-card>
        <v-card-actions
          class="mx-2">
          <v-spacer></v-spacer>
          <v-dialog
            v-model="newModeratorDialog"
            width="800">
            <template v-slot:activator="{on, attrs}">
              <v-btn
                color="primary"
                v-bind="attrs"
                v-on="on">
                モデレータの追加
              </v-btn>
            </template>
            <v-card>
              <v-card-title>モデレーターの追加</v-card-title>
              <v-card-text>
                <v-form ref="newModeratorForm">
                  <v-text-field
                    v-model="newModerator.email"
                    label="メールアドレス"
                    :rules="emailRules"
                    type="email">
                  </v-text-field>
                  <v-text-field
                    v-model="newModerator.displayName"
                    label="表示名"
                    :rules="requiredRules">
                  </v-text-field>
                  <v-text-field
                    v-model="newModerator.password"
                    label="パスワード"
                    :rules="passwordRules">
                  </v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="newModeratorDialog = false">
                  閉じる
                </v-btn>
                <v-btn
                  @click="createModeratorWithEmailAndPassword"
                  color="primary">
                  追加
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-actions>
        <v-card-text>
          <v-text-field
            v-model="moderatorSearch"
            append-icon="mdi-magnify"
            label="メールアドレスまたは表示名で検索"
            single-line
            hide-details>
          </v-text-field>
        </v-card-text>
        <v-data-table
          :headers="moderatorHeaders"
          :items="moderatorItems"
          :search="moderatorSearch">
          <template v-slot:[`item.photoURL`]="{item}">
            <v-img
              width="40"
              :src="item.photoURL">
            </v-img>
          </template>
          <template v-slot:[`item.actions`]="{item}">
            <v-icon
              small
              class="mr-2"
              @click="openEditModeratorDialog(item)">
              mdi-pencil
            </v-icon>
            <v-icon
              small
              @click="openDeleteModeratorDialog(item)">
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:top>
            <v-dialog
              v-model="editModeratorDialog"
              width="800">
              <v-card>
                <v-card-title>モデレーターの編集</v-card-title>
                <v-card-text>
                  <v-form ref="editModeratorForm">
                    <v-text-field
                      v-model="moderator.email"
                      label="メールアドレス"
                      :rules="emailRules"
                      type="email">
                    </v-text-field>
                    <v-text-field
                      v-model="moderator.displayName"
                      label="表示名"
                      :rules="requiredRules">
                    </v-text-field>
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="editModeratorDialog = false">
                    閉じる
                  </v-btn>
                  <v-btn
                    @click="editModerator"
                    color="primary">
                    編集
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog
              v-model="deleteModeratorDialog"
              width="800">
              <v-card>
                <v-card-title>モデレーターの削除</v-card-title>
                <v-card-text>
                  {{ moderator.displayName }}さん（{{ moderator.email }}）のアカウントを削除しますか？<br>このモデレーターに紐づくプロジェクトや回答結果等の全てのデータが削除され復元できません。
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    @click="deleteModeratorDialog = false">
                    閉じる
                  </v-btn>
                  <v-btn
                    @click="deleteModeratorWithAll"
                    color="primary">
                    削除
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
        </v-data-table>
        <v-card-text>
          <h5>パスワードの再設定</h5>
          <ol>
            <li><a href="https://console.firebase.google.com/u/0/project/cobe-research-prod/authentication/users" target="_blank">Firebase</a>で該当モデレーターにフォーカスを当てると「︙」が表示されるので、「パスワードを再設定」を押してパスワード再設定用のメールを送信する。</li>
          </ol>
          <h5>モデレーターの利用停止／再開</h5>
          <ol>
            <li><a href="https://console.firebase.google.com/u/0/project/cobe-research-prod/authentication/users" target="_blank">Firebase</a>で該当モデレーターを「アカウントを無効」「アカウントを有効」にする。</li>
          </ol>
          <h5 class="warning--text">注意</h5>
          <ol class="warning--text">
            <li>Firebaseで「アカウントを削除」せず、この画面でモデレーターを削除してください。DB内のデータに不整合が起こるため。</li>
          </ol>
        </v-card-text>
      </v-card>
      <Snackbar
        ref="snackbarRef">
      </Snackbar>
    </template>
    <DeleteProjects
      ref="deleteProjectsRef">
    </DeleteProjects>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import { DateTime } from 'luxon'
  import DeleteProjects from '@/components/moderator/DeleteProjects.vue'
  import Snackbar from '@/components/ui/Snackbar.vue'
  import AlgoliasearchModerators from '@/plugins/algoliasearch-moderators'

  export default Vue.extend({
    components: {
      DeleteProjects,
      Snackbar,
    },
    data: () => ({
      moderatorSearch: '',
      moderatorHeaders: [
        {text: 'メールアドレス', value: 'email'},
        {text: '表示名', value: 'displayName'},
        {text: '写真', value: 'photoURL', filterable: false, sortable: false},
        {text: '状態', value: 'disabled', filterable: false},
        {text: 'ログイン日', value: 'lastSignInTime', filterable: false},
        {text: 'UID', value: 'uid', filterable: false, sortable: false},
        {text: '', value: 'actions', filterable: false, sortable: false},
      ],
      moderatorItems: [],
      moderator: {
        uid: '',
        email: '',
        displayName: '',
      },
      newModerator: {
        email: '',
        displayName: '',
        password: Math.random().toString(32).substring(2)
      },
      emailRules: [
        (v: any) => !!v || 'メールアドレスを入力してください',
        (v: any) => /.+@.+\..+/.test(v) || '有効なメールアドレスを入力してください',
      ],
      passwordRules: [
        (v: any) => !!v || 'パスワードを入力してください'
      ],
      requiredRules: [
        (v: any) => !!v || '入力してください'
      ],
      newModeratorDialog: false,
      editModeratorDialog: false,
      deleteModeratorDialog: false,
    }),
    computed: {
      ...mapGetters('OrganizationsModeratorsModule', ['moderators']),
      ...mapGetters('ProjectsProjectModule', ['projects'])
    },
    methods: {
      ...mapActions('OrganizationsModeratorsModule', ['listModerators', 'createModerator', 'updateModerator', 'deleteModerator']),
      ...mapActions('ProjectsProjectModule', ['listProjects']),
      ...mapActions('StorageProfilePhotoModule', ['deleteProfilePhoto']),
      refs(): any {
        return this.$refs
      },
      async sendmail() {
        const param = {
          url: this.$vuetify.lang.t('$vuetify.sendgrid.url'),
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + process.env.VUE_APP_SENDGRID_KEY,
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: {
            'personalizations': [{
              'to': [{
                'email': this.newModerator.email
              }],
              'cc': [{
                'email': this.$vuetify.lang.t('$vuetify.sendgrid.from.email')
              }],
              'dynamic_template_data': {
                'email': this.newModerator.email,
                'displayName': this.newModerator.displayName,
                'password': this.newModerator.password,
                'url': location.protocol + '//' + location.host + '/moderator'
              }
            }],
            'from': {
              'email': this.$vuetify.lang.t('$vuetify.sendgrid.from.email'),
              'name': this.$vuetify.lang.t('$vuetify.sendgrid.from.name'),
            },
            'template_id': 'd-c1731ea243f64e1cbb584d38c5bb3c7f'
          }
        }
        return await fetch(process.env.VUE_APP_FUNCTION_URL + '/sendmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(param)
        })
      },
      createModeratorWithEmailAndPassword() {
        if (!this.refs().newModeratorForm.validate()) {
          return
        }
        this.createModerator(this.newModerator)
        .then(result => {
          if (!result) {
            alert('モデレーターを追加できませんでした。エラー理由はコンソールログを確認してください。')
          }
          this.newModeratorDialog = false
          this.sendmail()
          .finally(() => {
            this.refs().snackbarRef.showSnackbar({
              color: 'success',
              text: 'モデレーターを追加し、ログイン情報をメールしました。'
            })
            setTimeout(() => {
              location.reload()
            }, 5000)
          })
          setTimeout(() => {
            const newModerator = this.moderators[this.moderators.length - 1]
            AlgoliasearchModerators.saveObject({
              objectID: newModerator.uid,
              displayName: newModerator.displayName,
              email: newModerator.email
            })
          }, 100)
        })
      },
      openEditModeratorDialog(moderator: any) {
        this.moderator = moderator
        this.editModeratorDialog = true
      },
      editModerator() {
        if (!this.refs().editModeratorForm.validate()) {
          return
        }
        this.updateModerator({
          uid: this.moderator.uid,
          email: this.moderator.email,
          displayName: this.moderator.displayName
        })
        .then(result => {
          if (!result) {
            alert('モデレーターを編集できませんでした。エラー理由はコンソールログを確認してください。')
            return
          }
          this.editModeratorDialog = false
          this.refs().snackbarRef.showSnackbar({
            color: 'success',
            text: 'モデレーターを編集しました。'
          })
          AlgoliasearchModerators.partialUpdateObjects([{
            objectID: this.moderator.uid,
            displayName: this.moderator.displayName,
            email: this.moderator.email,
          }])
        })
      },
      openDeleteModeratorDialog(moderator: any) {
        this.moderator = moderator
        this.deleteModeratorDialog = true
      },
      deleteModeratorWithAll() {
        this.deleteModerator({
          uid: this.moderator.uid
        })
        .then(result => {
          if (!result) {
            alert('モデレーターを削除できませんでした。エラー理由はコンソールログを確認してください。')
            return
          }
          this.deleteProfilePhoto({
            name: this.moderator.uid
          })
          this.listProjects({
            moderatorId: this.moderator.uid
          })
          .then(() => {
            const projectRefs: any = []
            this.projects.forEach((project: any) => {
              projectRefs.push(project.ref)
            })
            this.refs().deleteProjectsRef.deleteAllProjects(projectRefs)
            this.deleteModeratorDialog = false
            this.refs().snackbarRef.showSnackbar({
              color: 'success',
              text: 'モデレーターを削除しました。'
            })
            setTimeout(() => {
              location.reload()
            }, 5000)
          })
          AlgoliasearchModerators.deleteObject(this.moderator.uid)
        })
      }
    },
    created() {
      this.listModerators()
    },
    watch: {
      moderators() {
        const items: any = []
        this.moderators.forEach((moderator: any) => {
          if (JSON.parse(process.env.VUE_APP_ADMIN_EMAIL).includes(moderator.email) || process.env.VUE_APP_OBSERVER_EMAIL === moderator.email) {
            return
          }
          items.push({
            email: moderator.email,
            displayName: moderator.displayName || '',
            photoURL: moderator.photoURL || '',
            lastSignInTime: (moderator.metadata.lastSignInTime) ? DateTime.fromRFC2822(moderator.metadata.lastSignInTime).toFormat('yyyy.MM.dd') : '',
            disabled: (!moderator.disabled) ? '有効' : '無効',
            uid: moderator.uid,
          })
        })
        this.moderatorItems = items
      }
    }
  })
</script>
