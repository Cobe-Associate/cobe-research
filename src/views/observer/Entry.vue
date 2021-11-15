<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      color="white">
      <v-btn icon>
        <v-img
          class="ma-4"
          :src="require('../../assets/logo.svg')"/>
      </v-btn>
      <v-toolbar-title>
        <span class="font-weight-bold">Cobe</span> <span class="primary--text font-weight-bold">Research</span>
      </v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container
        fluid>
        <v-img
          class="ma-4"
          :src="coverUrl">
        </v-img>
        <br>
        <h2
          class="text-center">
          {{ project.title }}
        </h2>
        <p class="secondary--text text-center">
          参加するために下記項目の入力と<br>書面の確認および同意をお願いします。
        </p>
        <br>
        <v-form
          ref="observerForm">
          <div
            v-if="!invitedByEmail">
            <h4>メールアドレス</h4>
            <v-text-field
              v-model="observer.email"
              :rules="emailRules"
              filled>
            </v-text-field>
          </div>
          <div
            v-if="project.demographics.includes('age')">
            <h4>年齢</h4>
            <v-text-field
              v-model="observer.age"
              :rules="[required]"
              type="number"
              min=0
              max=99
              filled>
            </v-text-field>
          </div>
          <div
            v-if="project.demographics.includes('age')">
            <h4>性別</h4>
            <v-radio-group
              v-model="observer.gender"
              :rules="[required]"
              row>
              <v-radio
                label="男性"
                value=1>
              </v-radio>
              <v-radio
                label="女性"
                value=2>
              </v-radio>
              <v-radio
                label="ノンバイナリー"
                value=9>
              </v-radio>
            </v-radio-group>
          </div>
          <div
            v-if="project.demographics.includes('residence')">
            <h4>居住地</h4>
            <v-text-field
              v-model="observer.residence"
              :rules="[required]"
              filled>
            </v-text-field>
          </div>
          <h4>書面
            <v-chip
              v-if="isAgreeTerms"
              color="success"
              class="ma-2"
              small>
              確認
            </v-chip>
            <v-chip
              v-else
              class="ma-2"
              small>
              未確認
            </v-chip>
          </h4>
          <v-btn
            @click="agreeTerms"
            block
            color="primary"
            outlined
            large>
            <v-icon left>mdi-file-document</v-icon>
            アンケート守秘義務.pdf
          </v-btn>
          <v-divider class="mt-12 mb-8"></v-divider>
          <v-btn
            @click="createObserverAfterTermsAgreement"
            :disabled="!loaded || alreadyParticipated"
            block
            class="my-4"
            color="primary"
            large>
            アンケートに参加
          </v-btn>
        </v-form>
      </v-container>
    </v-main>
    <v-snackbar
      v-model="alreadyParticipated"
      color="warning"
      top>
      すでにアンケートに参加しています。アンケート実施画面に移動します。
    </v-snackbar>
    <v-snackbar
      v-model="alreadyParticipated"
      color="warning"
      top>
      すでにアンケートに参加しています。アンケート実施画面に移動します。
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'

  export default Vue.extend({
    data: () => ({
      alreadyParticipated: false,
      coverUrl: '',
      isAgreeTerms: false,
      invitedByEmail: false,
      loaded: false,
      ndaFileUrl: null,
      observer: {
        ref: {
          id: null
        },
        age: null,
        email: '',
        gender: null,
        residence: null,
      },
      projectRef: null,
      emailRules: [
        (v: any) => !!v || 'メールアドレスを入力してください',
        (v: any) => /.+@.+\..+/.test(v) || '有効なメールアドレスを入力してください',
      ],
      required: (v: any) => !!v || '入力してください',
    }),
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project']),
    },
    methods: {
      ...mapActions('ProjectsObserverModule', ['createObserver', 'findObserver']),
      ...mapActions('ProjectsProjectModule', ['getProject', 'subscribeProject']),
      ...mapActions('StorageNdaFileModule', ['getNdaFile']),
      ...mapActions('StorageProjectCoverModule', ['getProjectCover']),
      refs(): any {
        return this.$refs
      },
      createObserverAfterTermsAgreement() {
        if (!this.refs().observerForm.validate()) {
          return
        }
        if (!this.isAgreeTerms) {
          alert('アンケート守秘義務の確認および同意をお願いします。')
          return
        }
        this.findObserver({
          projectRef: this.projectRef,
          email: this.observer.email,
        })
        .then(observer => {
          if (observer) {
            this.observer = observer
            setTimeout(() => {
              this.next()
            }, 5000)
            this.alreadyParticipated = true
            return
          }
          this.createObserver({
            age: this.observer.age ? Number(this.observer.age) : this.observer.age,
            email: this.observer.email,
            gender: this.observer.gender ? Number(this.observer.gender) : this.observer.gender,
            projectRef: this.projectRef,
            residence: this.observer.residence,
            status: '',
          })
          .then(observer => {
            this.observer = observer
            this.next()
          })
        })
      },
      agreeTerms() {
        this.isAgreeTerms = true
        window.open(this.ndaFileUrl || '', '_blank')
      },
      next() {
        this.$router.push({
          path: '/observer/questionnaire?projectId=' + this.$route.query.projectId + '&observerId=' + this.observer.ref.id,
        })
      },
      back() {
        window.location.href = `/observer`
      },
    },
    created() {
      if (!this.$route.query.projectId) {
        this.back()
      }
      this.getProject({
        id: this.$route.query.projectId as string
      })
      .then(project => {
        if (!project) {
          this.back()
        }
        this.projectRef = project.ref
        if (this.$route.query.email) {
          this.observer.email = this.$route.query.email as string
          this.invitedByEmail = true
        }
        // 同意済みの回答者の場合、アンケート実施画面に遷移
        this.findObserver({
          projectRef: this.projectRef,
          email: this.observer.email,
        })
        .then(observer => {
          if (observer) {
            this.observer.ref = observer.ref
            setTimeout(() => {
              this.next()
            }, 5000)
            this.alreadyParticipated = true
          }
          this.loaded = true
        })
        this.subscribeProject({
          ref: this.projectRef
        })
        this.getProjectCover({
          name: project.coverFile
        })
        .then(url => {
          this.coverUrl = url
        })
        this.getNdaFile({
          name: project.ndaFile
        })
        .then(url => {
          this.ndaFileUrl = url
        })
      })
    },
    watch: {
      project () {
        if (this.$route.query.email) {
          // 未招待のメールアドレスは除く
          if (!this.project.invitedObserverEmails.includes(this.$route.query.email)) {
            this.back()
          }
        }
        if (this.project.participatedObserverRefs.length > this.project.maxOfInvitedObservers) {
          alert('人数制限を超えたため、アンケートに参加できませんでした。ご協力ありがとうございました。ページを閉じてください。')
          this.back()
        }
      }
    }
  })
</script>