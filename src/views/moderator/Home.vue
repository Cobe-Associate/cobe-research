<template>
  <v-app>
    <v-app-bar
      app
      clipped-right
      color="blue-grey darken-4"
      dark>
      <v-btn
        icon
        onclick="location.reload()">
        <v-img
          class="ma-4"
          :src="require('../../assets/pengin.svg')"/>
      </v-btn>
      <v-toolbar-title>
        Cobe Research
      </v-toolbar-title>
      <v-toolbar-items>
        <v-btn
          @click="$router.push('/moderator')"
          text>
          プロジェクト
        </v-btn>
        <v-btn
          onclick="window.open('https://cobe.co.jp/', '_blank')"
          text>
          問い合わせ
        </v-btn>
        <v-btn
          v-if="admin"
          @click="$router.push('/admin')"
          text>
          管理
        </v-btn>
      </v-toolbar-items>
      <v-spacer></v-spacer>
      <Profile></Profile>
      <template v-slot:extension>
        <v-toolbar-items>
          <span
            class="mx-12 text-h5">
            {{ organization.name }}
          </span>
        </v-toolbar-items>
        <v-spacer></v-spacer>
        <v-btn
          @click="$router.push('/moderator/new-project')"
          class="primary">
          プロジェクトの作成
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container
        fluid>
        <v-tabs>
          <v-tab
            @click="filterProjectsByStatus(['all'])">
            すべて
          </v-tab>
          <v-tab
            @click="filterProjectsByStatus(['new', 'ready'])">
            実施前
          </v-tab>
          <v-tab
            @click="filterProjectsByStatus(['done'])">
            実施後
          </v-tab>
        </v-tabs>
        <v-row>
          <v-col
            v-for="(project, i) in filteredProjects" :key="i"
            cols=4>
            <v-card>
              <v-img
                class="white--text align-end"
                height="200px"
                style="background-color: #EEE;"
                :src="coverUrls[project.ref.id]">
              </v-img>
              <v-row>
                <v-col
                  cols=8>
                  <v-chip
                    v-if="project.status === 'new'"
                    class="mx-4"
                    color="success">
                    公開
                  </v-chip>
                  <v-chip
                    v-else-if="project.status === 'ready'"
                    class="mx-4"
                    color="success">
                    実施中
                  </v-chip>
                  <v-chip
                    v-else-if="project.status === 'done'"
                    class="mx-4">
                    実施済
                  </v-chip>
                  <v-chip
                    v-else
                    class="mx-4">
                    未公開
                  </v-chip>
                  <small
                    class="secondary--text">
                    {{ project.startJST }}
                  </small>
                </v-col>
                <v-col
                  class="text-right"
                  cols=4>
                  <v-menu>
                    <template v-slot:activator="{on: menu, attrs}">
                      <v-tooltip bottom>
                        <template v-slot:activator="{on: tooltip}">
                          <v-btn
                            v-bind="attrs"
                            v-on="{...tooltip, ...menu}"
                            class="mx-4"
                            icon>
                            <v-icon>mdi-dots-vertical</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </template>
                    <v-list>
                      <v-list-item
                        @click="openCoModeratorDialog(project)">
                        <v-list-item-title>共同モデレーターの追加</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="openObserverChartDialog(project)">
                        <v-list-item-title>参加者の基本情報</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="copyProject(project)">
                        <v-list-item-title>プロジェクトのコピーを作成</v-list-item-title>
                      </v-list-item>
                      <v-list-item
                        @click="deleteProjectAndReload(project.ref)"
                        :disabled="project.status === 'new' || project.status === 'ready' || project.status === 'done' || project.moderatorId !== currentUser.uid">
                        <v-list-item-title>プロジェクトの削除</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-col>
              </v-row>
              <v-card-title>
                {{ project.title }}
                <v-icon
                  v-if="project.coModeratorIds.length > 0"
                  class="mx-2">
                  mdi-account-multiple
                </v-icon>
              </v-card-title>
              <v-card-actions
                class="mx-2">
                <v-btn
                  :to="{
                    path: '/moderator/new-project',
                    query: {
                      projectId: project.id
                    }
                  }"
                  :disabled="project.status === 'ready' || project.status === 'done' || project.moderatorId !== currentUser.uid"
                  outlined
                  text>
                  プロジェクトの編集
                </v-btn>
                <v-btn
                  @click="gotoQuestionnaire(project.id)"
                  :disabled="!(project.status === 'new' || project.status === 'ready' || project.status === 'done')"
                  outlined
                  text>
                  アンケートページへ
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <DeleteProjects
          ref="deleteProjectsRef">
        </DeleteProjects>
        <CoModeratorDialog
          ref="coModeratorDialogRef">
        </CoModeratorDialog>
        <CopyProject
          ref="copyProjectRef">
        </CopyProject>
        <ObserverChartDialog
          ref="observerChartDialogRef">
        </ObserverChartDialog>
      </v-container>
    </v-main>
    <Snackbar
      ref="snackbarRef">
    </Snackbar>
  </v-app>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import firebase from '@/firebase'
  import CoModeratorDialog from '@/components/moderator/CoModeratorDialog.vue'
  import CopyProject from '@/components/moderator/CopyProject.vue'
  import DeleteProjects from '@/components/moderator/DeleteProjects.vue'
  import ObserverChartDialog from '@/components/moderator/ObserverChartDialog.vue'
  import Profile from '@/components/moderator/Profile.vue'
  import Snackbar from '@/components/ui/Snackbar.vue'

  export default Vue.extend({
    components: {
      CoModeratorDialog,
      CopyProject,
      ObserverChartDialog,
      DeleteProjects,
      Profile,
      Snackbar,
    },
    data: () => ({
      admin: false,
      coverUrls: {},
      currentUser: firebase.auth().currentUser || {uid: null, email: null, displayName: null},
      filteredProjects: [],
    }),
    computed: {
      ...mapGetters('OrganizationsOrganizationsModule', ['organizations']),
      ...mapGetters('ProjectsProjectModule', ['projects', 'findProjectsByStatus']),
      ...mapGetters('UiOrganizationModule', ['organization'])
    },
    methods: {
       ...mapActions('OrganizationsOrganizationsModule', ['listOrganizationsByModeratorId']),
      ...mapActions('ProjectsProjectModule', ['listProjectsByCoModerators']),
      ...mapActions('StorageProjectCoverModule', ['getProjectCover']),
      ...mapActions('UiOrganizationModule', ['setUiOrganization']),
      refs(): any {
        return this.$refs
      },
      filterProjectsByStatus(status: Array<string>) {
        if (status.includes('all')) {
          this.filteredProjects = this.projects
        } else {
          this.filteredProjects = this.findProjectsByStatus(status)
        }
      },
      copyProject(project: any) {
        if (window.confirm('プロジェクトのコピーを作成しますか。')) {
          this.refs().copyProjectRef.copy(project)
        }
      },
      deleteProjectAndReload(ref: any) {
        if (window.confirm('プロジェクトを削除しますか。削除した場合、回答結果も削除されます。')) {
          this.refs().deleteProjectsRef.deleteAllProjects([ref])
          this.refs().snackbarRef.showSnackbar({
            color: 'success',
            text: 'プロジェクトを削除しました。'
          })
        }
      },
      async getProjectCovers() {
        const coverUrls: any = {}
        await Promise.all(this.projects.map(async (project: any) => await this.getProjectCover({
          name: project.coverFile
        })
        .then(url => {
          if (url) {
            coverUrls[project.ref.id] = url
          } else {
            coverUrls[project.ref.id] = ''
          }
        })))
        return coverUrls
      },
      gotoQuestionnaire(projectId: string) {
        this.$router.push({
          path: '/moderator/questionnaire',
          query: {
            projectId: projectId
          }
        })
      },
      openCoModeratorDialog(project: any) {
        this.refs().coModeratorDialogRef.openDialog(project)
      },
      openObserverChartDialog(project: any) {
        this.refs().observerChartDialogRef.openDialog(project)
      }
    },
    created() {
      this.listProjectsByCoModerators({
        moderatorId: this.currentUser.uid
      })
      .then(() => {
        this.filteredProjects = this.projects
      })
      // 組織を取得、有効な組織をキャッシュ
      this.listOrganizationsByModeratorId({
        moderatorIds: [this.currentUser.uid]
      })
      .then(() => {
        if (!this.organization.activated) {
          this.organizations.forEach((organization: any) => {
            this.setUiOrganization({
              id: organization.id,
              activated: organization.activated,
              moderatorIds: organization.moderatorIds,
              name: organization.name,
            })
          })
        }
      })
      // 管理者
      if (JSON.parse(process.env.VUE_APP_ADMIN_EMAIL).includes(this.currentUser.email)) {
        this.admin = true
      }
    },
    watch: {
      projects() {
        this.getProjectCovers()
        .then((coverUrls: any) => {
          this.coverUrls = coverUrls
        })
      }
    }
  })
</script>