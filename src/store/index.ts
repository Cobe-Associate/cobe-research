import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import OrganizationsOrganizationsModule from '../store/organizations/organizations'
import OrganizationsModeratorsModule from '../store/organizations/moderators'
import ProjectsAnswersModule from '../store/projects/answers'
import ProjectsObserverModule from '../store/projects/observer'
import ProjectsObserverAnswersModule from '../store/projects/observerAnswers'
import ProjectsProjectModule from '../store/projects/project'
import ProjectsQuestionsModule from '../store/projects/questions'
import ProjectsRemindsModule from '../store/projects/reminds'
import ProjectsResearchTimelinesModule from '../store/projects/researchTimelines'
import ProjectsSegmentsModule from '../store/projects/segments'
import StorageNdaFileModule from '../store/storage/ndaFile'
import StorageProfilePhotoModule from '../store/storage/profilePhoto'
import StorageProjectCoverModule from '../store/storage/projectCover'
import StorageQuestionFileModule from '../store/storage/questionFile'
import UiAnswerTimerModule from '../store/ui/answerTimer'
import UiDetailDataModule from '../store/ui/detailData'
import UiNewQuestionFromDataModule from '../store/ui/newQuestionFromData'
import UiOrganizationModule from '../store/ui/organization'
import UiQuestionnaireTimerModule from '../store/ui/questionnaireTimer'
import UiQuestionFromNewProjectModule from '../store/ui/questionFromNewProject'
import UiSegmentFromNewProjectModule from '../store/ui/segmentFromNewProject'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    OrganizationsOrganizationsModule: OrganizationsOrganizationsModule,
    OrganizationsModeratorsModule: OrganizationsModeratorsModule,
    ProjectsAnswersModule: ProjectsAnswersModule,
    ProjectsObserverModule: ProjectsObserverModule,
    ProjectsObserverAnswersModule: ProjectsObserverAnswersModule,
    ProjectsProjectModule: ProjectsProjectModule,
    ProjectsQuestionsModule: ProjectsQuestionsModule,
    ProjectsRemindsModule: ProjectsRemindsModule,
    ProjectsResearchTimelinesModule: ProjectsResearchTimelinesModule,
    ProjectsSegmentsModule: ProjectsSegmentsModule,
    StorageNdaFileModule: StorageNdaFileModule,
    StorageProfilePhotoModule: StorageProfilePhotoModule,
    StorageProjectCoverModule: StorageProjectCoverModule,
    StorageQuestionFileModule: StorageQuestionFileModule,
    UiAnswerTimerModule: UiAnswerTimerModule,
    UiDetailDataModule: UiDetailDataModule,
    UiNewQuestionFromDataModule: UiNewQuestionFromDataModule,
    UiOrganizationModule: UiOrganizationModule,
    UiQuestionnaireTimerModule: UiQuestionnaireTimerModule,
    UiQuestionFromNewProjectModule: UiQuestionFromNewProjectModule,
    UiSegmentFromNewProjectModule: UiSegmentFromNewProjectModule,
  },
  plugins: [
    createPersistedState({
      key: 'cobe-research-store',
      paths: ['UiOrganizationModule'],
      storage: window.sessionStorage
    })
  ]
})
