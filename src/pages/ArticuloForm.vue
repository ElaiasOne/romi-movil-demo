<template>
  <ion-page>

    <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
    <ion-content class="ion-padding">
      <form @submit.prevent="onSubmit" novalidate>
        <h2 class="title">{{ isNew ? 'Nuevo artículo' : 'Editar artículo' }}</h2>

        <!-- Identificación -->
        <ion-list inset>
          <ion-item>
            <ion-input
              v-model="form.codigointerno"
              label="Código interno"
              label-placement="floating"
              :error-text="errors.codigointerno"
              :class="{ 'has-error': !!errors.codigointerno }"
              required
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="form.ean"
              label="EAN (opcional)"
              label-placement="floating"
              inputmode="numeric"
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model="form.descripcion"
              label="Descripción"
              label-placement="floating"
              :error-text="errors.descripcion"
              :class="{ 'has-error': !!errors.descripcion }"
              required
            />
          </ion-item>
        </ion-list>

        <!-- Precios y stock -->
        <ion-list inset>
          <ion-item>
            <ion-input
              v-model.number="form.preciocosto"
              type="number"
              step="0.01"
              min="0"
              label="Precio costo"
              label-placement="floating"
              :error-text="errors.preciocosto"
              :class="{ 'has-error': !!errors.preciocosto }"
              required
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model.number="form.precioventa"
              type="number"
              step="0.01"
              min="0"
              label="Precio venta"
              label-placement="floating"
              :error-text="errors.precioventa"
              :class="{ 'has-error': !!errors.precioventa }"
              required
            />
          </ion-item>

          <ion-item>
            <ion-input
              v-model.number="form.stock"
              type="number"
              step="1"
              min="0"
              label="Stock"
              label-placement="floating"
            />
          </ion-item>

          <div class="kpis">
            <div class="kpi">
              <span class="kpi-label">Margen</span>
              <strong class="kpi-value">{{ margenPct }}%</strong>
            </div>
            <div class="kpi">
              <span class="kpi-label">Utilidad</span>
              <strong class="kpi-value">${{ utilidad }}</strong>
            </div>
            <div class="kpi">
              <span class="kpi-label">Sugerido (30%)</span>
              <ion-chip outline @click="aplicarSugerido(0.30)">${{ sugerido(0.30) }}</ion-chip>
            </div>
            <div class="kpi">
              <span class="kpi-label">Sugerido (40%)</span>
              <ion-chip outline @click="aplicarSugerido(0.40)">${{ sugerido(0.40) }}</ion-chip>
            </div>
          </div>
        </ion-list>

        <!-- Estado -->
        <ion-list inset>
          <ion-item lines="none">
            <ion-toggle v-model="form.activo">Activo</ion-toggle>
          </ion-item>
        </ion-list>

        <!-- Acciones -->
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
  IonPage, IonContent, IonList, IonItem, IonInput, IonToggle,
  IonButton, IonChip
} from '@ionic/vue'

type Articulo = {
  id: string
  codigointerno: string
  ean?: string
  descripcion: string
  preciocosto: number
  precioventa: number
  stock?: number
  activo: boolean
  creadoEl: string
  actualizadoEl?: string
}

const KEY = 'romi_articulos'
const getList = (): Articulo[] => JSON.parse(localStorage.getItem(KEY) || '[]')
const setList = (arr: Articulo[]) => localStorage.setItem(KEY, JSON.stringify(arr))
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || 'new')
const isNew = computed(() => id === 'new')

const form = reactive<Articulo>({
  id: id === 'new' ? uuid() : id,
  codigointerno: '',
  ean: '',
  descripcion: '',
  preciocosto: 0,
  precioventa: 0,
  stock: 0,
  activo: true,
  creadoEl: new Date().toISOString(),
})

const errors = reactive<Record<string, string>>({
  codigointerno: '',
  descripcion: '',
  preciocosto: '',
  precioventa: '',
})

onMounted(() => {
  if (!isNew.value) {
    const found = getList().find(a => a.id === id)
    if (found) {
      Object.assign(form, found)
    } else {
      alert('Artículo no encontrado')
      router.replace('/app/articulos')
    }
  }
})

const utilidad = computed(() => {
  const u = +form.precioventa - +form.preciocosto
  return isFinite(u) ? u.toFixed(2) : '0.00'
})
const margenPct = computed(() => {
  const pv = +form.precioventa, pc = +form.preciocosto
  const pct = pv > 0 ? ((pv - pc) / pv) * 100 : 0
  return isFinite(pct) ? pct.toFixed(1) : '0.0'
})
const sugerido = (pct: number) => {
  const pv = (+form.preciocosto * (1 + pct))
  return isFinite(pv) ? pv.toFixed(2) : '0.00'
}
function aplicarSugerido(pct: number) {
  form.precioventa = Number(sugerido(pct))
}

function validate(): boolean {
  errors.codigointerno = form.codigointerno.trim() ? '' : 'Requerido'
  errors.descripcion   = form.descripcion.trim() ? '' : 'Requerido'
  errors.preciocosto   = form.preciocosto > 0 ? '' : 'Debe ser > 0'
  errors.precioventa   = form.precioventa > 0 ? '' : 'Debe ser > 0'
  return !Object.values(errors).some(Boolean)
}

function onSubmit() {
  if (!validate()) return
  const arr = getList()
  const i = arr.findIndex(a => a.id === form.id)

  const payload: Articulo = {
    ...form,
    actualizadoEl: new Date().toISOString(),
  }

  if (i === -1) arr.push(payload)
  else arr[i] = payload

  setList(arr)
  router.replace('/app/articulos')
}

function onDelete() {
  if (!confirm('¿Eliminar artículo? Esta acción no se puede deshacer.')) return
  setList(getList().filter(a => a.id !== form.id))
  router.replace('/app/articulos')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.title { margin: 0 0 12px; font-weight: 800; }
.kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px,1fr));
  gap: 10px 12px;
  padding: 12px 12px 0;
}
.kpi { display: grid; gap: 4px; align-items: center; }
.kpi-label { font-size: 12px; color: rgba(0,0,0,.6); }
.kpi-value { font-size: 16px; color: var(--ion-color-primary); }
.actions { margin-top: 16px; display: grid; gap: 8px; }
.has-error { --highlight-color-focused: var(--ion-color-danger); }
</style>
