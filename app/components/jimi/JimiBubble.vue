<script setup lang="ts">
import { ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

defineProps<{
  isMobile: boolean;
}>();

const emit = defineEmits<{
  open: [];
}>();

const SIZE = 56;
const GAP = 24;

const left = ref(0);
const bottom = ref(0);

const initPosition = () => {
  if (typeof window === "undefined") return;
  left.value = window.innerWidth - GAP - SIZE;
  bottom.value = window.innerHeight - GAP - SIZE;
};

const dragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const startLeft = ref(0);
const startBottom = ref(0);

const onPointerDown = (e: MouseEvent | TouchEvent) => {
  dragging.value = false;
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  startX.value = clientX;
  startY.value = clientY;
  startLeft.value = left.value;
  startBottom.value = bottom.value;

  const onMove = (ev: MouseEvent | TouchEvent) => {
    const x = "touches" in ev ? ev.touches[0].clientX : ev.clientX;
    const y = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
    if (
      !dragging.value &&
      (Math.abs(x - startX.value) > 4 || Math.abs(y - startY.value) > 4)
    ) {
      dragging.value = true;
    }
    if (dragging.value) {
      const dx = x - startX.value;
      const dy = startY.value - y;
      let newLeft = startLeft.value + dx;
      let newBottom = startBottom.value + dy;
      newLeft = Math.max(0, Math.min(window.innerWidth - SIZE, newLeft));
      newBottom = Math.max(0, Math.min(window.innerHeight - SIZE, newBottom));
      left.value = newLeft;
      bottom.value = newBottom;
    }
  };

  const onUp = () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    document.removeEventListener("touchmove", onMove, { capture: true });
    document.removeEventListener("touchend", onUp, { capture: true });
    if (!dragging.value) {
      emit("open");
    }
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
  document.addEventListener("touchmove", onMove, { capture: true });
  document.addEventListener("touchend", onUp, { capture: true });
};

onMounted(() => {
  initPosition();
  window.addEventListener("resize", initPosition);
});

onUnmounted(() => {
  window.removeEventListener("resize", initPosition);
});
</script>

<template>
  <div
    class="fixed z-40 flex h-8 w-8 md:h-14 md:w-14 cursor-grab rounded-full bg-primary-500 text-white shadow-lg transition hover:bg-primary-600 active:cursor-grabbing"
    aria-label="打开 Jimi 助手"
    :style="{
      left: `${left}px`,
      bottom: `${bottom}px`,
      width: `${SIZE}px`,
      height: `${SIZE}px`,
    }"
    @mousedown.prevent="onPointerDown"
    @touchstart.prevent="onPointerDown"
    @click.prevent
  >
    <span
      class="flex h-full w-full items-center justify-center pointer-events-none"
    >
      <ChatBubbleLeftRightIcon class="h-6 w-6 md:h-7 md:w-7" />
    </span>
  </div>
</template>
