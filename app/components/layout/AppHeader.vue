<script setup lang="ts">
import {
  Bars3Icon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/vue/24/outline";
const userStore = useUserStore();

interface Props {
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
}>();

const showUserMenu = ref(false);
</script>

<template>
  <header
    class="bg-surface shadow-sm border-b border-border"
  >
    <div class="px-2 md:px-4 bg-surface-muted">
      <div class="flex justify-between h-12 md:h-16">
        <!-- Left side -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            v-if="isMobile"
            @click="emit('toggleSidebar')"
            class="p-2 rounded-md text-primary-600 hover:text-primary-700 hover:bg-surface transition-colors"
          >
            <Bars3Icon class="h-6 w-6" />
          </button>

          <!-- Logo and brand -->
          <div class="items-center ml-2 md:ml-0 hidden sm:flex">
            <img src="/logo.webp" alt="Cashbook" class="h-8 w-8" />
            <span class="ml-2 text-xl font-bold text-primary-600">
              Cashbook
            </span>
          </div>
        </div>

        <!-- User menu -->
        <div class="relative flex items-center">
          <button
            @click="showUserMenu = !showUserMenu"
            class="flex items-center space-x-2 px-3 py-2 rounded-md text-foreground/80 hover:bg-surface-muted transition-colors"
          >
            <UserCircleIcon class="h-5 w-5" />
            <span v-if="userStore.user && !isMobile" class="text-sm">
              {{ userStore.user.name }}
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
                class="absolute right-4 top-16 mt-2 w-48 bg-surface rounded-md shadow-lg border border-border z-50"
              >
                <div class="py-1">
                  <button
                    v-if="userStore.isAdmin"
                    @click="emit('openAdmin')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-surface-muted transition-colors"
                  >
                    后台管理
                  </button>
                  <button
                    @click="emit('openConvertDialog')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-surface-muted transition-colors"
                  >
                    CSV导入映射配置
                  </button>
                  <button
                    @click="emit('openChangePasswordDialog')"
                    class="w-full px-4 py-2 text-left text-sm font-medium text-foreground/80 hover:bg-surface-muted transition-colors"
                  >
                    修改密码
                  </button>
                  <hr class="my-1 border-border" />
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
