<template>
  <v-container>
    <v-form ref="newQuestionForm">
      <v-row
        class="ma-0">
        <v-col
         cols=4>
         <h3>
          <span
            v-if="questionFromNewProject.willUpdate">
            質問の編集
          </span>
          <span
            v-else>
            質問の作成
          </span>
        </h3>
        </v-col>
        <v-col
          cols=8
          class="text-right">
          <v-btn
            @click="$emit('draw-new-question')"
            class="mx-4"
            outlined
            text>
            閉じる
          </v-btn>
          <v-btn
            v-if="questionFromNewProject.willUpdate"
            color="primary"
            @click="editQuestion">
            保存
          </v-btn>
          <v-btn
            v-else
            color="primary"
            @click="createNewQuestion">
            保存
          </v-btn>
        </v-col>
        <v-col
          cols="12">
          <h4>ブロック名</h4>
          <v-text-field
            v-model="question.subject"
            :rules="[required]"
            filled
          ></v-text-field>
          <h4>タイプ</h4>
          <v-radio-group
            v-model="question.type"
            :rules="[required]"
            row>
            <v-radio
              label="通常"
              value="normal">
              </v-radio>
            <v-radio
              label="質問"
              value="question">
            </v-radio>
          </v-radio-group>
          <h4>内容</h4>
          <v-textarea
            v-model="question.body"
            :rules="[required]"
            filled
            rows="3">
          </v-textarea>
          <h4>アップロード</h4>
          <div v-for="(v, i) in files" :key="i">
            <v-file-input
              v-model="files[i]"
              accept="image/gif,image/jpeg,image/png,video/mp4"
              @click:clear="deleteFiles(i)"
              filled>
            </v-file-input>
          </div>
          <v-btn
            @click="addFiles"
            outlined
            text>
            ファイルを追加
          </v-btn>
          <br><br>
          <div v-if="question.type === 'question'">
            <h4>回答タイプ</h4>
            <v-select
              v-model="question.answerType"
              :items="[{text: 'テキスト', value: 'text'}, {text: '選択', value: 'select'}, {text: 'スライダー', value: 'slider'}, {text: 'マトリックス', value: 'matrix'}]"
              :rules="[required]"
              filled>
            </v-select>
            <v-checkbox
              v-show="question.answerType === 'select' || question.answerType === 'slider'"
              v-model="question.isFreeAnswer"
              label="フリーテキストの回答も含む">
            </v-checkbox>
            <div v-if="question.answerType === 'select'">
              <h4>回答個数</h4>
              <v-radio-group
                v-model="answerSelection"
                :rules="[required]"
                row>
                <v-radio
                  label="単一"
                  value="single">
                  </v-radio>
                <v-radio
                  label="複数"
                  value="multiple">
                </v-radio>
              </v-radio-group>
              <h4>回答選択肢</h4>
              <div v-for="(v, i) in question.answerOptions" :key="i">
                <v-text-field
                  v-model="question.answerOptions[i]"
                  :append-outer-icon="'mdi-delete-outline'"
                  @click:append-outer="deleteAnswerOption(i)"
                  :rules="[required]"
                  filled
                  placeholder="入力してください"
                ></v-text-field>
              </div>
              <v-btn
                @click="addAnswerOption"
                outlined
                text>
                選択肢を追加
              </v-btn>
              <br><br>
            </div>
            <div v-if="question.answerType === 'slider'">
              <v-row>
                <v-col
                  cols="6">
                  <h4>左側のラベル</h4>
                  <v-text-field
                    v-model="question.answerSliderLabel[0]"
                    :rules="[required]"
                    filled
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="6">
                  <h4>右側のラベル</h4>
                  <v-text-field
                    v-model="question.answerSliderLabel[1]"
                    :rules="[required]"
                    filled
                  ></v-text-field>
                </v-col>
              </v-row>
              <h4>プレビュー</h4>
              <v-range-slider
                :tick-labels="question.answerSliderLabel"
                :value="[0, 1]"
                min="0"
                max="1"
                tick-size="2"
              >
              </v-range-slider>
              <br>
            </div>
            <div v-if="question.answerType === 'matrix'">
              <h4>回答個数</h4>
              <v-radio-group
                v-model="answerSelection"
                :rules="[required]"
                row>
                <v-radio
                  label="単一"
                  value="single">
                  </v-radio>
                <v-radio
                  label="複数"
                  value="multiple">
                </v-radio>
              </v-radio-group>
              <h4>回答選択肢（縦）</h4>
              <div v-for="(v, i) in question.answerOptions" :key="'answerOption' + i">
                <v-text-field
                  v-model="question.answerOptions[i]"
                  :append-outer-icon="'mdi-delete-outline'"
                  @click:append-outer="deleteAnswerOption(i)"
                  :rules="[required]"
                  filled
                  placeholder="入力してください"
                ></v-text-field>
              </div>
              <v-btn
                @click="addAnswerOption"
                outlined
                text>
                選択肢を追加
              </v-btn>
              <br><br>
              <h4>回答選択肢（横）</h4>
              <div v-for="(v, i) in question.questionItems" :key="'questionItem' + i">
                <v-text-field
                  v-model="question.questionItems[i]"
                  :append-outer-icon="'mdi-delete-outline'"
                  @click:append-outer="deleteQuestionItem(i)"
                  :rules="[required]"
                  filled
                  placeholder="入力してください"
                ></v-text-field>
              </div>
              <v-btn
                @click="addQuestionItem"
                outlined
                text>
                選択肢を追加
              </v-btn>
              <br><br>
            </div>
          </div>
          <h4>配分時間</h4>
          <v-select
            v-model="question.time"
            :items="[{text: '1分', value: 60}, {text: '1分30秒', value: 90}, {text: '2分', value: 120}, {text: '2分30秒', value: 150}, {text: '3分', value: 180}]"
            :rules="[required]"
            filled>
          </v-select>
          <h4>ノート</h4>
          <v-textarea
            v-model="question.note"
            filled
            placeholder=""
            rows="3">
          </v-textarea>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { mapGetters, mapActions } from 'vuex'
  import { getFileMeta } from '@/utils/file-meta'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    data: () => ({
      answerSelection: 'single',
      files: [null] as Array<File | null>,
      beforeFilenames: [] as Array<string>,
      question: {
        answerType: '',
        answerOptions: [''],
        answerSliderLabel: ['同意しない', '同意する'],
        body: '',
        files: [null] as Array<string | null>,
        isFreeAnswer: false,
        note: null,
        projectRef: null,
        questionItems: [''],
        subject: '',
        time: 60,
        type: 'normal'
      },
      required: (v: any) => !!v || '入力してください',
    }),
    computed: {
      ...mapGetters('ProjectsProjectModule', ['project']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('UiNewQuestionFromDataModule', ['newQuestionFromData']),
      ...mapGetters('UiQuestionFromNewProjectModule', ['questionFromNewProject']),
    },
    methods: {
      ...mapActions('ProjectsProjectModule', ['updateProject']),
      ...mapActions('ProjectsQuestionsModule', ['createQuestion', 'updateQuestion']),
      ...mapActions('StorageQuestionFileModule', ['getQuestionFile', 'createQuestionFile', 'deleteQuestionFile']),
      refs(): any {
        return this.$refs
      },
      resetForm() {
        this.refs().newQuestionForm.reset()
        setTimeout(() => {
          this.question = {
            answerType: '',
            answerOptions: [''],
            answerSliderLabel: ['同意しない', '同意する'],
            body: '',
            files: [null],
            isFreeAnswer: false,
            note: null,
            projectRef: null,
            questionItems: [''],
            subject: '',
            time: 60,
            type: 'normal'
          }
          this.files = [null]
          this.beforeFilenames = []
          this.answerSelection = 'single'
        }, 100)
      },
      mapQuestion() {
        if (this.question.answerType !== 'select') {
          if (this.question.answerType !== 'matrix') {
            this.question.answerOptions = []
          }
        } else {
          this.question.questionItems = []
        }
        if (this.question.answerType !== 'slider') {
          this.question.answerSliderLabel = []
        }
        if (this.question.type === 'normal') {
          this.question.answerType = null as any
        }
        if (this.question.answerType === 'select') {
          if (this.answerSelection === 'single') {
            this.question.answerType = 'radio'
          } else if (this.answerSelection === 'multiple') {
            this.question.answerType = 'checkbox'
          }
        }
        if (this.question.answerType === 'matrix') {
          if (this.answerSelection === 'single') {
            this.question.answerType = 'matrixRadio'
          } else if (this.answerSelection === 'multiple') {
            this.question.answerType = 'matrixCheckbox'
          }
        }
        for (const i in this.question.answerOptions) {
          this.question.answerOptions[i] = this.question.answerOptions[i].replace(/\./g, '').trim()
        }
        for (const i in this.question.questionItems) {
          this.question.questionItems[i] = this.question.questionItems[i].replace(/\./g, '').trim()
        }
      },
      async getFiles(filenames: Array<string>) {
        if (filenames.length === 0) {
          this.files = [null]
          return
        }
        this.files = []
        await Promise.all(filenames.map(async filename => await this.getQuestionFile({
          name: filename
        })
        .then(url => {
          fetch(url)
          .then(res => res.blob())
          .then(blob => {
            const fileMeta = getFileMeta(filename)
            if (fileMeta) {
              this.files.push(new File([blob], filename, {
                type: fileMeta.mimeType,
              }))
              this.beforeFilenames.push(filename)
            }
          })
        })))
      },
      async putFiles() {
        const filenames: Array<string> = []
        this.files.forEach(file => {
          if (file) {
            filenames.push(file.name)
          }
        })
        // クリアしたファイルを削除
        const deletedFilenames: Array<string> = this.beforeFilenames.filter(i => !filenames.includes(i))
        await Promise.all(deletedFilenames.map(async name => await this.deleteQuestionFile({
          name: name
        })))
        // ファイルを追加。また、name があれば更新
        const names: Array<string> = []
        await Promise.all(this.files.map(async (file: any) => await this.createQuestionFile({
          file: file,
          name: (this.beforeFilenames.includes((file || {}).name)) ? file.name : null,
        }).then(name => {
          if (name) {
            names.push(name)
          }
        })))
        return names
      },
      createNewQuestion() {
        if (!this.refs().newQuestionForm.validate()) {
          return
        }
        this.question.projectRef = this.projectRef
        this.mapQuestion()
        this.putFiles()
        .then(names => {
          this.question.files = names
          this.createQuestion(Object.assign({}, this.question))
          .then(question => {
            if (!question) {
              this.$emit('show-snackbar', {
                color: 'error',
                show: true,
                text: '質問を作成できませんでした。'
              })
              return
            }
            this.project.questionRefs.push(question.ref)
            this.updateProject({
              ref: this.projectRef,
              questionRefs: this.project.questionRefs
            }).then(() => {
              this.resetForm()
            })
            this.$emit('show-snackbar', {
              color: 'success',
              show: true,
              text: '質問を作成しました。'
            })
            this.$emit('draw-new-question')
          })
        })
      },
      editQuestion() {
        if (!this.refs().newQuestionForm.validate()) {
          return
        }
        this.mapQuestion()
        this.putFiles()
        .then(names => {
          this.question.files = names
          this.updateQuestion(Object.assign({}, this.question))
          .then(() => {
            this.resetForm()
            this.$emit('show-snackbar', {
              color: 'success',
              show: true,
              text: '質問を更新しました。'
            })
            this.$emit('draw-new-question')
          })
        })
      },
      addAnswerOption() {
        this.question.answerOptions.push('')
      },
      deleteAnswerOption(i: number) {
        if (this.question.answerOptions.length <= 1) {
          return
        }
        this.question.answerOptions.splice(i, 1)
      },
      addQuestionItem() {
        this.question.questionItems.push('')
      },
      deleteQuestionItem(i: number) {
        if (this.question.questionItems.length <= 1) {
          return
        }
        this.question.questionItems.splice(i, 1)
      },
      addFiles() {
        this.files.push(null)
      },
      deleteFiles(i: number) {
        if (this.files.length <= 1) {
          return
        }
        Vue.set(this.files, i, null)
      }
    },
    watch: {
      newQuestionFromData() {
        const question = this.findQuestion(this.newQuestionFromData.questionRef)
        this.question.answerType = 'slider'
        this.question.answerSliderLabel = ['同意しない', '同意する'],
        this.question.body = this.newQuestionFromData.questionBody
        this.question.isFreeAnswer = false
        this.question.projectRef = this.projectRef
        this.question.subject = question.subject
        this.question.time = 60
        this.question.type = 'question'
        this.$emit('draw-new-question')
      },
      questionFromNewProject() {
        if (this.questionFromNewProject.willUpdate) {
          const question = this.findQuestion(this.questionFromNewProject.questionRef)
          this.question = Object.assign({}, question)
          this.getFiles(question.files)
          if (this.question.answerType === 'radio') {
            this.question.answerType = 'select'
            this.answerSelection = 'single'
          } else if (this.question.answerType === 'checkbox') {
            this.question.answerType = 'select'
            this.answerSelection = 'multiple'
          } else if (this.question.answerType === 'matrixRadio') {
            this.question.answerType = 'matrix'
            this.answerSelection = 'single'
          } else if (this.question.answerType === 'matrixCheckbox') {
            this.question.answerType = 'matrix'
            this.answerSelection = 'multiple'
          }
        } else {
          this.resetForm()
        }
      }
    }
  })
</script>
