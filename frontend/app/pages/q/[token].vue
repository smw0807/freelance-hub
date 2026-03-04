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
            <UBadge :color="statusColor(quote.status)" size="lg">{{ statusLabel(quote.status) }}</UBadge>
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
              <tr v-for="(item, i) in (quote.items as any[])" :key="i" class="border-b">
                <td class="py-2">{{ item.description }}</td>
                <td class="py-2 text-right">{{ item.quantity }}</td>
                <td class="py-2 text-right">₩{{ item.unitPrice.toLocaleString() }}</td>
                <td class="py-2 text-right">₩{{ item.amount.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>

          <div class="max-w-xs ml-auto space-y-1 text-sm">
            <div class="flex justify-between"><span class="text-gray-500">공급가액</span><span>₩{{ quote.subtotal.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">부가세</span><span>₩{{ quote.vatAmount.toLocaleString() }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">할인</span><span>-₩{{ quote.discountAmount.toLocaleString() }}</span></div>
            <div class="flex justify-between font-bold border-t pt-2 text-lg"><span>합계</span><span>₩{{ quote.totalAmount.toLocaleString() }}</span></div>
          </div>

          <p v-if="quote.memo" class="text-sm text-gray-600 border-t pt-3">{{ quote.memo }}</p>
        </div>

        <template v-if="quote.status === 'SENT'" #footer>
          <div class="flex gap-3 justify-center">
            <UButton color="error" variant="outline" :loading="loading === 'reject'" @click="respond('reject')">
              거절
            </UButton>
            <UButton color="success" :loading="loading === 'accept'" @click="respond('accept')">
              수락
            </UButton>
          </div>
        </template>
      </UCard>

      <UAlert v-if="error" color="error" :title="error" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const config = useRuntimeConfig()
const route = useRoute()
const token = route.params.token as string

const quote = ref<any>(null)
const loading = ref<string | null>(null)
const error = ref('')

onMounted(async () => {
  try {
    quote.value = await $fetch(`${config.public.apiBase}/quotes/public/${token}`)
  } catch (err: any) {
    error.value = err?.data?.message || '견적서를 불러올 수 없습니다.'
  }
})

async function respond(action: 'accept' | 'reject') {
  loading.value = action
  try {
    await $fetch(`${config.public.apiBase}/quotes/public/${token}/${action}`, { method: 'POST' })
    quote.value.status = action === 'accept' ? 'ACCEPTED' : 'REJECTED'
  } catch {
    error.value = '처리에 실패했습니다.'
  } finally {
    loading.value = null
  }
}

function statusLabel(s: string) {
  const map: any = { DRAFT: '초안', SENT: '검토 대기', ACCEPTED: '수락됨', REJECTED: '거절됨', EXPIRED: '만료됨' }
  return map[s] || s
}

function statusColor(s: string) {
  const map: any = { DRAFT: 'gray', SENT: 'primary', ACCEPTED: 'success', REJECTED: 'error', EXPIRED: 'warning' }
  return map[s] || 'gray'
}
</script>
