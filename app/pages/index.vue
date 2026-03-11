<template>
  <UContainer class="py-12 max-w-2xl">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Bureau des réclamations</h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Seconde 3</p>
      <USeparator class="mt-6" />
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-document-text" class="text-primary-500 size-5" />
          <span class="font-semibold text-gray-800 dark:text-gray-200">Nouvelle réclamation</span>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Nom" name="nom" required>
            <UInput v-model="state.nom" placeholder="Nom" class="w-full" />
          </UFormField>
          <UFormField label="Prénom" name="prenom" required>
            <UInput v-model="state.prenom" placeholder="Prénom" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="Objet de la réclamation" name="objet" required>
          <UInput v-model="state.objet" placeholder="Objet" class="w-full" />
        </UFormField>

        <UFormField label="Réclamation" name="reclamation" required>
          <UTextarea
            v-model="state.reclamation"
            placeholder="Décrivez votre réclamation en détail..."
            :rows="5"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end pt-2">
          <UButton
            type="submit"
            label="Envoyer la réclamation"
            icon="i-heroicons-paper-airplane"
            :loading="loading"
            size="lg"
          />
        </div>
      </UForm>
    </UCard>

  </UContainer>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()

const schema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  prenom: z.string().min(1, 'Le prénom est requis').max(100),
  objet: z.string().min(1, "L'objet est requis").max(255, '255 caractères maximum'),
  reclamation: z.string().min(10, 'La réclamation doit faire au moins 10 caractères'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  nom: undefined,
  prenom: undefined,
  objet: undefined,
  reclamation: undefined,
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch('/api/reclamations', {
      method: 'POST',
      body: event.data,
    })
    toast.add({
      title: 'Réclamation envoyée',
      description: 'Votre réclamation a bien été enregistrée.',
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    Object.assign(state, { nom: undefined, prenom: undefined, objet: undefined, reclamation: undefined })
  } catch {
    toast.add({
      title: 'Erreur',
      description: "Une erreur est survenue lors de l'envoi.",
      color: 'error',
      icon: 'i-heroicons-x-circle',
    })
  } finally {
    loading.value = false
  }
}
</script>
