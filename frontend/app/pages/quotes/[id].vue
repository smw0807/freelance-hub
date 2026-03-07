<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 space-y-6" v-if="quote">
      <div class="flex items-center gap-3">
        <UButton to="/quotes" variant="ghost" icon="i-heroicons-arrow-left" />
        <div>
          <h1 class="text-2xl font-bold">{{ quote.quoteNo }}</h1>
          <p class="text-gray-500 text-sm">{{ quote.project?.title }}</p>
        </div>
        <div class="ml-auto flex gap-2">
          <UBadge :color="statusColor(quote.status)" size="lg">{{
            statusLabel(quote.status)
          }}</UBadge>
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
            @click="downloadPdf"
          >
            PDF
          </UButton>
        </div>
      </div>

      <!-- Quote content -->
      <UCard>
        <div class="space-y-6">
          <div>
            <h2 class="font-semibold mb-3">견적 항목</h2>
            <table class="w-full text-sm">
              <thead class="border-b">
                <tr class="text-left text-gray-500">
                  <th class="pb-2">항목</th>
                  <th class="pb-2 text-right">수량</th>
                  <th class="pb-2 text-right">단가</th>
                  <th class="pb-2 text-right">금액</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in quote.items" :key="i" class="border-b">
                  <td class="py-2">{{ item.description }}</td>
                  <td class="py-2 text-right">{{ item.quantity }}</td>
                  <td class="py-2 text-right">
                    ₩{{ item.unitPrice.toLocaleString() }}
                  </td>
                  <td class="py-2 text-right">
                    ₩{{ item.amount.toLocaleString() }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="max-w-xs ml-auto space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">공급가액</span
              ><span>₩{{ quote.subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">부가세</span
              ><span>₩{{ quote.vatAmount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">할인</span
              ><span>-₩{{ quote.discountAmount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between font-bold border-t pt-2">
              <span>합계</span
              ><span>₩{{ quote.totalAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Share link -->
      <UCard v-if="quote.shareToken">
        <template #header><h2 class="font-semibold">공유 링크</h2></template>
        <div class="flex gap-2">
          <UInput :value="shareUrl" readonly class="flex-1" />
          <UButton
            variant="outline"
            icon="i-heroicons-clipboard"
            @click="copyLink"
            >복사</UButton
          >
        </div>
        <p class="text-xs text-gray-500 mt-1">
          만료:
          {{
            quote.expiresAt
              ? new Date(quote.expiresAt).toLocaleDateString('ko-KR')
              : '무기한'
          }}
        </p>
      </UCard>
    </div>

    <!-- Share Modal -->
    <UModal v-model:open="shareModalOpen" title="공유 링크 생성">
      <template #body>
        <div class="space-y-4 p-4">
          <UFormField label="만료일">
            <UInput v-model="shareForm.expiresAt" type="date" class="w-full" />
          </UFormField>
          <UButton
            class="w-full justify-center"
            :loading="shareLoading"
            @click="createShareLink"
          >
            링크 생성
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Quote, QuoteStatus } from '~/types/models';

definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();
const route = useRoute();
const config = useRuntimeConfig();

const quote = ref<Quote | null>(null);
const shareModalOpen = ref(false);
const shareLoading = ref(false);
const shareForm = reactive({ expiresAt: '' });

const shareUrl = computed(() =>
  quote.value?.shareToken
    ? `${config.public.apiBase.replace(':3002', ':3000')}/q/${quote.value.shareToken}`
    : '',
);

onMounted(async () => {
  quote.value = await $api<Quote>(`/quotes/${route.params.id}`);
});

async function createShareLink() {
  shareLoading.value = true;
  try {
    const body: Record<string, string> = {};
    if (shareForm.expiresAt)
      body.expiresAt = new Date(shareForm.expiresAt).toISOString();
    const updated = await $api<Partial<Quote>>(
      `/quotes/${quote.value!.id}/share`,
      { method: 'POST', body },
    );
    quote.value = { ...quote.value!, ...updated };
    shareModalOpen.value = false;
  } finally {
    shareLoading.value = false;
  }
}

function copyLink() {
  navigator.clipboard.writeText(shareUrl.value);
}

async function downloadPdf() {
  const url = `${config.public.apiBase}/quotes/${quote.value!.id}/pdf`;
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('Authorization', `Bearer ${useAuthStore().accessToken}`);
  window.open(url + '?token=' + useAuthStore().accessToken);
}

const statusLabelMap: Record<QuoteStatus, string> = {
  DRAFT: '초안',
  SENT: '발송',
  ACCEPTED: '수락',
  REJECTED: '거절',
  EXPIRED: '만료',
};
const statusColorMap: Record<
  QuoteStatus,
  'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'info'
> = {
  DRAFT: 'info',
  SENT: 'primary',
  ACCEPTED: 'success',
  REJECTED: 'error',
  EXPIRED: 'warning',
};

function statusLabel(s: QuoteStatus) {
  return statusLabelMap[s] ?? s;
}
function statusColor(s: QuoteStatus) {
  return statusColorMap[s] ?? 'info';
}
</script>
