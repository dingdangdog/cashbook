<script setup lang="ts">
import { doApi } from "~/utils/api";
import { Alert } from "~/utils/alert";
import {
  PlusIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ArrowDownIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from "@heroicons/vue/24/outline";
import MarkdownIt from "markdown-it";
import UiComboInput from "~/components/ui/ComboInput.vue";

export interface ChatSession {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface AIProviderOption {
  id: string;
  name: string;
}

const props = withDefaults(
  defineProps<{
    isMobile?: boolean;
    showSessionList?: boolean;
    /** 移动端从「会话列表」点返回时调用的回调（返回应用） */
    mobileBackToApp?: () => void;
  }>(),
  { isMobile: false, showSessionList: true },
);

const sessions = ref<ChatSession[]>([]);
const currentSessionId = ref<number | null>(null);
const messages = ref<ChatMessage[]>([]);
const loading = ref(false);
const sending = ref(false);
const inputText = ref("");
const sessionDrawerOpen = ref(false);
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

/** AI 服务商：可选列表与当前选中 */
const aiProviders = ref<AIProviderOption[]>([]);
const selectedProviderId = ref<string | null>(null);
const selectedProviderName = ref("");

/** 移动端双视图：list = 会话列表全屏，chat = 对话全屏 */
const mobileView = ref<"list" | "chat">("list");

/** 对话区域滚动容器（移动端 / 桌面端各一） */
const mobileChatScrollRef = ref<HTMLElement | null>(null);
const desktopChatScrollRef = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    const el =
      props.isMobile && props.showSessionList && mobileView.value === "chat"
        ? mobileChatScrollRef.value
        : desktopChatScrollRef.value;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  });
};

/** 对话气泡复位：滚动到底部，避免拖动/选中导致的错位 */
const resetChatBubbles = () => {
  scrollToBottom();
};

const openDrawer = () => {
  sessionDrawerOpen.value = true;
};
const closeDrawer = () => {
  sessionDrawerOpen.value = false;
};
const selectSessionAndClose = (id: number) => {
  selectSession(id);
  if (props.isMobile) {
    closeDrawer();
    mobileView.value = "chat";
  }
};

const goToList = () => {
  mobileView.value = "list";
};
const goToChat = (id: number) => {
  selectSession(id);
  mobileView.value = "chat";
};
const createAndGoToChat = async () => {
  await createSession();
  if (props.isMobile) mobileView.value = "chat";
};

const loadProviders = async () => {
  try {
    const list = await doApi.get<AIProviderOption[]>("api/entry/ai/providers");
    aiProviders.value = list ?? [];
    const first = aiProviders.value[0];
    if (first && !selectedProviderId.value) {
      selectedProviderId.value = first.id;
      selectedProviderName.value = first.name;
    }
  } catch {
    aiProviders.value = [];
  }
};

const loadSessions = async () => {
  loading.value = true;
  try {
    const list = await doApi.get<ChatSession[]>("api/entry/ai/sessions");
    sessions.value = list ?? [];
    const firstSession = sessions.value[0];
    if (firstSession && currentSessionId.value == null && !props.isMobile) {
      currentSessionId.value = firstSession.id;
    }
  } catch {
    sessions.value = [];
  } finally {
    loading.value = false;
  }
};

const loadMessages = async (sessionId: number) => {
  if (!sessionId) {
    messages.value = [];
    return;
  }
  const prevLen = messages.value.length;
  const prevLastId = messages.value[prevLen - 1]?.id;
  loading.value = true;
  try {
    const list = await doApi.get<ChatMessage[]>(
      `api/entry/ai/sessions/${sessionId}/messages`,
    );
    messages.value = list ?? [];
  } catch {
    messages.value = [];
  } finally {
    loading.value = false;
    const nowLen = messages.value.length;
    const nowLastId = messages.value[nowLen - 1]?.id;
    if (nowLen !== prevLen || nowLastId !== prevLastId) scrollToBottom();
  }
};

