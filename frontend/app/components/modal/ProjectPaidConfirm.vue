<template>
  <UModal :open="open" :title="type === 'deposit' ? '선금 수령 확인' : '잔금 수령 확인'" @update:open="emit('update:open', $event)">
    <template #body>
      <p class="text-sm text-white">
        {{ type === 'deposit' ? '선금' : '잔금' }}을 수령 완료 처리하시겠습니까?
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="emit('update:open', false)">취소</UButton>
        <UButton color="primary" @click="emit('confirm')">확인</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
  type: 'deposit' | 'balance';
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'confirm'): void;
}>();
</script>
