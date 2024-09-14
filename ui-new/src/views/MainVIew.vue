<template>
  <v-layout id="admin-container">
    <v-app-bar>
      <template v-slot:prepend>
        <v-app-bar-nav-icon v-if="miniWindow" @click="menuer = !menuer"></v-app-bar-nav-icon>
      </template>
      <v-app-bar-title>
        <v-btn icon>
          <img src="@/assets/images/cashbook.png" height="40" alt="logo" />
        </v-btn>
        Cashbook
        <!-- <span>Cashbook</span> -->
        <v-btn @click="showBookDialogFlag.visible = true"> 切换账本 </v-btn>
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props"> 管理 </v-btn>
          </template>
          <v-list>
            <v-list-item class="cursor-pointer" @click="showSetConvertDialog = true">
              类型映射关系维护
            </v-list-item>
            <v-list-item class="cursor-pointer" @click="cleanLoginInfo"> 退出登录 </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar-title>

      <v-btn icon="mdi-close"> </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="menuer" location="left" :width="200">
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          class="menu"
          :class="item.title === openMenu ? 'open-menu' : ''"
        >
          <!-- 一级菜单 -->
          <v-list-item-title
            class="ait-clickable ait-menu-item cursor-pointer"
            @click="toPath(item)"
            v-if="!item.children"
          >
            <v-icon class="menu-icon" :color="item.color" :icon="item.icon"></v-icon>
            <span :style="`font-size: 1.1rem;color:${item.color}`">{{ item.title }}</span>
          </v-list-item-title>

          <!-- 有下级，则形成菜单组，显示二级菜单 -->
          <v-list-group :value="item.title" v-else>
            <template v-slot:activator="{ props }">
              <!-- <v-icon class="menu-icon" :icon="item.icon"></v-icon> -->
              <v-list-item
                class="menu ait-clickable ait-menu-item cursor-pointer"
                v-bind="props"
                :title="item.title"
              >
                <!-- <v-list-item-title>{{ item.title }} </v-list-item-title> -->
              </v-list-item>
            </template>

            <v-list-item
              v-for="(child, i2) in item.children"
              :key="i2"
              class="menu"
              :class="item.title === openMenu ? 'open-menu' : ''"
            >
              <v-list-item-title
                class="ait-clickable ait-menu-item cursor-pointer"
                @click="toPath(child)"
              >
                <v-icon class="menu-icon" :icon="child.icon"></v-icon>
                <span>{{ child.title }}</span>
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
        </v-list-item>
      </v-list>
      <div class="menu-footer">
        <v-switch
          color="warning"
          v-model="themeValue"
          @update:modelValue="toggleTheme()"
          hide-details
          inset
        >
          <template v-slot:label>
            <v-icon
              :icon="themeValue ? 'mdi-emoticon-cool-outline' : 'mdi-weather-night'"
              :color="themeValue ? 'black' : 'white'"
            ></v-icon>
          </template>
        </v-switch>
      </div>
    </v-navigation-drawer>

    <v-main class="page-container">
      <CalendarView v-if="openMenu === '消费日历'" />
      <AnalyticsView v-if="openMenu === '数据分析'" />
      <FlowsView v-if="openMenu === '流水管理'" />
      <BooksView v-if="openMenu === '账本管理'" />
      <TypeView v-if="openMenu === '类型管理'" />
      <AboutView v-if="openMenu === '关于'" />
    </v-main>
    <BookDialog v-if="showBookDialogFlag.visible" />
    <!-- 弹出框表单：类型转换配置 -->
    <SetConvertDialog v-if="showSetConvertDialog" />
  </v-layout>
</template>

<script setup lang="ts">
import { cleanLoginInfo } from '@/utils/common'
import { onMounted, ref } from 'vue'
import CalendarView from './pages/CalendarView.vue'
import AnalyticsView from './pages/AnalyticsView.vue'
import BooksView from './pages/BooksView.vue'
import FlowsView from './pages/FlowsView.vue'
import AboutView from './pages/AboutView.vue'
import TypeView from './pages/TypeView.vue'
import BookDialog from '@/components/dialogs/BookDialog.vue'
import { showSetConvertDialog, showBookDialogFlag } from '@/stores/flag'
import { useTheme } from 'vuetify'
import SetConvertDialog from '@/components/dialogs/SetConvertDialog.vue'

const theme = useTheme()
const themeValue = ref(false)
if (theme.global.name.value == 'light') {
  console.log(theme.global.name.value)
  themeValue.value = true
}
const toggleTheme = () => {
  console.log(themeValue.value)
  theme.global.name.value = theme.global.name.value == 'light' ? 'dark' : 'light'
}

const miniWindow = ref(window.innerWidth < 1280)
const menuer = ref(!miniWindow.value)

type Menu = {
  title: string
  icon?: string
  path?: string
  children?: Menu[]
  color?: string
}

const openMenu = ref<string>('消费日历')

const items = ref<Menu[]>([
  { title: '消费日历', path: '/calendar', icon: 'mdi-calendar-month', color: 'rgb(8,155,229)' },
  { title: '数据分析', path: '/analysis', icon: 'mdi-poll', color: 'rgb(149,117,205' },
  { title: '流水管理', path: '/flows', icon: 'mdi-hand-water', color: 'rgb(76,175,80)' },

  { title: '账本管理', path: '/books', icon: 'mdi-notebook-edit', color: 'rgb(77,182,172)' },
  { title: '类型管理', path: '/types', icon: 'mdi-shape-plus', color: 'rgb(250,140,150)' },
  // {
  //   title: '辅助功能',
  //   icon: 'mdi-hand-water',
  //   children: [
  //     { title: '账本管理', path: '/books', icon: 'mdi-notebook-edit' },
  //     { title: '分类管理', path: '/types', icon: 'mdi-shape-plus' }
  //   ]
  // },
  { title: '关于', path: '/about', icon: 'mdi-information', color: 'rgb(251,140,0)' }
])

const toPath = (menu: Menu) => {
  if (menu.path == '/website/') {
    window.open('https://www.aitlog.com')
    return
  }

  openMenu.value = menu.title
}

const selected = (id: string) => {
  const menuDiv = document.getElementById(id)
  if (menuDiv) {
    menuDiv.className = menuDiv.className + ' open-menu'
  }
}

onMounted(() => {
  if (!localStorage.getItem('bookId')) {
    showBookDialogFlag.value.visible = true
  }
})
</script>

<style scoped>
.page-container {
  width: 100vw;
  height: 100vh;
  overflow: auto;
}

.menu-icon {
  margin: 0 0.5rem;
}

.open-menu {
  background: rgba(205, 255, 200, 0.2);
}
.menu:hover {
  background: rgba(126, 126, 126, 0.2);
}

.menu-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