const selectSession = (id: number) => {
  currentSessionId.value = id;
  loadMessages(id);
};

const createSession = async () => {
  sending.value = true;
  try {
    const session = await doApi.post<{ id: number }>("api/entry/ai/sessions");
    if (session?.id) {
      await loadSessions();
      currentSessionId.value = session.id;
      messages.value = [];
    }
  } catch {
    Alert.error("创建会话失败");
  } finally {
    sending.value = false;
  }
};

const deleteSession = async (id: number, e: Event) => {
  e.stopPropagation();
  try {
    await doApi.delete(`api/entry/ai/sessions/${id}`);
    await loadSessions();
    if (currentSessionId.value === id) {
      currentSessionId.value =
        sessions.value.find((s) => s.id !== id)?.id ?? null;
      await loadMessages(currentSessionId.value ?? 0);
    }
  } catch {
    Alert.error("删除失败");
  }
};

/** 正在编辑标题的会话 id */
const editingSessionId = ref<number | null>(null);
const editingTitle = ref("");

const startEditTitle = (s: ChatSession, e: Event) => {
  e.stopPropagation();
  editingSessionId.value = s.id;
  editingTitle.value = s.title || "新对话";
  // 延后一帧再用原生 DOM 聚焦，避免 v-for/v-if 下 ref 时机或数组问题
  setTimeout(() => {
    const input = document.querySelector<HTMLInputElement>(
      "[data-jimi-edit-title-input]",
    );
    input?.focus();
  }, 0);
};

const cancelEditTitle = () => {
  editingSessionId.value = null;
  editingTitle.value = "";
};

const saveSessionTitle = async (sessionId: number) => {
  if (editingSessionId.value === null) return;
  const title = editingTitle.value.trim() || null;
  try {
    await doApi.patch<{ title: string | null }>(
      `api/entry/ai/sessions/${sessionId}`,
      { title },
    );
    await loadSessions();
  } catch {
    Alert.error("保存标题失败");
  }
  cancelEditTitle();
};

const sendMessage = async () => {
  const text = inputText.value.trim();
  if (!text || sending.value) return;

  inputText.value = "";
  const userMsg: ChatMessage = {
    id: 0,
    role: "user",
    content: text,
    createdAt: new Date().toISOString(),
  };
  messages.value = [...messages.value, userMsg];
  sending.value = true;
  scrollToBottom();

  try {
    const res = await doApi.post<{
      content: string;
      sessionId: number;
    }>("api/entry/ai/chat", {
      sessionId: currentSessionId.value ?? undefined,
      content: text,
      providerId: selectedProviderId.value ?? undefined,
    });
    if (res?.sessionId != null) {
      currentSessionId.value = res.sessionId;
      await loadSessions();
      await loadMessages(res.sessionId);
    } else {
      const assistantMsg: ChatMessage = {
        id: 0,
        role: "assistant",
        content: res?.content ?? "无回复",
        createdAt: new Date().toISOString(),
      };
      messages.value = [...messages.value, assistantMsg];
      scrollToBottom();
    }
  } catch {
    messages.value = messages.value.filter((m) => m !== userMsg);
    Alert.error("发送失败");
  } finally {
    sending.value = false;
  }
};

/** 点击历史用户消息重试：用该条内容重新请求并追加回复 */
const retryWithMessage = async (content: string) => {
  if (!content?.trim() || sending.value) return;
  sending.value = true;
  scrollToBottom();
  try {
    const res = await doApi.post<{
      content: string;
      sessionId: number;
    }>("api/entry/ai/chat", {
      sessionId: currentSessionId.value ?? undefined,
      content: content.trim(),
      providerId: selectedProviderId.value ?? undefined,
    });
    if (res?.sessionId != null) {
      currentSessionId.value = res.sessionId;
      await loadSessions();
      await loadMessages(res.sessionId);
    } else {
      const assistantMsg: ChatMessage = {
        id: 0,
        role: "assistant",
        content: res?.content ?? "无回复",
        createdAt: new Date().toISOString(),
      };
      messages.value = [...messages.value, assistantMsg];
      scrollToBottom();
    }
  } catch {
    Alert.error("发送失败");
  } finally {
    sending.value = false;
  }
};

