<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6" v-if="contract">
      <div class="flex items-center gap-3">
        <UButton to="/contracts" variant="ghost" icon="i-heroicons-arrow-left" />
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold">{{ contract.contractNo }}</h1>
          </div>
          <p class="text-gray-500 text-sm">{{ contract.project?.title }}</p>
        </div>
        <div class="ml-auto flex gap-2">
          <UBadge :color="contractStatusColor[contract.status]" size="lg">
            {{ contractStatusLabel[contract.status] }}
          </UBadge>
          <UButton
            variant="outline"
            size="sm"
            icon="i-heroicons-share"
            @click="shareModalOpen = true"
          >
            공유링크
          </UButton>
          <UButton
            variant="outline"
            size="sm"
            icon="i-heroicons-arrow-down-tray"
            @click="onDownloadPdf"
          >
            PDF
          </UButton>
        </div>
      </div>

      <!-- Contract meta -->
      <UCard>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500">계약 유형</p>
            <p class="font-medium">{{ contractTypeLabel[contract.type] }}</p>
          </div>
          <div>
            <p class="text-gray-500">계약 금액</p>
            <p class="font-medium">₩{{ contract.totalAmount.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-gray-500">시작일</p>
            <p class="font-medium">
              {{ contract.startDate ? new Date(contract.startDate).toLocaleDateString('ko-KR') : '-' }}
            </p>
          </div>
          <div>
            <p class="text-gray-500">종료일</p>
            <p class="font-medium">
              {{ contract.endDate ? new Date(contract.endDate).toLocaleDateString('ko-KR') : '-' }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Contract content -->
      <UCard>
        <template #header><h2 class="font-semibold">계약 조항</h2></template>
        <pre class="whitespace-pre-wrap text-sm leading-relaxed font-sans">{{ contract.content }}</pre>
      </UCard>

      <!-- Signature info -->
      <UCard v-if="contract.signerName">
        <template #header><h2 class="font-semibold">서명 정보</h2></template>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-gray-500">서명자</p>
            <p class="font-medium">{{ contract.signerName }}</p>
          </div>
          <div>
            <p class="text-gray-500">서명일시</p>
            <p class="font-medium">
              {{ contract.signedAt ? new Date(contract.signedAt).toLocaleString('ko-KR') : '-' }}
            </p>
          </div>
        </div>
      </UCard>

      <!-- Share link -->
      <UCard v-if="contract.shareToken">
        <template #header><h2 class="font-semibold">공유 링크</h2></template>
        <div class="flex gap-2">
          <UInput :value="shareUrl" readonly class="flex-1" />
          <UButton variant="outline" icon="i-heroicons-clipboard" @click="copyLink">복사</UButton>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          만료:
          {{
            contract.expiresAt
              ? new Date(contract.expiresAt).toLocaleDateString('ko-KR')
              : '무기한'
          }}
        </p>
      </UCard>

      <!-- Memo -->
      <UCard v-if="contract.memo">
        <template #header><h2 class="font-semibold">메모</h2></template>
        <p class="text-sm text-gray-600">{{ contract.memo }}</p>
      </UCard>
    </div>

    <ModalContractShare
      v-model:open="shareModalOpen"
      :loading="shareLoading"
      :initial-expires-at="shareForm.expiresAt"
      @submit="onCreateShareLink"
    />
  </div>
</template>

<script setup lang="ts">
import { contractStatusLabel, contractStatusColor, contractTypeLabel } from '~/constants/contract';

definePageMeta({ middleware: 'auth' });

const route = useRoute();
const contractStore = useContractStore();
const { contract, shareLoading } = storeToRefs(contractStore);

const shareModalOpen = ref(false);
const shareForm = reactive({ expiresAt: '' });

const requestUrl = useRequestURL();
const shareUrl = computed(() =>
  contract.value?.shareToken
    ? `${requestUrl.origin}/c/${contract.value.shareToken}`
    : '',
);

onMounted(() => contractStore.fetchContract(route.params.id as string));

async function onCreateShareLink(expiresAt: string) {
  await contractStore.createShareLink(contract.value!.id, expiresAt);
  shareModalOpen.value = false;
}

function copyLink() {
  navigator.clipboard.writeText(shareUrl.value);
}

async function onDownloadPdf() {
  await contractStore.downloadPdf(
    contract.value!.id,
    `contract-${contract.value!.contractNo}.pdf`,
  );
}
</script>
