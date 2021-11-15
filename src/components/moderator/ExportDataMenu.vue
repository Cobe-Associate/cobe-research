<template>
  <v-menu
    max-width="400"
    offset-y>
    <template
      v-slot:activator="{on}">
    <v-btn
      v-on="on"
      color="white"
      class="mx-4 primary--text">
      データの書き出し
    </v-btn>
    </template>
    <v-list three-line>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>会話のデータ</v-list-item-title>
          <v-list-item-subtitle>すべての質問、及び返答のデータ</v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-btn
              @click="downloadCsvOfAnswerData"
              color="info"
              text>
              CSVをダウンロード
            </v-btn>
            <v-btn
              :to="{
                path: '/moderator/questionnaire/export-data',
                query: {
                  projectId: projectRef.id
                }
              }"
              color="info"
              text
              target="_blank">
              PDFをダウンロード
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>参加者データ</v-list-item-title>
          <v-list-item-subtitle>マトリクス含む参加者のデータ</v-list-item-subtitle>
          <v-list-item-subtitle>
            <v-btn
              @click="downloadCsvOfObservers"
              color="info"
              text>
              CSVをダウンロード
            </v-btn>
            <v-btn
              @click="downloadPdfOfObservers"
              color="info"
              text>
              PDFをダウンロード
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { DateTime } from 'luxon'
  import printJS from 'print-js'
  import { mapGetters, mapActions } from 'vuex'
  import { downloadCsv } from '@/utils/csv'

  export default Vue.extend({
    props: [
      'projectRef'
    ],
    computed: {
      ...mapGetters('ProjectsAnswersModule', ['answers']),
      ...mapGetters('ProjectsQuestionsModule', ['findQuestion']),
      ...mapGetters('ProjectsSegmentsModule', ['segments', 'findSegment']),
    },
    methods: {
      ...mapActions('ProjectsObserverModule', ['findObservers']),
      ...mapActions('ProjectsObserverAnswersModule', ['findObserverAnswers']),
      downloadCsvOfAnswerData() {
        this.findObserverAnswers({
          projectRef: this.projectRef,
        })
        .then(answers => {
          const csv = [['回答者ID', '質問ID', '質問タイプ', '質問ブロック名', '質問内容', 'セグメント名', '選択肢回答', 'スライダー回答ラベル', 'スライダー回答スコア', 'マトリックス回答', 'フリーアンサー', '回答日時']]
          const questions: any = {}
          for (const i in this.answers) {
            questions[this.answers[i].ref.id] = this.findQuestion(this.answers[i].questionRef)
          }
          const segments: any = {}
          for (const i in this.segments) {
            segments[this.segments[i].ref.id] = this.findSegment(this.segments[i].ref)
          }
          const type: any = {
            radio: '単一選択',
            checkbox: '複数選択',
            slider: 'スライダー',
            text: 'テキスト',
            matrixRadio: 'マトリックス単一選択',
            matrixCheckbox: 'マトリックス複数選択',
          }
          for (const i in answers) {
            const row = []
            row.push(answers[i].observerRef.id)
            row.push(questions[answers[i].answerRef.id].ref.id)
            row.push(type[answers[i].type])
            row.push(String(questions[answers[i].answerRef.id].subject))
            row.push(String(questions[answers[i].answerRef.id].body))
            let segmentNames = ''
            for (const j in answers[i].segmentRefs) {
              segmentNames += segments[answers[i].segmentRefs[j].id].name + ' '
            }
            row.push(String(segmentNames))
            row.push(String(answers[i].selects || ''))
            row.push(String(answers[i].sliderLabel || ''))
            row.push(String(answers[i].sliderScore || ''))
            let matrices = ''
            for (const questionItem in answers[i].matrices) {
              matrices += questionItem + '「'
              answers[i].matrices[questionItem].forEach((answerOption: string) => {
                matrices += answerOption + ', '
              })
              matrices += '」 '
            }
            row.push(String(matrices))
            row.push(String(answers[i].text || ''))
            row.push(DateTime.fromJSDate(answers[i].createdAt).toFormat('yyyy.MM.dd HH:mm'))
            csv.push(row)
          }
          downloadCsv(csv, 'answerdata.csv')
        })
      },
      downloadObservers(download :any) {
        this.findObservers({
          projectRef: this.projectRef,
        })
        .then(observers => {
          this.findObserverAnswers({
            projectRef: this.projectRef,
          })
          .then(answers => {
            const segments: any = {}
            for (const i in this.segments) {
              segments[this.segments[i].ref.id] = this.findSegment(this.segments[i].ref)
            }
            const observerSegments: any = {}
            answers.forEach((answer: any) => {
              if (!observerSegments[answer.observerRef.id]) {
                observerSegments[answer.observerRef.id] = []
              }
              answer.segmentRefs.forEach((segmentRef: any) => {
                if (!observerSegments[answer.observerRef.id].includes(segments[segmentRef.id].name)) {
                  observerSegments[answer.observerRef.id].push(segments[segmentRef.id].name)
                }
              })
            })
            download(observers, observerSegments)
          })
        })
      },
      downloadCsvOfObservers() {
        this.downloadObservers((observers: any, observerSegments: any) => {
          const csv = [['回答者ID', 'メールアドレス', '年齢', '性別', '居住地', 'セグメント', '登録日']]
            for (const i in observers) {
              const row = []
              row.push(observers[i].ref.id)
              row.push(observers[i].email)
              row.push(String(observers[i].age))
              row.push(String(observers[i].gender))
              row.push(String(observers[i].residence))
              row.push(String(observerSegments[observers[i].ref.id] || ''))
              row.push(String(DateTime.fromJSDate(observers[i].createdAt).toFormat('yyyy.MM.dd HH:mm')))
              csv.push(row)
            }
            downloadCsv(csv, 'observers.csv')
        })
      },
      downloadPdfOfObservers() {
        this.downloadObservers((observers: any, observerSegments: any) => {
          const pdf = []
          const properties = ['回答者ID', 'メールアドレス', '年齢', '性別', '居住地', 'セグメント', '登録日']
          for (const i in observers) {
            pdf.push({
              '回答者ID': observers[i].ref.id,
              'メールアドレス': observers[i].email,
              '年齢': observers[i].age,
              '性別': observers[i].gender,
              '居住地': observers[i].residence,
              'セグメント': observerSegments[observers[i].ref.id] || '',
              '登録日': DateTime.fromJSDate(observers[i].createdAt).toFormat('yyyy.MM.dd HH:mm')
            })
          }
          printJS({printable: pdf, properties: properties, type: 'json'})
        })
      },
    }
  })
</script>