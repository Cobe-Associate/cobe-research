<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      color="white">
      <v-btn
        onclick="location.reload()"
        icon>
        <v-img
          class="ma-4"
          :src="require('../../assets/logo.svg')"/>
      </v-btn>
      <v-toolbar-title>
        <span class="font-weight-bold">Cobe</span> <span class="primary--text font-weight-bold">Research</span>
      </v-toolbar-title>
      <template
        v-slot:extension>
        <v-tabs
          v-model="tab"
          align-with-title>
          <v-tab
            key="1">
            1 概要
          </v-tab>
          <v-tab
            key="2">
            2 内容
          </v-tab>
          <v-tab
            key="3">
            3 セグメント
          </v-tab>
          <v-tab
            key="4">
            4 参加者
          </v-tab>
        </v-tabs>
        <v-spacer></v-spacer>
        <v-btn
          @click="saveProject(null, false)"
          color="primary"
          class="mx-2"
          outlined
          :disabled="savingProject === true">
          保存して閉じる
        </v-btn>
        <v-btn
          @click="saveProject(null, true)"
          color="primary"
          :disabled="savingProject === true">
          公開
        </v-btn>
      </template>
    </v-app-bar>

    <v-main
      style="background: #F5F9FA;">
      <v-row>
        <v-col
          cols=8>
          <v-form ref="newProjectForm">
            <v-tabs-items
              v-model="tab"
              style="background: #F5F9FA;">
              <v-tab-item
                key="1">
                <v-card
                  class="ma-8">
                  <v-container
                    fluid>
                    <v-card-title>プロジェクトの概要</v-card-title>
                    <v-divider class="my-4"></v-divider>
                    <v-card-text>
                      <h4>タイトル</h4>
                       <v-text-field
                        v-model="project.title"
                        :rules="[required]"
                        filled>
                      </v-text-field>
                      <v-row>
                        <v-col
                          cols=6>
                          <h4>開始日</h4>
                          <v-menu
                            ref="startDateMenu"
                            v-model="startDateMenu"
                            :close-on-content-click="false"
                            :return-value.sync="startDate"
                            transition="scale-transition"
                            min-width="280px">
                            <template v-slot:activator="{on, attrs}">
                              <v-text-field
                                v-model="startDate"
                                filled
                                readonly
                                :rules="[required]"
                                v-bind="attrs"
                                v-on="on"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="startDate"
                              no-title
                              scrollable>
                              <v-spacer></v-spacer>
                              <v-btn
                                text
                                color="primary"
                                @click="startDateMenu=false">
                                閉じる
                              </v-btn>
                              <v-btn
                                text
                                color="primary"
                                @click="$refs.startDateMenu.save(startDate)">
                                決定
                              </v-btn>
                            </v-date-picker>
                          </v-menu>
                        </v-col>
                        <v-col
                          cols=6>
                          <h4>開始時間</h4>
                          <v-menu
                            ref="startTimeMenu"
                            v-model="startTimeMenu"
                            :close-on-content-click="false"
                            :return-value.sync="startTime"
                            transition="scale-transition"
                            max-width="280px"
                            min-width="280px">
                            <template v-slot:activator="{on, attrs}">
                              <v-text-field
                                v-model="startTime"
                                filled
                                readonly
                                :rules="[required]"
                                v-bind="attrs"
                                v-on="on">
                              </v-text-field>
                            </template>
                            <v-time-picker
                              v-show="startTimeMenu"
                              v-model="startTime"
                              full-width
                              @click:minute="$refs.startTimeMenu.save(startTime)">
                            </v-time-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
                      <h4>カバー画像 <v-chip class="ma-2" small>任意</v-chip></h4>
                      <v-file-input
                        v-model="coverFile"
                        accept="image/*"
                        placeholder="画像をアップロードする"
                        filled>
                      </v-file-input>
                      <br>
                      <v-btn
                        @click="saveProject(1)"
                        color="primary"
                        class="px-12"
                        large>
                        内容の入力へ
                      </v-btn>
                    </v-card-text>
                  </v-container>
                </v-card>
              </v-tab-item>
              <v-tab-item
                key="2">
                <v-card
                  class="ma-8">
                  <v-container
                    fluid>
                    <v-card-title>プロジェクトの内容</v-card-title>
                    <v-divider class="my-4"></v-divider>
                    <v-card-text>
                      <NewProjectQuestion
                        :projectRef="project.ref"
                        @draw-new-question="drawNewQuestion">
                      </NewProjectQuestion>
                      <br>
                      <h4>全体ノート</h4>
                      <v-textarea
                        v-model="project.note"
                        :rules="[required]"
                        auto-grow
                        filled>
                      </v-textarea>
                      <br>
                      <v-btn
                        @click="saveProject(2)"
                        color="primary"
                        class="px-12"
                        large>
                        セグメントの入力へ
                      </v-btn>
                    </v-card-text>
                  </v-container>
                </v-card>
              </v-tab-item>
              <v-tab-item
                key="3">
                <v-card
                  class="ma-8">
                  <v-container
                    fluid>
                    <v-card-title>プロジェクトのセグメント</v-card-title>
                     <v-divider class="my-4"></v-divider>
                     <v-card-text>
                      <NewProjectSegment
                        :projectRef="project.ref"
                        @draw-new-segment="drawNewSegment">
                      </NewProjectSegment>
                      <br>
                      <v-btn
                        @click="saveProject(3)"
                        color="primary"
                        class="px-12"
                        large>
                        参加者の入力へ
                      </v-btn>
                    </v-card-text>
                  </v-container>
                </v-card>
              </v-tab-item>
              <v-tab-item
                key="4">
                <v-card
                  class="ma-8">
                  <v-container
                    fluid>
                    <v-card-title>プロジェクトの参加者</v-card-title>
                    <v-divider class="my-4"></v-divider>
                    <v-card-text>
                      <v-row
                        dense>
                        <v-col
                          cols="6">
                          <h4>人数</h4>
                          <v-text-field
                            v-model="project.maxOfInvitedObservers"
                            :rules="[required]"
                            min=1
                            max=999
                            filled>
                          </v-text-field>
                        </v-col>
                      </v-row>
                      <v-row
                        dense>
                        <v-col
                          cols="8">
                          <h4>メール招待リスト <small
                            class="text--secondary">
                            プロジェクトを公開するとアドレスに招待リンクが送られます。</small>
                          </h4>
                        </v-col>
                        <v-col
                          cols="4"
                          class="text-right">
                          <h4>{{ project.invitedObserverEmails.length }} 件</h4>
                        </v-col>
                      </v-row>
                      <v-combobox
                        v-model="project.invitedObserverEmails"
                        chips
                        filled
                        multiple
                        placeholder="（例）sample@gmail.com">
                        <template v-slot:selection="data">
                          <v-chip
                            color="info"
                            :key="JSON.stringify(data.item)"
                            v-bind="data.attrs"
                            :input-value="data.selected"
                            @click:close="data.parent.selectItem(data.item)">
                            <span
                              class="pr-2">
                              {{ data.item }}
                            </span>
                            <v-icon
                              small
                              @click="data.parent.selectItem(data.item)">mdi-close
                            </v-icon>
                          </v-chip>
                        </template>
                      </v-combobox>
                      <h4>招待用URL</h4>
                      <v-text-field
                        id="invitationUrl"
                        append-icon="mdi-content-copy"
                        @click:append="copyInvitationUrl"
                        :value="invitationUrl"
                        filled
                        readonly>
                      </v-text-field>
                      <h4>事前質問</h4>
                      <v-row
                        class="ma-0">
                        <v-checkbox
                          v-model="project.demographics"
                          v-for="demographic in [['age', '年齢'], ['gender', '性別'], ['residence', '居住地']]"
                          :key="demographic[0]"
                          :label="`${demographic[1]}`"
                          :value="demographic[0]"
                          hide-details
                          class="mr-8">
                        </v-checkbox>
                      </v-row>
                      <br>
                      <h4>
                        守秘義務書類アップロード
                        <v-chip
                          v-show="ndaFileUrl"
                          @click="openNdaFile(ndaFileUrl)"
                          class="ma-2"
                          small>
                          PDFを確認
                        </v-chip>
                        <v-chip
                          v-show="!ndaFileUrl"
                          @click="openNdaFile('https://drive.google.com/file/d/1rhwW3vU-et4hCaadtoyfzLeznj4ER-sG/view?usp=sharing')"
                          class="ma-2"
                          small>
                          サンプル
                        </v-chip>
                      </h4>
                      <v-file-input
                        v-model="ndaFile"
                        accept="application/pdf"
                        placeholder="書類（PDF）をアップロードする"
                        filled>
                      </v-file-input>
                      <br>
                      <v-divider class="my-4"></v-divider>
                      <h4>プレビュー</h4>
                      <v-card
                        class="mx-auto">
                        <v-row
                          no-gutters>
                          <v-col
                            cols=4>
                            <v-img
                              class="fill-height"
                              style="background-color: #EEE;"
                              :src="coverUrl">
                            </v-img>
                          </v-col>
                          <v-col
                            class="pa-2"
                            cols=8>
                            <v-card-title>{{ project.title }}</v-card-title>
                            <v-card-subtitle>日時 {{ startDate }} {{ startTime }}<br>時間 {{ scheduledTime }}分</v-card-subtitle>
                            <v-card-text>
                              参加URL
                              <v-text-field
                                :value="invitationUrl"
                                filled
                                dense
                                disabled>
                              </v-text-field>
                            </v-card-text>
                          </v-col>
                        </v-row>
                      </v-card>
                      <br>
                      <p>プロジェクトを公開すると、アンケートページのURLが発行され、招待リストに記載されたメールアドレスに招待URLが送付されます。人数制限を超えた場合での参加リクエストの承認は不可となります。</p>
                      <br>
                      <v-btn
                        @click="saveProject(null, true)"
                        color="primary"
                        class="px-12"
                        :disabled="savingProject === true"
                        large>
                        保存して公開
                      </v-btn>
                    </v-card-text>
                  </v-container>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-form>
        </v-col>
        <v-col
          cols=4>
        </v-col>
      </v-row>
    </v-main>

    <v-navigation-drawer
      v-model="newQuestionDrawer"
      fixed
      overflow
      right
      temporary
      width="32%">
      <NewQuestion
        :projectRef="project.ref"
        @draw-new-question="drawNewQuestion"
        @show-snackbar="showSnackbar"></NewQuestion>
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="newSegmentDrawer"
      fixed
      overflow
      right
      temporary
      width="32%">
      <NewSegment
        :projectRef="project.ref"
        @draw-new-segment="drawNewSegment"
        @show-snackbar="showSnackbar"></NewSegment>
    </v-navigation-drawer>

    <Snackbar
      ref="snackbarRef">
    </Snackbar>
  </v-app>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import { DateTime } from 'luxon'
  import firebase from '@/firebase'
  import NewProjectQuestion from '@/components/moderator/NewProjectQuestion.vue'
  import NewProjectSegment from '@/components/moderator/NewProjectSegment.vue'
  import NewQuestion from '@/components/moderator/NewQuestion.vue'
  import NewSegment from '@/components/moderator/NewSegment.vue'
  import Snackbar from '@/components/ui/Snackbar.vue'

  export default Vue.extend({
    components: {
      NewProjectQuestion,
      NewProjectSegment,
      NewQuestion,
      NewSegment,
      Snackbar,
    },
    data: () => ({
      coverFile: null,
      coverUrl: null,
      invitationUrl: '',
      ndaFile: null,
      ndaFileUrl: null,
      newQuestionDrawer: false,
      newSegmentDrawer: false,
      beforeProject: {
        title: null,
        invitedObserverEmails: [],
        startAt: null
      },
      scheduledTime: 0,
      required: (v: any) => !!v || '入力してください',
      tab: 0,
      savingProject: false,
      startDate: '',
      startTime: '',
      startDateMenu: false,
      startTimeMenu: false,
    }),
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['questions']),
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['createProject', 'getProject', 'updateProject']),
      ...mapActions('ProjectsQuestionsModule', ['listQuestions']),
      ...mapActions('ProjectsRemindsModule', ['createRemind']),
      ...mapActions('ProjectsSegmentsModule', ['listSegments']),
      ...mapActions('StorageNdaFileModule', ['createNdaFile', 'getNdaFile']),
      ...mapActions('StorageProjectCoverModule', ['createProjectCover', 'getProjectCover']),
      refs(): any {
        return this.$refs
      },
      initProject() {
        this.listQuestions({
          projectRef: this.project.ref,
          questionRefs: this.project.questionRefs
        })
        this.listSegments({
          projectRef: this.project.ref
        })
        this.getProjectCover({
          name: this.project.coverFile
        })
        .then(url => {
          this.coverUrl = url
        })
        this.getNdaFile({
          name: this.project.ndaFile
        })
        .then(url => {
          this.ndaFileUrl = url
        })
        this.invitationUrl = location.protocol + '//' + location.host + '/observer/entry?projectId=' + this.project.ref.id
        this.beforeProject = Object.assign({}, this.project)
      },
      sendObserverEmail(emails: Array<string>, templateId: string) {
        if (emails.length === 0 || !templateId) {
          return new Promise(() => {
            //
          })
        }
        const personalizations: Array<any> = []
        emails.forEach((email: string) => {
          personalizations.push({
            'to': [{
              'email': email
            }],
            'dynamic_template_data': {
              'projectTitle': this.project.title,
              'projectStartAt': DateTime.fromJSDate(this.project.startAt).toFormat('yyyy.MM.dd HH:mm'),
              'projectScheduledTime': this.scheduledTime + '分',
              'projectInvitationUrl': this.invitationUrl + '&email=' + email
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
            'template_id': templateId
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
      saveProject(tab: number | null, sendEmail: boolean) {
        if (!this.refs().newProjectForm.validate()) {
          return
        }
        if (DateTime.fromISO(this.startDate + 'T' + this.startTime).diffNow('minutes').minutes <= 10) {
          alert('開始日時が過去の日付または開始10分前です。時間に余裕を持って開始してください。')
          return
        }
        const errorEmail: Array<string> = []
        this.project.invitedObserverEmails.forEach((email: string) => {
          if (!/.+@.+\..+/.test(email)) {
            errorEmail.push(email)
          }
        })
        if (errorEmail.length > 0) {
          alert(errorEmail.join() + 'は不正な参加者のメールアドレスです。メールアドレスの形式に間違いがないかご確認ください。')
          return
        }
        if (this.project.invitedObserverEmails.length > this.project.maxOfInvitedObservers) {
          alert('メール招待リストの件数が参加者の人数を超えています。参加者の人数を増やしてください。')
          return
        }
        if (!tab && !this.project.ndaFile) {
          // 「保存して閉じる」と「公開」の場合にNDAをチェック
          alert('守秘義務書類をアップロードしてください。')
          return
        }
        this.project.startAt = DateTime.fromISO(this.startDate + 'T' + this.startTime).toJSDate()
        let invitedObserverEmails = this.project.invitedObserverEmails
        let canceledObserverEmails: Array<string> = []
        // ドラフトから公開にするとき全員にメール
        if (this.project.status === 'draft' && sendEmail) {
          if (!confirm('プロジェクトを公開すると、招待リストに記載されたメールアドレスに招待URLが送付されます。プロジェクトを公開しますか？')) {
            return
          }
          this.project.status = 'new'
          this.savingProject = true
          this.showSnackbar({
            color: 'info',
            show: true,
            text: 'アンケートページを公開しています。'
          })
        // 公開のとき変更内容をメール
        } else if (this.project.status === 'new') {
          let updates = false
          if (this.project.title !== this.beforeProject.title || (this.project.startAt as any).getTime() !== (this.beforeProject.startAt as any).getTime()) {
            if (!confirm('タイトル・開始日時の変更を既存の参加者にメールで送信しますか？')) {
              return
            }
            updates = true
          }
          // 追加されたメールアドレス
          const additions = this.project.invitedObserverEmails.filter(
            (next: string) => !(this.beforeProject.invitedObserverEmails as Array<string>).includes(next)
          )
          // 削除されたメールアドレス
          const subtractions = this.beforeProject.invitedObserverEmails.filter(
            (old: string) => !this.project.invitedObserverEmails.includes(old)
          )
          if (additions.length > 0 || subtractions.length > 0) {
            if (!confirm('アンケートの新しい参加者に招待メールを送信しますか？また削除した参加者にキャンセルメールを送信しますか？')) {
              return
            }
            invitedObserverEmails = additions
            canceledObserverEmails = subtractions
            updates = true
          }
          if (updates) {
            sendEmail = true
            tab = null
            this.savingProject = true
            this.showSnackbar({
              color: 'info',
              show: true,
              text: 'アンケートページを保存・公開しています。'
            })
          }
        }
        this.updateProject({
          ref: this.project.ref,
          coverFile: this.project.coverFile,
          demographics: this.project.demographics,
          invitedObserverEmails: this.project.invitedObserverEmails,
          maxOfInvitedObservers: this.project.maxOfInvitedObservers,
          note: this.project.note,
          ndaFile: this.project.ndaFile,
          status: this.project.status,
          startAt: this.project.startAt,
          title: this.project.title,
        })
        .then(() => {
          if (tab) {
            this.tab = tab
          } else {
            if (sendEmail) {
              if (invitedObserverEmails.length === 0) {
                this.showSnackbar({
                  color: 'success',
                  show: true,
                  text: 'アンケートページを公開しました。参加者にURLを共有して、時間になったらアンケートを開始してください。'
                })
                setTimeout(() => {
                  this.savingProject = false
                  this.back()
                }, 3000)
              }
              this.sendObserverEmail(invitedObserverEmails, 'd-4d65084481cd488db9829694489c0208')
              .then(() => {
                this.showSnackbar({
                  color: 'success',
                  show: true,
                  text: 'アンケートページを公開しました。時間になったらアンケートを開始してください。'
                })
                setTimeout(() => {
                  this.savingProject = false
                  this.back()
                }, 3000)
              })
              this.sendObserverEmail(canceledObserverEmails, 'd-6e0b3c17bcdc41968e1ecb2f758441f6')
            } else {
              this.back()
            }
          }
        })
        this.createRemind({
          invitationUrl: this.invitationUrl,
          moderatorEmails: this.project.invitedObserverEmails,
          projectRef: this.project.ref,
          title: this.project.title,
          observerEmails: [(firebase.auth().currentUser || {}).email],
          startAt: DateTime.fromJSDate(this.project.startAt).toFormat('yyyy.MM.dd HH:mm'),
          scheduledTime: this.scheduledTime,
          sendAt: this.project.startAt,
        })
      },
      openNdaFile(ndaFileUrl: string) {
         window.open(ndaFileUrl)
      },
      copyInvitationUrl() {
         let invitationUrl: any = document.getElementById('invitationUrl')
         invitationUrl.select()
         document.execCommand('copy')
      },
      back() {
        window.location.href = `/moderator`
      },
      drawNewQuestion() {
        this.newQuestionDrawer = !this.newQuestionDrawer
      },
      drawNewSegment() {
        this.newSegmentDrawer = !this.newSegmentDrawer
      },
      showSnackbar(options: any) {
        this.refs().snackbarRef.showSnackbar(options)
      }
    },
    created() {
      if (!this.$route.query.projectId) {
        this.createProject({
          coverFile: null,
          coModeratorIds: [],
          demographics: [],
          invitedObserverEmails: [],
          moderatorId: (firebase.auth().currentUser || {}).uid,
          maxOfInvitedObservers: 0,
          note: '',
          ndaFile: null,
          participatedObserverRefs: [],
          questionRefs: [],
          status: 'draft',
          timer: 0,
          title: 'プロジェクト（下書き）',
        }).then((project: any) => {
          this.initProject()
          history.replaceState('','', '?projectId=' + project.ref.id)
        })
      } else {
        this.getProject({
          id: this.$route.query.projectId,
        })
        .then(() => {
          this.initProject()
        })
      }
    },
    watch: {
      project() {
        if (this.project.startAt) {
          this.startDate = DateTime.fromJSDate(this.project.startAt).toFormat('yyyy-MM-dd')
          this.startTime = DateTime.fromJSDate(this.project.startAt).toFormat('HH:mm:ss')
        }
      },
      questions() {
        this.scheduledTime = 0
        this.questions.forEach((question: any) => {
          this.scheduledTime += question.time
        })
        this.scheduledTime = this.scheduledTime / 60
      },
      coverFile() {
        this.createProjectCover({
          file: this.coverFile,
          name: this.project.ref.id
        })
        .then(filename => {
          this.project.coverFile = filename
          setTimeout(() => {
            this.getProjectCover({
              name: filename
            })
            .then(url => {
              this.coverUrl = url
            })
          }, 5000)
        })
      },
      ndaFile() {
        this.createNdaFile({
          file: this.ndaFile,
          name: this.project.ref.id
        })
        .then(filename => {
          this.project.ndaFile = filename
          setTimeout(() => {
            this.getNdaFile({
              name: filename
            })
            .then(url => {
              this.ndaFileUrl = url
            })
          }, 5000)
        })
      }
    }
  })
</script>