const currentSessionTitle = computed(
  () =>
    sessions.value.find((s) => s.id === currentSessionId.value)?.title ||
    "Jimi 助手",
);

const providerOptions = computed(() => aiProviders.value.map((p) => p.name));

const renderAssistantMarkdown = (content: string) => {
  return md.render(content || "");
};

onMounted(() => {
  loadProviders();
  loadSessions();
});

watch(selectedProviderId, (id) => {
  if (id) {
    const p = aiProviders.value.find((x) => x.id === id);
    if (p) selectedProviderName.value = p.name;
  } else {
    selectedProviderName.value = "";
  }
});

watch(selectedProviderName, (name) => {
  const p = aiProviders.value.find((x) => x.name === name);
  selectedProviderId.value = p?.id ?? null;
});

watch(
  () => currentSessionId.value,
  (id) => {
    if (id) loadMessages(id);
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex h-full min-h-0 bg-background text-foreground">
    <!-- ========== 移动端：全屏双视图（先列表 or 对话） ========== -->
    <template v-if="isMobile && showSessionList">
      <!-- 视图：会话列表（类似微信对话列表） -->
      <div v-show="mobileView === 'list'" class="flex h-full w-full flex-col">
        <header
          class="flex flex-shrink-0 items-center gap-3 border-b border-border bg-surface px-3 py-2 pt-[env(safe-area-inset-top)]"
          style="padding-top: max(0.5rem, env(safe-area-inset-top))"
        >
          <button
            type="button"
            class="-ml-1 flex items-center justify-center rounded-full p-2 text-foreground hover:bg-surface-muted active:opacity-80"
            aria-label="返回"
            @click="mobileBackToApp?.()"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>
          <h1 class="flex-1 text-center text-base font-semibold">对话</h1>
          <button
            type="button"
            class="rounded-full p-2 text-primary-600 hover:bg-primary-500/15 active:opacity-80"
            aria-label="新对话"
            @click="createAndGoToChat"
          >
            <PlusIcon class="h-6 w-6" />
          </button>
        </header>
        <div class="flex-1 overflow-y-auto">
          <template v-if="loading && sessions.length === 0">
            <div
              class="flex flex-col items-center justify-center py-16 text-foreground/50"
            >
              <span class="text-sm">加载中...</span>
            </div>
          </template>
          <template v-else-if="sessions.length === 0">
            <div
              class="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center text-foreground/60"
            >
              <ChatBubbleLeftRightIcon class="h-14 w-14" />
              <p class="text-sm">暂无对话</p>
              <button
                type="button"
                class="rounded-full bg-primary-500 px-5 py-2 text-sm font-medium text-white"
                @click="createAndGoToChat"
              >
                开始新对话
              </button>
            </div>
          </template>
          <ul v-else class="divide-y divide-border">
            <li
              v-for="s in sessions"
              :key="s.id"
              class="flex items-center gap-3 bg-surface px-4 py-3 active:bg-surface-muted"
            >
              <button
                type="button"
                class="flex min-w-0 flex-1 items-center gap-3 text-left"
                @click="goToChat(s.id)"
              >
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/20 text-primary-600"
                >
                  <ChatBubbleLeftRightIcon class="h-5 w-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[15px] font-medium text-foreground">
                    {{ s.title || "新对话" }}
                  </p>
                  <p class="truncate text-xs text-foreground/50">对话</p>
                </div>
              </button>
              <button
                type="button"
                class="flex-shrink-0 rounded-full p-2 text-foreground/40 hover:bg-surface-muted hover:text-foreground"
                aria-label="删除"
                @click="(e: Event) => deleteSession(s.id, e)"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 视图：对话（全屏聊天） -->
      <div v-show="mobileView === 'chat'" class="flex h-full w-full flex-col">
        <header
          class="flex flex-shrink-0 items-center gap-2 border-b border-border bg-surface px-2 py-2"
          style="padding-top: max(0.5rem, env(safe-area-inset-top))"
        >
          <button
            type="button"
            class="flex items-center justify-center rounded-full p-2 text-foreground hover:bg-surface-muted active:opacity-80"
            aria-label="返回对话列表"
            @click="goToList"
          >
            <ChevronLeftIcon class="h-6 w-6" />
          </button>
          <h2
            class="min-w-0 flex-1 truncate text-center text-base font-semibold"
          >
            {{ currentSessionTitle }}
          </h2>
          <button
            type="button"
            class="flex-shrink-0 rounded-full p-2 text-foreground/60 hover:bg-surface-muted hover:text-foreground"
            aria-label="复位对话"
            title="复位到底部"
            @click="resetChatBubbles"
          >
            <ArrowDownIcon class="h-5 w-5" />
          </button>
        </header>
        <!-- 移动端对话页：当前 AI 服务商 -->
        <div
          v-if="aiProviders.length > 0"
          class="flex flex-shrink-0 items-center gap-2 border-b border-border bg-surface-muted/50 px-3 py-2"
        >
          <span class="text-xs text-foreground/60">AI 服务商</span>
          <UiComboInput
            v-model="selectedProviderName"
            placeholder="选择服务商"
            :options="providerOptions"
            class="flex-1 min-w-0"
          />
        </div>
        <div
          ref="mobileChatScrollRef"
          class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 touch-pan-y select-text"
        >
          <template v-if="!currentSessionId && messages.length === 0">
            <div
              class="flex flex-col items-center justify-center gap-4 py-12 text-center text-foreground/60"
            >
              <ChatBubbleLeftRightIcon class="h-14 w-14" />
              <p class="text-sm">
                直接说「记一笔午饭 50」或「添加资金账户：微信、支付宝、招商银行卡」
              </p>
            </div>
          </template>
          <template v-else>
            <div class="space-y-3">
              <template v-for="(msg, i) in messages" :key="i">
                <div
                  class="flex"
                  :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[82%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug"
                    :class="
                      msg.role === 'user'
                        ? 'group rounded-br-md bg-primary-500 text-white'
                        : 'rounded-bl-md bg-surface-muted text-foreground'
                    "
                  >
                    <div
                      v-if="msg.role === 'assistant'"
                      class="jimi-markdown break-words"
                      v-html="renderAssistantMarkdown(msg.content)"
                    />
                    <template v-else>
                      <div class="whitespace-pre-wrap break-words">
                        {{ msg.content }}
                      </div>
                      <div
                        class="mt-2 flex justify-end border-t border-white/20 pt-1.5"
                      >
                        <button
                          type="button"
                          class="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs opacity-80 transition hover:bg-white/20 hover:opacity-100 active:opacity-90"
                          :disabled="sending"
                          @click.stop="retryWithMessage(msg.content)"
                        >
                          <ArrowPathIcon class="h-3.5 w-3.5" />
                          重试
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
              <div
                v-if="sending && messages[messages.length - 1]?.role === 'user'"
                class="flex justify-start"
              >
                <div
                  class="rounded-2xl rounded-bl-md bg-surface-muted px-4 py-2.5 text-[15px] text-foreground/60"
                >
                  正在回复...
                </div>
              </div>
            </div>
          </template>
        </div>
        <div
          class="flex-shrink-0 border-t border-border bg-surface px-3 pb-3 pt-2"
          style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom))"
        >
          <form class="flex items-end gap-2" @submit.prevent="sendMessage">
            <input
              v-model="inputText"
              type="text"
              placeholder="输入消息..."
              class="min-h-[44px] flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-[15px] text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              :disabled="sending"
            />
            <button
              type="submit"
              class="flex h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm transition active:opacity-90 disabled:opacity-40"
              :disabled="sending || !inputText.trim()"
            >
              <PaperAirplaneIcon class="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </template>

    <!-- ========== 桌面端：侧栏 + 消息区 ========== -->
    <template v-else>
      <template v-if="showSessionList">
        <div
          v-if="isMobile && sessionDrawerOpen"
          class="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden
          @click="closeDrawer"
        />
        <aside
          class="flex flex-shrink-0 flex-col border-r border-border bg-surface transition-transform duration-200 ease-out"
          :class="
            isMobile ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-xl' : 'w-52'
          "
          :style="
            isMobile && !sessionDrawerOpen
              ? { transform: 'translateX(-100%)' }
              : undefined
          "
        >
          <div
            class="flex items-center justify-between border-b border-border px-3 py-2"
          >
            <span class="text-sm font-medium text-foreground/80">对话记录</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded p-1 text-foreground/60 hover:bg-surface-muted hover:text-foreground"
                title="新对话"
                @click="createSession"
              >
                <PlusIcon class="h-5 w-5" />
              </button>
              <button
                v-if="isMobile"
                type="button"
                class="rounded p-1 text-foreground/60 hover:bg-surface-muted hover:text-foreground"
                aria-label="关闭"
                @click="closeDrawer"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto">
            <template v-if="loading && sessions.length === 0">
              <div class="p-4 text-center text-sm text-foreground/50">
                加载中...
              </div>
            </template>
            <template v-else-if="sessions.length === 0">
              <div class="p-4 text-center text-sm text-foreground/50">
                暂无对话，发送消息将自动创建
              </div>
            </template>
            <div
              v-for="s in sessions"
              :key="s.id"
              class="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm transition hover:bg-surface-muted"
              :class="{
                'bg-primary-500/15 text-primary-700': currentSessionId === s.id,
              }"
            >
              <template v-if="editingSessionId === s.id">
                <input
                  data-jimi-edit-title-input
                  v-model="editingTitle"
                  type="text"
                  class="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="标题"
                  maxlength="200"
                  @click.stop
                  @keydown.enter.prevent="saveSessionTitle(s.id)"
                  @keydown.escape="cancelEditTitle"
                  @blur="saveSessionTitle(s.id)"
                />
              </template>
              <template v-else>
                <button
                  type="button"
                  class="min-w-0 flex-1 truncate text-left"
                  @click="
                    isMobile ? selectSessionAndClose(s.id) : selectSession(s.id)
                  "
                >
                  {{ s.title || "新对话" }}
                </button>
                <button
                  type="button"
                  class="flex-shrink-0 rounded p-0.5 text-foreground/50 hover:bg-surface-muted hover:text-foreground"
                  title="编辑标题"
                  @click.stop="startEditTitle(s, $event)"
                >
                  <PencilSquareIcon class="h-4 w-4" />
                </button>
              </template>
              <span
                v-if="editingSessionId !== s.id"
                role="button"
                tabindex="0"
                class="flex-shrink-0 cursor-pointer rounded p-0.5 opacity-60 hover:opacity-100"
                title="删除"
                @click.stop="(e: Event) => deleteSession(s.id, e)"
                @keydown.enter.prevent="(e: Event) => deleteSession(s.id, e)"
              >
                <TrashIcon class="h-4 w-4" />
              </span>
            </div>
          </div>
        </aside>
      </template>

      <div class="flex flex-1 flex-col min-w-0">
        <!-- 桌面端：AI 服务商选择 -->
        <div
          v-if="!isMobile && aiProviders.length > 0"
          class="flex flex-shrink-0 items-center gap-3 border-b border-border bg-surface-muted/50 px-4 py-2"
        >
          <span class="text-sm text-foreground/70">AI 服务商</span>
          <div class="w-48">
            <UiComboInput
              v-model="selectedProviderName"
              placeholder="选择服务商"
              :options="providerOptions"
            />
          </div>
        </div>
        <div
          v-if="showSessionList && isMobile"
          class="flex flex-shrink-0 items-center gap-2 border-b border-border bg-surface px-3 py-2"
        >
          <button
            type="button"
            class="rounded p-1.5 text-foreground/80 hover:bg-surface-muted"
            aria-label="对话列表"
            @click="openDrawer"
          >
            <Bars3Icon class="h-5 w-5" />
          </button>
          <span class="min-w-0 flex-1 truncate text-sm text-foreground/80">
            {{ currentSessionTitle }}
          </span>
        </div>
        <div
          v-if="!currentSessionId && messages.length === 0"
          class="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-foreground/60"
        >
          <ChatBubbleLeftRightIcon class="h-16 w-16" />
          <p class="text-sm">
            我是 Jimi，你的记账助手。直接说「记一笔午饭
            50」、「本月花了多少」或「添加资金账户：微信、支付宝、银行卡」即可。
          </p>
          <p class="text-xs">发送任意消息将自动创建新对话。</p>
        </div>

        <div
          ref="desktopChatScrollRef"
          v-else
          class="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 touch-pan-y select-text"
        >
          <template v-for="(msg, i) in messages" :key="i">
            <div
              class="flex gap-3"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[85%] rounded-lg px-3 py-2 text-sm"
                :class="
                  msg.role === 'user'
                    ? 'group bg-primary-500 text-white'
                    : 'bg-surface-muted text-foreground'
                "
              >
                <div
                  v-if="msg.role === 'assistant'"
                  class="jimi-markdown break-words"
                  v-html="renderAssistantMarkdown(msg.content)"
                />
                <template v-else>
                  <div class="whitespace-pre-wrap break-words">
                    {{ msg.content }}
                  </div>
                  <div
                    class="mt-1.5 flex justify-end border-t border-white/20 pt-1"
                  >
                    <button
                      type="button"
                      class="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs opacity-70 transition hover:bg-white/20 hover:opacity-100"
                      :disabled="sending"
                      title="用此内容重新发送"
                      @click.stop="retryWithMessage(msg.content)"
                    >
                      <ArrowPathIcon class="h-3 w-3" />
                      重试
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </template>
          <div
            v-if="sending && messages[messages.length - 1]?.role === 'user'"
            class="flex justify-start"
          >
            <div
              class="rounded-lg bg-surface-muted px-3 py-2 text-sm text-foreground/60"
            >
              思考中...
            </div>
          </div>
        </div>

        <div
          class="flex flex-shrink-0 items-center gap-2 border-t border-border bg-surface p-3"
        >
          <form class="flex flex-1 gap-2" @submit.prevent="sendMessage">
            <input
              v-model="inputText"
              type="text"
              placeholder="输入消息，如：记一笔午饭50，或添加资金账户：微信、支付宝"
              class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary-500"
              :disabled="sending"
            />
            <button
              type="submit"
              class="flex-shrink-0 rounded-lg bg-primary-500 px-4 py-2 text-white transition hover:bg-primary-600 disabled:opacity-50"
              :disabled="sending || !inputText.trim()"
            >
              <PaperAirplaneIcon class="h-5 w-5" />
            </button>
          </form>
          <button
            type="button"
            class="flex-shrink-0 rounded-lg border border-border px-2 py-2 text-foreground/70 hover:bg-surface-muted hover:text-foreground"
            aria-label="复位对话"
            title="复位到底部"
            @click="resetChatBubbles"
          >
            <ArrowDownIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.jimi-markdown :deep(p) {
  margin: 0 0 0.45rem;
}

.jimi-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.jimi-markdown :deep(ul),
.jimi-markdown :deep(ol) {
  margin: 0.3rem 0 0.45rem 1.1rem;
}

.jimi-markdown :deep(li) {
  margin: 0.2rem 0;
}

.jimi-markdown :deep(code) {
  border-radius: 0.25rem;
  background: rgba(148, 163, 184, 0.2);
  padding: 0.1rem 0.3rem;
  font-size: 0.9em;
}

.jimi-markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
  background: rgba(148, 163, 184, 0.15);
  padding: 0.6rem;
}

.jimi-markdown :deep(pre code) {
  background: transparent;
  padding: 0;
}

.jimi-markdown :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}
</style>
