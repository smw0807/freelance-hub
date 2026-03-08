<template>
  <div>
    <UTooltip text="화면 설명 보기">
      <UButton
        icon="i-heroicons-question-mark-circle"
        variant="ghost"
        color="neutral"
        size="xs"
        class="text-gray-400 hover:text-gray-600"
        @click="open = true"
      />
    </UTooltip>
    <UModal v-model:open="open" :title="title">
      <template #body>
        <div class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
          {{ description }}
        </div>
      </template>
      <template #footer>
        <UButton color="neutral" variant="outline" class="w-full justify-center" @click="open = false">
          닫기
        </UButton>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();

const open = ref(false);
</script>
