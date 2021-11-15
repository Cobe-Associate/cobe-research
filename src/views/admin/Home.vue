<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
      color="white">
      <v-btn
        onclick="location.reload()"
        icon>
        <v-img
          class="ma-4"
          :src="require('../../assets/logo.svg')"/>
      </v-btn>
      <v-toolbar-title>
        <span class="font-weight-bold">Cobe</span> <span class="primary--text font-weight-bold">Research</span> <span class="font-weight-bold">管理</span>
      </v-toolbar-title>
      <v-toolbar-items>
      </v-toolbar-items>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-navigation-drawer
      app
      clipped>
      <v-list>
        <v-list-group
          :value="true">
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>管理</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            link
            @click="screen = 'moderators'">
            <v-list-item-content>
              <v-list-item-title>モデレーター</v-list-item-title>
              <v-list-item-subtitle><small>モデレーターの追加など</small></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            link
            @click="screen = 'organizations'">
            <v-list-item-content>
              <v-list-item-title>組織</v-list-item-title>
              <v-list-item-subtitle><small>組織の削除・編集・削除</small></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-item
          link
          href="https://analytics.google.com/analytics/web/#/p241258268/reports/home"
          target="_blank">
          <v-list-item-content>
            <v-list-item-title>分析</v-list-item-title>
            <v-list-item-subtitle><small>モデレーターの利用を分析</small></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <AdminModerators
        v-show="screen === 'moderators'">
      </AdminModerators>
      <AdminOrganizations
        v-show="screen === 'organizations' && $route.query.screen === 'organizations-screen'">
      </AdminOrganizations>
      <v-container
        v-if="screen === 'organizations' && !($route.query.screen === 'organizations-screen')">
        <h2>組織</h2>
        <p><small>組織の追加、編集、削除をおこなえます。</small></p>
        <h3>Coming Soon...</h3>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
  import Vue from 'vue'
  import AdminModerators from '@/components/admin/Moderators.vue'
  import AdminOrganizations from '@/components/admin/Organizations.vue'

  export default Vue.extend({
    components: {
      AdminModerators,
      AdminOrganizations,
    },
    data: () => ({
      screen: 'moderators',
    })
  })
</script>
