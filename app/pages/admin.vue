<template>
  <!-- Écran PIN -->
  <div v-if="!authenticated" class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-lock-closed" class="text-primary-500 size-5" />
          <span class="font-semibold">Accès administration</span>
        </div>
      </template>

      <div class="space-y-4">
        <UFormField label="Code PIN" :error="pinError">
          <UInput
            v-model="pin"
            type="password"
            placeholder="••••"
            maxlength="4"
            class="w-full text-center tracking-widest"
            autofocus
            @keyup.enter="submitPin"
          />
        </UFormField>

        <UButton
          label="Accéder"
          icon="i-heroicons-arrow-right-end-on-rectangle"
          class="w-full justify-center"
          :loading="pinLoading"
          @click="submitPin"
        />
      </div>
    </UCard>
  </div>

  <!-- Contenu admin -->
  <UContainer v-else class="py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Administration</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Gestion des réclamations — Seconde 3</p>
      </div>
      <div class="flex items-center gap-3">
        <UBadge :label="`${reclamations.length} réclamation${reclamations.length > 1 ? 's' : ''}`" color="neutral" variant="subtle" size="lg" />
        <UButton icon="heroicons:arrow-path-16-solid" color="neutral" variant="ghost" :loading="pending" @click="() => refresh()" />
        <UButton icon="i-heroicons-lock-closed" color="neutral" variant="ghost" @click="logout" />
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="size-8 animate-spin text-gray-400" />
    </div>

    <div v-else-if="reclamations.length === 0" class="text-center py-20">
      <UIcon name="i-heroicons-inbox" class="size-12 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">Aucune réclamation</p>
    </div>

    <div v-else class="space-y-4">
      <UCard v-for="r in reclamations" :key="r.id">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 space-y-2">
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">Nom :</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.nom }}</span>
            </div>
            <UDivider />
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">Prénom :</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.prenom }}</span>
            </div>
            <UDivider />
            <div class="flex items-center gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0">Objet :</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ r.objet }}</span>
            </div>
            <UDivider />
            <div class="flex gap-4">
              <span class="text-sm text-gray-500 dark:text-gray-400 w-32 shrink-0 pt-0.5">Réclamation :</span>
              <span class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ r.reclamation }}</span>
            </div>
            <div class="pt-1">
              <span class="text-xs text-gray-400">{{ formatDate(r.created_at) }}</span>
            </div>
          </div>

          <UButton
            icon="i-heroicons-trash"
            color="error"
            variant="soft"
            size="sm"
            :loading="deletingId === r.id"
            @click="confirmDelete(r)"
          />
        </div>
      </UCard>
    </div>

    <UModal v-model:open="deleteModal.open">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-error-500 size-5" />
              <span class="font-semibold">Confirmer la suppression</span>
            </div>
          </template>
          <p class="text-gray-600 dark:text-gray-300">
            Supprimer la réclamation de <strong>{{ deleteModal.target?.prenom }} {{ deleteModal.target?.nom }}</strong> ?
            Cette action est irréversible.
          </p>
          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton label="Annuler" color="neutral" variant="outline" @click="deleteModal.open = false" />
              <UButton label="Supprimer" color="error" icon="i-heroicons-trash" :loading="deletingId === deleteModal.target?.id" @click="deleteReclamation(deleteModal.target!.id)" />
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <UNotifications />
  </UContainer>
</template>

<script setup lang="ts">
interface Reclamation {
  id: number
  nom: string
  prenom: string
  objet: string
  reclamation: string
  created_at: string
}

const toast = useToast()

// Auth
const authenticated = ref(false)
const pin = ref('')
const pinError = ref('')
const pinLoading = ref(false)

const { data: reclamationsData, pending, refresh } = await useFetch<Reclamation[]>('/api/reclamations', {
  immediate: false,
})
const reclamations = computed(() => reclamationsData.value ?? [])

onMounted(async () => {
  try {
    await $fetch('/api/auth/check')
    authenticated.value = true
    await refresh()
  } catch {
    authenticated.value = false
  }
})

async function submitPin() {
  if (!pin.value) return
  pinLoading.value = true
  pinError.value = ''
  try {
    await $fetch('/api/auth/verify-pin', { method: 'POST', body: { pin: pin.value } })
    authenticated.value = true
    await refresh()
  } catch {
    pinError.value = 'Code PIN incorrect'
    pin.value = ''
  } finally {
    pinLoading.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  authenticated.value = false
  pin.value = ''
}

// Réclamations
const deletingId = ref<number | null>(null)
const deleteModal = reactive<{ open: boolean; target: Reclamation | null }>({
  open: false,
  target: null,
})

function confirmDelete(r: Reclamation) {
  deleteModal.target = r
  deleteModal.open = true
}

async function deleteReclamation(id: number) {
  deletingId.value = id
  try {
    await $fetch(`/api/reclamations/${id}`, { method: 'DELETE' })
    deleteModal.open = false
    await refresh()
    toast.add({ title: 'Réclamation supprimée', color: 'success', icon: 'i-heroicons-trash' })
  } catch {
    toast.add({ title: 'Erreur', description: 'Impossible de supprimer la réclamation.', color: 'error' })
  } finally {
    deletingId.value = null
  }
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}
</script>
