<template>
  <v-app>
    <v-main>
      <v-row no-gutters>
        <v-col
          md="6"
          sm="12">
          <v-img
            :src="require('../../assets/moderator_login.jpg')"/>
        </v-col>
        <v-col
          md="6"
          sm="12">
          <v-container
            class="fill-height"
            fluid>
            <v-row
              align="center"
              justify="center">
              <v-col
                cols="8">
                <v-card class="elevation-4">
                  <v-toolbar
                   flat>
                    <v-toolbar-title>ログイン</v-toolbar-title>
                  </v-toolbar>
                  <v-card-text>
                    <v-alert
                      v-model="loginFailed"
                      type="error">
                       ログインできません。正しいメールアドレスとパスワードを入力してください
                    </v-alert>
                    <v-form ref="loginForm">
                      <header>メールアドレス</header>
                      <v-text-field
                        v-model="email"
                        :rules="emailRules"
                        filled
                        required
                        type="email"
                      ></v-text-field>
                      <header>パスワード</header>
                      <v-text-field
                        v-model="password"
                        :append-icon="showEye ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showEye = !showEye"
                        filled
                        required
                        :rules="passwordRules"
                        :type="showEye ? 'text' : 'password'"
                      ></v-text-field>
                    </v-form>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn
                     text
                     small
                     @click.stop="passwordReset = true">
                     パスワードを忘れた場合
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="primary"
                      @click="login">
                      ログイン
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
      <v-dialog
        v-model="passwordReset"
        max-width="512">
        <v-form ref="passwordResetForm">
          <v-card>
            <v-card-title class="headline">パスワード再設定</v-card-title>
            <v-card-text>
              <p>メールアドレスを入力してください。パスワード再設定メールを送信します。メールアドレスをお忘れの方は <v-icon small>mdi-help-circle</v-icon> ヘルプ よりお問い合わせください。</p>
              <v-text-field
                v-model="emailToResetPassword"
                filled
                :rules="emailRules">
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                outlined
                text
                @click="passwordReset = false">
                閉じる
              </v-btn>
              <v-btn
                color="primary"
                @click="resetPassword">
                送信
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import Vue from 'vue'
  import firebase from '@/firebase'

  export default Vue.extend({
    data() {
      return {
        email: '',
        emailRules: [
          (v: any) => !!v || 'メールアドレスを入力してください',
          (v: any) => /.+@.+\..+/.test(v) || '有効なメールアドレスを入力してください',
        ],
        password: '',
        passwordRules: [
          (v: any) => !!v || 'パスワードを入力してください'
        ],
        showEye: false,
        loginFailed: false,
        emailToResetPassword: '',
        passwordReset: false,
      }
    },
    methods: {
      refs(): any {
        return this.$refs
      },
      login() {
        if (!this.refs().loginForm.validate()) {
          return
        }
        firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then(() => {
          this.$router.push('/moderator')
        })
        .catch(() => {
          this.loginFailed = true
          setTimeout(() => {
            this.loginFailed = false
          }, 5000)
        })
      },
      resetPassword() {
        if (!this.refs().passwordResetForm.validate()) {
          return
        }
        firebase.auth().sendPasswordResetEmail(this.emailToResetPassword)
        .then(() => {
          alert(this.emailToResetPassword + ' にパスワード再設定メールを送信しました。')
        }).catch(e => {
          console.error(e)
        })
        this.passwordReset = false
      }
    }
  })
</script>