<template>
  <UModal :open="open" title="수입 추가" @update:open="emit('update:open', $event)">
    <template #body>
      <div class="p-4 space-y-4">
        <UFormField label="프로젝트 *">
          <USelect v-model="localForm.projectId" :items="projectItems" class="w-full" />
        </UFormField>
        <UFormField label="유형">
          <USelect v-model="localForm.incomeType" :items="incomeTypeItems" class="w-full" />
        </UFormField>
        <UFormField label="금액 *">
          <UInput v-model.number="localForm.amount" type="number" min="0" class="w-full" @keydown="(e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()" />
        </UFormField>
        <UFormField label="지급일 *">
          <UInput v-model="localForm.paidAt" type="date" class="w-full" />
        </UFormField>
        <UFormField label="원천징수">
          <UCheckbox
            v-model="localForm.isWithholdingTax"
            label="원천징수 적용 (3.3%)"
          />
        </UFormField>
        <UFormField label="메모">
          <UInput v-model="localForm.memo" class="w-full" />
        </UFormField>
        <UAlert v-if="error" color="error" :description="error" />
        <UButton class="w-full justify-center" :loading="loading" @click="emit('submit', { ...localForm })">
          저장
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
interface AddIncomeForm {
  projectId: string;
  incomeType: string;
  amount: number;
  isWithholdingTax: boolean;
  paidAt: string;
  memo: string;
}

interface SelectItem {
  label: string;
  value: string;
}

const props = defineProps<{
  open: boolean;
  loading: boolean;
  error: string;
  projectItems: SelectItem[];
  incomeTypeItems: SelectItem[];
  initialForm: AddIncomeForm;
  projectAmounts: Record<string, { depositAmount: number; balanceAmount: number }>;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'submit', form: AddIncomeForm): void;
}>();

const localForm = reactive<AddIncomeForm>({ ...props.initialForm });

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    Object.assign(localForm, props.initialForm);
  },
);

watch(
  [() => localForm.projectId, () => localForm.incomeType],
  ([projectId, incomeType]) => {
    const amounts = props.projectAmounts[projectId];
    if (!amounts) return;
    if (incomeType === 'DEPOSIT') localForm.amount = amounts.depositAmount;
    else if (incomeType === 'BALANCE') localForm.amount = amounts.balanceAmount;
  },
);
</script>
