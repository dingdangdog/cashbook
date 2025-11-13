<script setup lang="ts">
import {
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
import { GlobalUserInfo } from "~/utils/store";

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

const showUserMenu = ref(false);
</script>

<template>
  <header
    class="bg-green-100 dark:bg-green-950/10 shadow-sm border-b border-green-100 dark:border-green-900"
  >
    <div class="px-2 md:px-4">
      <div class="flex justify-between h-12 md:h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            v-if="isMobile"
            @click="emit('toggleSidebar')"
            class="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-green-950 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>

          <!-- Logo and brand -->
          <div class="items-center ml-2 md:ml-0 hidden sm:flex">
            <img src="/logo.png" alt="Cashbook" class="h-8 w-8" />
            <span class="ml-2 text-xl font-bold text-green-500">
              Cashbook
            </span>
          </div>
        </div>

        <!-- Center - Book info (desktop only) -->
        <div class="flex items-center flex-1 justify-center">
          <div class="flex items-center space-x-2 md:space-x-4">
            <span
              v-if="bookName"
              class="flex text-gray-700 dark:text-gray-200 font-medium"
            >
              <span class="hidden md:block">当前账本：</span>{{ bookName }}
            </span>
            <button
              @click="emit('showBookDialog')"
              class="px-3 py-1.5 md:px-4 md:py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              切换账本
            </button>
          </div>
        </div>

        <!-- User menu -->
        <div class="relative flex items-center">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <UserCircleIcon class="h-5 w-5" />
            <span v-if="GlobalUserInfo && !isMobile" class="text-sm">
              {{ GlobalUserInfo.name }}
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
                    class="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    后台管理
                  </button>
                  <button
                    @click="emit('openConvertDialog')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    CSV导入映射配置
                  </button>
                  <button
                    @click="emit('openChangePasswordDialog')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    修改密码
                  </button>
                  <hr class="my-1 border-gray-200 dark:border-gray-600" />
                  <button
                    @click="emit('logout')"
                    class="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
