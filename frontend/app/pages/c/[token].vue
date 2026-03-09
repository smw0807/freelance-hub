<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold">FreelanceHub</h1>
        <p class="text-gray-500">계약서</p>
      </div>

      <UCard v-if="contract">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">{{ contract.contractNo }}</h2>
              <p class="text-gray-500 text-sm">{{ contract.project?.title }}</p>
            </div>
            <UBadge :color="statusColor" size="lg">{{ statusLabel }}</UBadge>
          </div>
        </template>

        <!-- Meta -->
        <div class="grid grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <p class="text-gray-500">계약 금액</p>
            <p class="font-medium">₩{{ contract.totalAmount.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-gray-500">계약 기간</p>
            <p class="font-medium">
              {{ contract.startDate ? new Date(contract.startDate).toLocaleDateString('ko-KR') : '-' }}
              ~
              {{ contract.endDate ? new Date(contract.endDate).toLocaleDateString('ko-KR') : '-' }}
            </p>
          </div>
        </div>

        <!-- Content -->
        <div class="border-t pt-4 mb-6">
          <h3 class="font-semibold mb-3">계약 조항</h3>
          <pre class="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-700">{{ contract.content }}</pre>
        </div>

        <!-- Already signed -->
        <template v-if="contract.status === 'SIGNED' || contract.status === 'COMPLETED'">
          <div class="border-t pt-4">
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <p class="text-green-700 font-medium">서명이 완료되었습니다.</p>
              <p class="text-green-600 text-sm mt-1">
                서명자: {{ contract.signerName }} /
                {{ contract.signedAt ? new Date(contract.signedAt).toLocaleString('ko-KR') : '' }}
              </p>
            </div>
          </div>
        </template>

        <!-- Sign form -->
        <template v-else-if="contract.status === 'SENT'">
          <div class="border-t pt-4" v-if="!signed">
            <h3 class="font-semibold mb-3">서명</h3>
            <div class="space-y-3">
              <UFormField label="서명자 이름">
                <UInput v-model="signerName" placeholder="이름을 입력하세요" class="w-full" />
              </UFormField>
              <p class="text-xs text-gray-500">
                이름을 입력하고 서명하기 버튼을 누르면 계약서에 동의한 것으로 간주합니다.
              </p>
              <UButton
                class="w-full justify-center"
                :loading="signing"
                :disabled="!signerName.trim()"
                @click="onSign"
              >
                서명하기
              </UButton>
            </div>
          </div>
          <div v-else class="border-t pt-4">
            <div class="bg-green-50 rounded-lg p-4 text-center">
              <p class="text-green-700 font-medium">서명이 완료되었습니다.</p>
              <p class="text-green-600 text-sm mt-1">감사합니다.</p>
            </div>
          </div>
        </template>
      </UCard>

      <UAlert v-if="error" color="error" :title="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Contract } from '~/types/models';
import { contractStatusLabel, contractStatusColor } from '~/constants/contract';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const route = useRoute();
const token = route.params.token as string;

const contract = ref<Contract | null>(null);
const error = ref('');
const signerName = ref('');
const signing = ref(false);
const signed = ref(false);

const statusLabel = computed(() =>
  contract.value ? contractStatusLabel[contract.value.status] : '',
);
const statusColor = computed(() =>
  contract.value ? contractStatusColor[contract.value.status] : 'neutral',
);

onMounted(async () => {
  try {
    contract.value = await $fetch<Contract>(
      `${config.public.apiBase}/contracts/public/${token}`,
    );
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '계약서를 불러올 수 없습니다.';
  }
});

async function onSign() {
  if (!signerName.value.trim()) return;
  signing.value = true;
  try {
    await $fetch(`${config.public.apiBase}/contracts/public/${token}/sign`, {
      method: 'POST',
      body: { signerName: signerName.value.trim() },
    });
    signed.value = true;
    if (contract.value) {
      contract.value.status = 'SIGNED';
      contract.value.signerName = signerName.value.trim();
    }
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '서명에 실패했습니다.';
  } finally {
    signing.value = false;
  }
}
</script>
