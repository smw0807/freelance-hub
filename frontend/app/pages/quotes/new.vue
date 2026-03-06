<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <UButton to="/quotes" variant="ghost" icon="i-heroicons-arrow-left" />
        <h1 class="text-2xl font-bold">새 견적서</h1>
      </div>

      <UCard>
        <div class="space-y-6">
          <!-- Step 1: Project -->
          <div>
            <h2 class="font-semibold mb-3">1. 프로젝트 선택</h2>
            <USelect v-model="form.projectId" :items="projectItems" class="w-full" />
          </div>

          <!-- Step 2: Items -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h2 class="font-semibold">2. 견적 항목</h2>
              <UButton size="sm" icon="i-heroicons-plus" variant="outline" @click="addItem">항목 추가</UButton>
            </div>
            <div class="space-y-2">
              <div v-for="(item, i) in form.items" :key="i" class="grid grid-cols-12 gap-2 items-center">
                <UInput v-model="item.description" placeholder="항목명" class="col-span-5" @input="recalculate" />
                <UInput v-model.number="item.quantity" type="number" placeholder="수량" class="col-span-2" @input="recalculate" />
                <UInput v-model.number="item.unitPrice" type="number" placeholder="단가" class="col-span-3" @input="recalculate" />
                <div class="col-span-1 text-right text-sm">₩{{ (item.amount || 0).toLocaleString() }}</div>
                <UButton class="col-span-1" variant="ghost" icon="i-heroicons-x-mark" size="xs" @click="removeItem(i)" />
              </div>
            </div>
          </div>

          <!-- Step 3: Amounts -->
          <div>
            <h2 class="font-semibold mb-3">3. 금액 요약</h2>
            <div class="space-y-2 max-w-sm ml-auto">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">공급가액</span>
                <span>₩{{ form.subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm items-center">
                <span class="text-gray-500">부가세</span>
                <UCheckbox v-model="includeVat" @update:model-value="recalculate" label="10% 포함" />
              </div>
              <div class="flex justify-between text-sm items-center">
                <span class="text-gray-500">할인</span>
                <UInput v-model.number="form.discountAmount" type="number" size="sm" class="w-32" @input="recalculate" />
              </div>
              <div class="flex justify-between font-bold border-t pt-2">
                <span>합계</span>
                <span>₩{{ form.totalAmount.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- Step 4: Memo -->
          <div>
            <h2 class="font-semibold mb-3">4. 메모</h2>
            <UTextarea v-model="form.memo" placeholder="특이사항, 유효기간 등" class="w-full" />
          </div>

          <UAlert v-if="error" color="error" :description="error" />

          <div class="flex justify-end gap-3">
            <UButton to="/quotes" variant="outline">취소</UButton>
            <UButton :loading="loading" @click="onSubmit">저장</UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $api } = useNuxtApp()

const projects = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const includeVat = ref(false)

const form = reactive({
  projectId: 'none',
  items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
  subtotal: 0,
  vatAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  memo: '',
})

const projectItems = computed(() => [
  { label: '선택...', value: 'none' },
  ...projects.value.map((p: any) => ({ label: p.title, value: p.id })),
])

onMounted(async () => {
  const res = await ($api as any)('/projects?limit=100')
  projects.value = res.data
})

function addItem() {
  form.items.push({ description: '', quantity: 1, unitPrice: 0, amount: 0 })
}

function removeItem(i: number) {
  form.items.splice(i, 1)
  recalculate()
}

function recalculate() {
  form.items.forEach((item) => {
    item.amount = (item.quantity || 0) * (item.unitPrice || 0)
  })
  form.subtotal = form.items.reduce((s, i) => s + i.amount, 0)
  form.vatAmount = includeVat.value ? Math.round(form.subtotal * 0.1) : 0
  form.totalAmount = form.subtotal + form.vatAmount - (form.discountAmount || 0)
}

async function onSubmit() {
  if (!form.projectId || form.projectId === 'none') { error.value = '프로젝트를 선택해주세요.'; return }
  loading.value = true
  error.value = ''
  try {
    recalculate()
    const quote = await ($api as any)('/quotes', { method: 'POST', body: form })
    await navigateTo(`/quotes/${quote.id}`)
  } catch (err: any) {
    error.value = err?.data?.message || '저장에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
