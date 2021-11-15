<template>
  <v-toolbar-items>
    <v-menu offset-y>
      <template
        v-slot:activator="{on}">
      <v-btn
        v-on="on"
        text>
        <v-avatar
          class="mx-2">
          <img
            :src="profile.photoURL">
        </v-avatar>
        <span class="mx-2">{{ profile.displayName }}</span>
        <v-icon>mdi-menu-down</v-icon>
      </v-btn>
      </template>
      <v-list>
        <v-dialog
          v-model="dialog.profile"
          max-width="512">
          <template
            v-slot:activator="{on, attrs}">
            <v-list-item
              v-bind="attrs"
              v-on="on">
              <v-list-item-icon>
                <v-icon>mdi-account-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>プロフィール</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-card>
            <v-card-title>プロフィール編集</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="profile.displayName"
                label="表示名">
              </v-text-field>
              <v-file-input
                v-model="profile.photoFile"
                :rules="profilePhotoRules"
                accept="image/png, image/jpeg, image/bmp"
                label="プロフィール写真"
                prepend-icon="mdi-camera">
              </v-file-input>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                @click="dialog.profile = false"
                outlined
                text>閉じる</v-btn>
              <v-btn
                @click="updateProfileWithPhoto"
                color="primary">
                保存
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="dialog.email"
          max-width="512">
          <template
            v-slot:activator="{on, attrs}">
            <v-list-item
              v-bind="attrs"
              v-on="on">
              <v-list-item-icon>
                <v-icon>mdi-email-edit</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>メールアドレス</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-card>
            <v-form ref="emailForm">
              <v-card-title>メールアドレス変更</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="profile.email"
                  :rules="emailRules"
                  type="email"
                  disabled
                  label="現在のメールアドレス">
                </v-text-field>
                <v-text-field
                  v-model="profile.newEmail"
                  :rules="emailRules"
                  type="email"
                  label="新しいメールアドレス">
                </v-text-field>
                <v-text-field
                  v-model="profile.password"
                  :rules="[required]"
                  type="password"
                  label="パスワード">
                </v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="dialog.email = false"
                  outlined
                  text>閉じる</v-btn>
                <v-btn
                  @click="updateEmail"
                  color="primary">
                  保存
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="dialog.password"
          max-width="512">
          <template
            v-slot:activator="{on, attrs}">
            <v-list-item
              v-bind="attrs"
              v-on="on">
              <v-list-item-icon>
                <v-icon>mdi-lock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>パスワード</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <v-card>
            <v-form ref="passwordForm">
              <v-card-title>パスワード変更</v-card-title>
              <v-card-text>
                <v-text-field
                  v-model="profile.password"
                  :rules="[required]"
                  type="password"
                  label="現在のパスワード">
                </v-text-field>
                <v-text-field
                  v-model="profile.newPassword"
                  :rules="[required]"
                  type="password"
                  label="新しいパスワード">
                </v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  @click="dialog.password = false"
                  outlined
                  text>閉じる</v-btn>
                <v-btn
                  @click="updatePassword"
                  color="primary">
                  保存
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card>
        </v-dialog>
        <ModeratorOrganizationDialog>
        </ModeratorOrganizationDialog>
        <v-divider inset></v-divider>
        <v-list-item
          @click="logout">
          <v-list-item-icon>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>ログアウト</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-toolbar-items>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapActions } from 'vuex'
  import firebase from '@/firebase'
  import ModeratorOrganizationDialog from '@/components/moderator/OrganizationDialog.vue'
  import AlgoliasearchModerators from '@/plugins/algoliasearch-moderators'

  export default Vue.extend({
    components: {
      ModeratorOrganizationDialog,
    },
    data: () => ({
      currentUser: firebase.auth().currentUser,
      profile: {
        displayName: '',
        email: '',
        newEmail: '',
        photoURL: '',
        photoFile: null,
        password: '',
        newPassword: '',
      },
      isDefaultPhoto: true,
      dialog: {
        profile: false,
        email: false,
        password: false,
      },
      required: (v: any) => !!v || '入力してください',
      emailRules: [
        (v: any) => !!v || 'メールアドレスを入力してください',
        (v: any) => /.+@.+\..+/.test(v) || '有効なメールアドレスを入力してください',
      ],
      profilePhotoRules: [
        (v: any) => !v || v.size < 2000000 || '2MB以下',
      ],
    }),
    methods: {
      ...mapActions('StorageProfilePhotoModule', ['createProfilePhoto', 'getProfilePhoto']),
      refs(): any {
        return this.$refs
      },
      updateProfile() {
        if (!this.currentUser) return
        this.currentUser.updateProfile(this.profile)
        .finally(() => {
          AlgoliasearchModerators.partialUpdateObjects([{
            objectID: (this.currentUser || {}).uid,
            displayName: this.profile.displayName,
          }])
          this.dialog.profile = false
        })
      },
      updateProfileWithPhoto() {
        if (!this.currentUser || !this.currentUser.providerData[0]) return
        if (!this.profile.photoFile) {
          if (this.isDefaultPhoto) {
            this.profile.photoURL = ''
          }
          this.updateProfile()
        } else {
          this.createProfilePhoto({
            file: this.profile.photoFile,
            name: this.currentUser.uid
          })
          .then(filename => {
            this.profile.photoURL = filename
            setTimeout(() => {
              this.getProfilePhoto({
                name: this.profile.photoURL
              })
              .then(url => {
                this.profile.photoURL = url
              })
            }, 3000)
            this.updateProfile()
          })
        }
      },
      getCredential () {
        return firebase.auth.EmailAuthProvider.credential(
          this.profile.email,
          this.profile.password
        )
      },
      updateEmail() {
        if (!this.refs().emailForm.validate()) {
          return
        }
        if (!this.currentUser) return
        this.currentUser.reauthenticateWithCredential(this.getCredential())
        .then(() => {
          if (!this.currentUser) return
          this.currentUser.updateEmail(this.profile.newEmail)
          .then(() => {
            this.profile.email = this.profile.newEmail
            this.profile.newEmail = ''
          })
          .catch(e => {
            console.error(e.message)
          })
          .finally(() => {
            this.dialog.email = false
          })
          AlgoliasearchModerators.partialUpdateObjects([{
            objectID: this.currentUser.uid,
            email: this.profile.newEmail,
          }])
        })
      },
      updatePassword() {
        if (!this.refs().passwordForm.validate()) {
          return
        }
        if (!this.currentUser) return
        this.currentUser.reauthenticateWithCredential(this.getCredential())
        .then(() => {
          if (!this.currentUser) return
          this.currentUser.updatePassword(this.profile.newPassword)
          .then(() => {
            this.profile.password = this.profile.newPassword
            this.profile.newPassword = ''
          })
          .catch(e => {
            console.error(e.message)
          })
          .finally(() => {
            this.dialog.password = false
          })
        })
      },
      logout() {
        firebase.auth().signOut()
        .then(() => {
          localStorage.clear()
          sessionStorage.clear()
          location.reload()
        })
        .catch(e => {
          console.error(e)
        })
      }
    },
    created() {
      if (!this.currentUser || !this.currentUser.providerData[0]) return
      this.profile.email = this.currentUser.providerData[0].email || ''
      this.profile.displayName = this.currentUser.providerData[0].displayName || this.profile.email
      this.profile.photoURL = require('../../assets/profile_photo.jpg')
      if (this.currentUser.providerData[0].photoURL) {
        this.getProfilePhoto({
          name: this.currentUser.uid
        })
        .then(url => {
          this.profile.photoURL = url
          this.isDefaultPhoto = false
        })
      }
    }
  })
</script>