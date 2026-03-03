<script setup lang="ts">
import {
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { storeToRefs } from "pinia";
import { useSystemStore } from "~/utils/store";

interface Props {
  bookName: string;
  isMobile: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenConvertDialog: () => void;
  onOpenChangePasswordDialog: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toggleSidebar: [];
  logout: [];
  openAdmin: [];
  openConvertDialog: [];
  openChangePasswordDialog: [];
  showBookDialog: [];
}>();

const systemStore = useSystemStore();
const { globalUserInfo } = storeToRefs(systemStore);

const showUserMenu = ref(false);
</script>

<template>
  <header
    class="bg-surface dark:bg-surface-dark shadow-sm border-b border-frame dark:border-frame-dark"
  >
    <div class="px-2 md:px-4 bg-surface-muted dark:bg-surface-darkMuted">
      <div class="flex justify-between h-12 md:h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            v-if="isMobile"
            @click="emit('toggleSidebar')"
            class="p-2 rounded-md text-green-600 dark:text-green-500 hover:text-green-950 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>

          <!-- Logo and brand -->
          <div class="items-center ml-2 md:ml-0 hidden sm:flex">
            <img src="/logo.png" alt="Cashbook" class="h-8 w-8" />
            <span class="ml-2 text-xl font-bold text-brand-600">
              Cashbook
            </span>
          </div>
        </div>

        <!-- Center - Book info (desktop only) -->
        <div class="flex items-center flex-1 justify-center">
          <div class="flex items-center space-x-2 md:space-x-4">
            <span
              v-if="bookName"
              class="flex text-ink-secondary dark:text-ink-onDark font-medium"
            >
              <span class="hidden md:block">当前账本：</span>{{ bookName }}
            </span>
            <button
              @click="emit('showBookDialog')"
              class="px-2 py-1 md:px-4 md:py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md transition-colors text-xs font-medium"
            >
              切换账本
            </button>
          </div>
        </div>

        <!-- User menu -->
        <div class="relative flex items-center">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-2 px-3 py-2 rounded-md text-ink-secondary dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors"
          >
            <UserCircleIcon class="h-5 w-5" />
            <span v-if="globalUserInfo && !isMobile" class="text-sm">
              {{ globalUserInfo?.name }}
            </span>
            <ChevronDownIcon class="h-4 w-4" />
          </button>

          <!-- User dropdown menu -->
          <Teleport to="body">
            <div
              v-if="showUserMenu"
              @click="showUserMenu = false"
              class="fixed inset-0 z-40"
            >
              <div
                @click.stop
                class="absolute right-4 top-16 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-green-100 dark:border-green-900 z-50"
              >
                <div class="py-1">
                  <button
                    @click="emit('openAdmin')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-ink-secondary dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors"
                  >
                    后台管理
                  </button>
                  <button
                    @click="emit('openConvertDialog')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-ink-secondary dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors"
                  >
                    CSV导入映射配置
                  </button>
                  <button
                    @click="emit('openChangePasswordDialog')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-ink-secondary dark:text-ink-onDark hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors"
                  >
                    修改密码
                  </button>
                  <hr class="my-1 border-frame-light dark:border-frame-dark" />
                  <button
                    @click="emit('logout')"
                    class="w-full px-4 py-2 text-left text-sm text-state-danger dark:text-state-danger hover:bg-surface-soft dark:hover:bg-surface-darkMuted transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
    </div>
  </header>
</template>
