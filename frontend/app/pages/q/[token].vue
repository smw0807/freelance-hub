<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="text-center">
        <h1 class="text-3xl font-bold">FreelanceHub</h1>
        <p class="text-gray-500">견적서</p>
      </div>

      <UCard v-if="quote">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold">{{ quote.quoteNo }}</h2>
              <p class="text-gray-500 text-sm">{{ quote.project?.title }}</p>
            </div>
            <UBadge :color="quoteStatusColor[quote.status]" size="lg">{{
              quoteStatusLabel[quote.status]
            }}</UBadge>
          </div>
        </template>

        <div class="space-y-6">
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
            <div class="flex justify-between font-bold border-t pt-2 text-lg">
              <span>합계</span
              ><span>₩{{ quote.totalAmount.toLocaleString() }}</span>
            </div>
          </div>

          <p v-if="quote.memo" class="text-sm text-gray-600 border-t pt-3">
            {{ quote.memo }}
          </p>
        </div>

        <template v-if="quote.status === 'SENT'" #footer>
          <div class="flex gap-3 justify-center">
            <UButton
              color="error"
              variant="outline"
              :loading="loading === 'reject'"
              @click="respond('reject')"
            >
              거절
            </UButton>
            <UButton
              color="success"
              :loading="loading === 'accept'"
              @click="respond('accept')"
            >
              수락
            </UButton>
          </div>
        </template>
      </UCard>

      <UCard v-else-if="errorStatus === 403" class="text-center py-8">
        <div class="space-y-2">
          <p class="text-2xl">⏰</p>
          <p class="font-semibold text-lg">견적서가 만료되었습니다</p>
          <p class="text-gray-500 text-sm">공유 링크의 유효기간이 지났습니다. 담당자에게 문의해 주세요.</p>
        </div>
      </UCard>

      <UCard v-else-if="errorStatus === 404" class="text-center py-8">
        <div class="space-y-2">
          <p class="text-2xl">🔍</p>
          <p class="font-semibold text-lg">견적서를 찾을 수 없습니다</p>
          <p class="text-gray-500 text-sm">링크가 올바른지 확인해 주세요.</p>
        </div>
      </UCard>

      <UAlert v-else-if="error" color="error" :title="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Quote } from '~/types/models';

definePageMeta({ layout: false });

const config = useRuntimeConfig();
const route = useRoute();
const token = route.params.token as string;

const quote = ref<Quote | null>(null);
const loading = ref<string | null>(null);
const error = ref('');
const errorStatus = ref<number | null>(null);

onMounted(async () => {
  try {
    quote.value = await $fetch<Quote>(
      `${config.public.apiBase}/quotes/public/${token}`,
    );
  } catch (err: unknown) {
    const e = err as { status?: number; data?: { message?: string } };
    errorStatus.value = e?.status ?? null;
    error.value = e?.data?.message || '견적서를 불러올 수 없습니다.';
  }
});

async function respond(action: 'accept' | 'reject') {
  loading.value = action;
  try {
    await $fetch(`${config.public.apiBase}/quotes/public/${token}/${action}`, {
      method: 'POST',
    });
    quote.value!.status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
  } catch {
    error.value = '처리에 실패했습니다.';
  } finally {
    loading.value = null;
  }
}
</script>
