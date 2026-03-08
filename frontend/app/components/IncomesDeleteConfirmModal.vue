<template>
  <UModal :open="open" title="수입 삭제" @update:open="emit('update:open', $event)">
    <template #body>
      <p class="text-sm text-gray-600">정말 삭제하시겠습니까?</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="emit('update:open', false)">취소</UButton>
        <UButton color="error" @click="emit('confirm')">삭제</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'confirm'): void;
}>();
</script>
