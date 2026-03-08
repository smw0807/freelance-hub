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
          <UBadge :color="quoteStatusColor[quote.status]" size="lg">{{
            quoteStatusLabel[quote.status]
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
            @click="onDownloadPdf"
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

    <ModalQuoteShare
      v-model:open="shareModalOpen"
      :loading="shareLoading"
      :initial-expires-at="shareForm.expiresAt"
      @submit="onCreateShareLink"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const route = useRoute();
const config = useRuntimeConfig();
const quoteStore = useQuoteStore();
const { quote, shareLoading } = storeToRefs(quoteStore);

const shareModalOpen = ref(false);
const shareForm = reactive({ expiresAt: '' });

const shareUrl = computed(() =>
  quote.value?.shareToken
    ? `${config.public.apiBase.replace(':3002', ':3000')}/q/${quote.value.shareToken}`
    : '',
);

onMounted(() => quoteStore.fetchQuote(route.params.id as string));

async function onCreateShareLink(expiresAt: string) {
  await quoteStore.createShareLink(quote.value!.id, expiresAt);
  shareModalOpen.value = false;
}

function copyLink() {
  navigator.clipboard.writeText(shareUrl.value);
}

async function onDownloadPdf() {
  await quoteStore.downloadPdf(quote.value!.id, quote.value!.quoteNo);
}
</script>
