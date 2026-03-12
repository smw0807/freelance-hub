<template>
  <div class="flex-1 overflow-y-auto">
    <div class="p-6 max-w-lg space-y-6">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-bold">설정</h1>
        <PageGuide
          title="설정"
          description="계정 정보와 앱 환경을 설정하는 화면입니다.

• 이름, 전화번호, 시간당 단가 등 프로필 정보를 수정할 수 있습니다.
• 이메일/비밀번호로 가입한 계정은 비밀번호를 변경할 수 있습니다.
• 현재 구독 플랜을 확인할 수 있습니다."
        />
      </div>

      <!-- 프로필 수정 -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">프로필 수정</h2>
        </template>
        <div class="space-y-4">
          <UFormField label="이메일">
            <UInput :value="authStore.user?.email" disabled class="w-full" />
          </UFormField>
          <UFormField label="이름">
            <UInput v-model="profileForm.name" class="w-full" />
          </UFormField>
          <UFormField label="전화번호">
            <UInput
              v-model="profileForm.phone"
              class="w-full"
              placeholder="010-0000-0000"
            />
          </UFormField>
          <UFormField label="시간당 단가 (원)">
            <UInput
              v-model.number="profileForm.hourlyRate"
              type="number"
              min="0"
              class="w-full"
              @keydown="
                (e: KeyboardEvent) =>
                  ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()
              "
            />
          </UFormField>
          <UAlert
            v-if="profileError"
            color="error"
            :description="profileError"
          />
          <UAlert
            v-if="profileSuccess"
            color="success"
            description="프로필이 저장되었습니다."
          />
          <UButton
            :loading="profileLoading"
            class="w-full justify-center"
            @click="saveProfile"
            >저장</UButton
          >
        </div>
      </UCard>

      <!-- 비밀번호 변경 (이메일 가입 계정만) -->
      <!-- <UCard v-if="authStore.user?.hasPassword">
        <template #header>
          <h2 class="font-semibold">비밀번호 변경</h2>
        </template>
        <div class="space-y-4">
          <UFormField label="현재 비밀번호">
            <UInput v-model="pwForm.currentPassword" type="password" class="w-full" />
          </UFormField>
          <UFormField label="새 비밀번호" hint="8자 이상">
            <UInput v-model="pwForm.newPassword" type="password" class="w-full" />
          </UFormField>
          <UFormField label="새 비밀번호 확인">
            <UInput v-model="pwForm.confirmPassword" type="password" class="w-full" />
          </UFormField>
          <UAlert v-if="pwError" color="error" :description="pwError" />
          <UAlert v-if="pwSuccess" color="success" description="비밀번호가 변경되었습니다." />
          <UButton :loading="pwLoading" class="w-full justify-center" @click="changePassword">변경</UButton>
        </div>
      </UCard> -->

      <!-- 구독 플랜 -->
      <UCard>
        <template #header>
          <h2 class="font-semibold">구독 플랜</h2>
        </template>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">
                <UBadge
                  :color="
                    authStore.user?.plan === 'PRO' ? 'success' : 'neutral'
                  "
                  variant="subtle"
                  size="lg"
                >
                  {{ authStore.user?.plan === 'PRO' ? 'PRO' : 'FREE' }}
                </UBadge>
              </p>
              <p
                v-if="
                  authStore.user?.plan === 'PRO' &&
                  authStore.user?.planExpiredAt
                "
                class="text-sm text-gray-500 mt-1"
              >
                만료일: {{ formatDate(authStore.user.planExpiredAt) }}
              </p>
              <p
                v-else-if="authStore.user?.plan === 'FREE'"
                class="text-sm text-gray-500 mt-1"
              >
                프로젝트 3개, 클라이언트 5개, 견적서 5개/월 제한
              </p>
            </div>
          </div>

          <div
            v-if="authStore.user?.plan === 'FREE'"
            class="rounded-lg border border-dashed p-4 space-y-2"
          >
            <p class="font-medium text-sm">PRO 플랜으로 업그레이드</p>
            <ul class="text-sm text-gray-500 space-y-1">
              <li>• 프로젝트 · 클라이언트 · 견적서 무제한</li>
              <li>• 타임 트래킹</li>
              <li>• 전자서명</li>
              <li>• 연간 세금 보고서 PDF</li>
            </ul>
            <UButton size="sm" color="primary" disabled
              >업그레이드 (준비 중)</UButton
            >
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

const { $api } = useNuxtApp();
const authStore = useAuthStore();

// ── 프로필 ────────────────────────────────────────────────
const profileForm = reactive({ name: '', phone: '', hourlyRate: 0 });
const profileLoading = ref(false);
const profileError = ref('');
const profileSuccess = ref(false);

onMounted(() => {
  const u = authStore.user;
  if (u) {
    profileForm.name = u.name ?? '';
    profileForm.phone = u.phone ?? '';
    profileForm.hourlyRate = u.hourlyRate ?? 0;
  }
});

async function saveProfile() {
  profileLoading.value = true;
  profileError.value = '';
  profileSuccess.value = false;
  try {
    const updated = await ($api as any)('/auth/me', {
      method: 'PATCH',
      body: {
        name: profileForm.name || undefined,
        phone: profileForm.phone || undefined,
        hourlyRate: profileForm.hourlyRate || undefined,
      },
    });
    if (authStore.user) {
      authStore.user = { ...authStore.user, ...updated };
    }
    profileSuccess.value = true;
  } catch (err: unknown) {
    profileError.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '저장에 실패했습니다.';
  } finally {
    profileLoading.value = false;
  }
}

// ── 비밀번호 변경 ─────────────────────────────────────────
const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const pwLoading = ref(false);
const pwError = ref('');
const pwSuccess = ref(false);

async function changePassword() {
  pwError.value = '';
  pwSuccess.value = false;

  if (pwForm.newPassword.length < 8) {
    pwError.value = '새 비밀번호는 8자 이상이어야 합니다.';
    return;
  }
  if (pwForm.newPassword !== pwForm.confirmPassword) {
    pwError.value = '새 비밀번호가 일치하지 않습니다.';
    return;
  }

  pwLoading.value = true;
  try {
    await ($api as any)('/auth/me/password', {
      method: 'PATCH',
      body: {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      },
    });
    pwSuccess.value = true;
    pwForm.currentPassword = '';
    pwForm.newPassword = '';
    pwForm.confirmPassword = '';
  } catch (err: unknown) {
    pwError.value =
      (err as { data?: { message?: string } })?.data?.message ||
      '비밀번호 변경에 실패했습니다.';
  } finally {
    pwLoading.value = false;
  }
}

// ── 유틸 ─────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>
