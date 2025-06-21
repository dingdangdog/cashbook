<script setup lang="ts">
import {
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";

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
    class="tw-bg-white dark:tw-bg-gray-900 tw-shadow-sm tw-border-b tw-border-gray-200 dark:tw-border-gray-700"
  >
    <div class="tw-px-4 tw-sm:px-6 tw-lg:px-8">
      <div class="tw-flex tw-justify-between tw-h-16">
        <!-- Left side -->
        <div class="tw-flex tw-items-center">
          <!-- Mobile menu button -->
          <button
            v-if="isMobile"
            @click="emit('toggleSidebar')"
            class="tw-p-2 tw-rounded-md tw-text-gray-600 dark:tw-text-gray-400 hover:tw-text-gray-900 dark:hover:tw-text-gray-100 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-800 tw-transition-colors"
          >
            <Bars3Icon class="tw-h-6 tw-w-6" />
          </button>

          <!-- Logo and brand -->
          <div class="tw-flex tw-items-center tw-ml-2 md:tw-ml-0">
            <img src="/logo.png" alt="Cashbook" class="tw-h-8 tw-w-8" />
            <span
              class="tw-ml-2 tw-text-xl tw-font-bold tw-text-green-500 tw-hidden sm:tw-block"
            >
              Cashbook
            </span>
          </div>
        </div>

        <!-- Center - Book info (desktop only) -->
        <div
          class="tw-hidden md:tw-flex tw-items-center tw-flex-1 tw-justify-center"
        >
          <div class="tw-flex tw-items-center tw-space-x-4">
            <span
              v-if="bookName"
              class="tw-text-gray-700 dark:tw-text-gray-200 tw-font-medium"
            >
              当前账本：{{ bookName }}
            </span>
            <button
              @click="emit('showBookDialog')"
              class="tw-px-4 tw-py-2 tw-bg-teal-600 hover:tw-bg-teal-700 tw-text-white tw-rounded-md tw-transition-colors tw-text-sm tw-font-medium"
            >
              切换账本
            </button>
          </div>
        </div>

        <!-- Right side -->
        <div class="tw-flex tw-items-center tw-space-x-4">
          <!-- Book switch button (mobile) -->
          <button
            v-if="isMobile"
            @click="emit('showBookDialog')"
            class="tw-px-3 tw-py-1.5 tw-bg-teal-600 hover:tw-bg-teal-700 tw-text-white tw-rounded-md tw-transition-colors tw-text-sm"
          >
            切换账本
          </button>

          <!-- User menu -->
          <div class="tw-relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="tw-flex tw-items-center tw-space-x-2 tw-px-3 tw-py-2 tw-rounded-md tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
            >
              <UserCircleIcon class="tw-h-5 tw-w-5" />
              <span v-if="GlobalUserInfo && !isMobile" class="tw-text-sm">
                {{ GlobalUserInfo.name }}
              </span>
              <ChevronDownIcon class="tw-h-4 tw-w-4" />
            </button>

            <!-- User dropdown menu -->
            <Teleport to="body">
              <div
                v-if="showUserMenu"
                @click="showUserMenu = false"
                class="tw-fixed tw-inset-0 tw-z-40"
              >
                <div
                  @click.stop
                  class="tw-absolute tw-right-4 tw-top-16 tw-mt-2 tw-w-48 tw-bg-white dark:tw-bg-gray-800 tw-rounded-md tw-shadow-lg tw-border tw-border-gray-200 dark:tw-border-gray-700 tw-z-50"
                >
                  <div class="tw-py-1">
                    <button
                      @click="emit('openAdmin')"
                      class="tw-w-full tw-px-4 tw-py-2 tw-text-left tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
                    >
                      后台管理
                    </button>
                    <button
                      @click="emit('openConvertDialog')"
                      class="tw-w-full tw-px-4 tw-py-2 tw-text-left tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
                    >
                      CSV导入映射配置
                    </button>
                    <button
                      @click="emit('openChangePasswordDialog')"
                      class="tw-w-full tw-px-4 tw-py-2 tw-text-left tw-text-sm tw-font-medium tw-text-gray-700 dark:tw-text-gray-200 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
                    >
                      修改密码
                    </button>
                    <hr
                      class="tw-my-1 tw-border-gray-200 dark:tw-border-gray-600"
                    />
                    <button
                      @click="emit('logout')"
                      class="tw-w-full tw-px-4 tw-py-2 tw-text-left tw-text-sm tw-text-red-600 dark:tw-text-red-400 hover:tw-bg-gray-100 dark:hover:tw-bg-gray-700 tw-transition-colors"
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
    </div>
  </header>
</template>
