<template>
  <ion-page>
    <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="onSubmit" novalidate>
        <h2 class="title">{{ isNew ? 'Nuevo cliente' : 'Editar cliente' }}</h2>

        <ion-list inset>
          <ion-item>
            <ion-input
              v-model="form.nombre"
              label="Nombre"
              label-placement="floating"
              :error-text="errors.nombre"
              :class="{ 'has-error': !!errors.nombre }"
              required
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="form.email"
              type="email"
              label="Email (opcional)"
              label-placement="floating"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="form.telefono"
              label="Teléfono (opcional)"
              label-placement="floating"
              inputmode="tel"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="form.direccion"
              label="Dirección (opcional)"
              label-placement="floating"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="form.doc"
              label="CUIT/DNI (opcional)"
              label-placement="floating"
            />
          </ion-item>
        </ion-list>

        <ion-list inset>
          <ion-item lines="none">
            <ion-toggle v-model="form.activo">Activo</ion-toggle>
          </ion-item>
        </ion-list>

        <div class="actions">
          <ion-button type="submit" expand="block">Guardar</ion-button>
          <ion-button fill="outline" color="medium" expand="block" @click="goBack">Cancelar</ion-button>
          <ion-button v-if="!isNew" color="danger" fill="clear" expand="block" @click="onDelete">Eliminar</ion-button>
        </div>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonList, IonItem, IonInput, IonToggle, IonButton
} from '@ionic/vue'

type Cliente = {
  id: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  doc?: string
  activo: boolean
  creadoEl: string
  actualizadoEl?: string
}

const KEY = 'romi_clientes'
const getList = (): Cliente[] => JSON.parse(localStorage.getItem(KEY) || '[]')
const setList = (arr: Cliente[]) => localStorage.setItem(KEY, JSON.stringify(arr))
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || 'new')
const isNew = computed(() => id === 'new')

const form = reactive<Cliente>({
  id: id === 'new' ? uuid() : id,
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  doc: '',
  activo: true,
  creadoEl: new Date().toISOString(),
})

const errors = reactive<Record<string, string>>({
  nombre: '',
})

onMounted(() => {
  if (!isNew.value) {
    const found = getList().find(c => c.id === id)
    if (found) {
      Object.assign(form, found)
    } else {
      alert('Cliente no encontrado')
      router.replace('/app/clientes')
    }
  }
})

function validate(): boolean {
  errors.nombre = form.nombre.trim() ? '' : 'Requerido'
  return !Object.values(errors).some(Boolean)
}

function onSubmit() {
  if (!validate()) return
  const arr = getList()
  const i = arr.findIndex(c => c.id === form.id)

  const payload: Cliente = {
    ...form,
    actualizadoEl: new Date().toISOString(),
  }

  if (i === -1) arr.push(payload)
  else arr[i] = payload

  setList(arr)
  router.replace('/app/clientes')
}

function onDelete() {
  if (!confirm('¿Eliminar cliente?')) return
  setList(getList().filter(c => c.id !== form.id))
  router.replace('/app/clientes')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.title { margin: 0 0 12px; font-weight: 800; }
.actions { margin-top: 16px; display: grid; gap: 8px; }
.has-error { --highlight-color-focused: var(--ion-color-danger); }
</style>
