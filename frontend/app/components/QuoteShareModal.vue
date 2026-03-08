<template>
  <UModal :open="open" title="공유 링크 생성" @update:open="emit('update:open', $event)">
    <template #body>
      <div class="space-y-4 p-4">
        <UFormField label="만료일">
          <UInput v-model="expiresAt" type="date" class="w-full" />
        </UFormField>
        <UButton class="w-full justify-center" :loading="loading" @click="emit('submit', expiresAt)">
          링크 생성
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  loading: boolean;
  initialExpiresAt: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'submit', expiresAt: string): void;
}>();

const expiresAt = ref(props.initialExpiresAt);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    expiresAt.value = props.initialExpiresAt;
  },
);
</script>
