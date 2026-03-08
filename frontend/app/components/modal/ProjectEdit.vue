<template>
  <UModal :open="open" title="프로젝트 편집" @update:open="emit('update:open', $event)">
    <template #body>
      <div class="space-y-4">
        <UFormField label="계약금액">
          <UInput v-model.number="localForm.contractAmount" type="number" />
        </UFormField>
        <UFormField label="선금">
          <UInput v-model.number="localForm.depositAmount" type="number" />
        </UFormField>
        <UFormField label="잔금">
          <UInput v-model.number="localForm.balanceAmount" type="number" />
        </UFormField>
        <UFormField label="플랫폼">
          <USelect v-model="localForm.platform" :items="platformItems" />
        </UFormField>
        <UFormField label="시작일">
          <UInput v-model="localForm.startedAt" type="date" />
        </UFormField>
        <UFormField label="마감일">
          <UInput v-model="localForm.deadlineAt" type="date" />
        </UFormField>
        <UFormField label="메모">
          <UTextarea v-model="localForm.memo" :rows="3" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="emit('update:open', false)">취소</UButton>
        <UButton @click="emit('save', { ...localForm })">저장</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface EditForm {
  contractAmount: number;
  depositAmount: number;
  balanceAmount: number;
  platform: string;
  startedAt: string;
  deadlineAt: string;
  memo: string;
}

interface SelectItem {
  label: string;
  value: string;
}

const props = defineProps<{
  open: boolean;
  platformItems: SelectItem[];
  initialForm: EditForm;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'save', form: EditForm): void;
}>();

const localForm = reactive<EditForm>({ ...props.initialForm });

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    Object.assign(localForm, props.initialForm);
  },
);
</script>
