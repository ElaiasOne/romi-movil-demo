<template>
  <ion-page>
    <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
    <ion-content class="ion-padding">
      <!-- Top: título + buscador -->
      <div class="header-row">
        <h2 class="title">Clientes</h2>
        <ion-searchbar
          v-model="q"
          placeholder="Buscar por nombre o email…"
          debounce="250"
          class="search"
        />
      </div>

      <!-- Filtros -->
      <ion-segment v-model="filtro" value="activos" class="segment">
        <ion-segment-button value="activos">
          <ion-label>Activos</ion-label>
        </ion-segment-button>
        <ion-segment-button value="todos">
          <ion-label>Todos</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Skeleton (simula carga) -->
      <div v-if="loading" class="grid">
        <ion-card v-for="i in 6" :key="i" class="card">
          <ion-card-header>
            <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 40%; margin-top: 6px"></ion-skeleton-text>
          </ion-card-header>
          <ion-card-content>
            <ion-skeleton-text animated style="width: 90%"></ion-skeleton-text>
            <ion-skeleton-text animated style="width: 70%; margin-top: 6px"></ion-skeleton-text>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Listado -->
      <div v-else class="grid">
        <ion-card v-for="c in filtrados" :key="c.id" class="card">
          <ion-card-header>
            <div class="card-header">
              <div class="card-title">
                <ion-icon name="people-outline"></ion-icon>
                <strong>{{ c.nombre }}</strong>
                <ion-badge :color="c.activo ? 'success' : 'medium'">{{ c.activo ? 'Activo' : 'Inactivo' }}</ion-badge>
              </div>
              <small class="muted">{{ c.email || 'sin email' }} · {{ c.telefono || 'sin teléfono' }}</small>
            </div>
          </ion-card-header>

          <ion-card-content>
            <div class="info">
              <div>
                <span class="label">Dirección</span>
                <div class="txt">{{ c.direccion || '—' }}</div>
              </div>
              <div>
                <span class="label">CUIT/Doc</span>
                <div class="txt">{{ c.doc || '—' }}</div>
              </div>
            </div>

            <div class="actions">
              <ion-button size="small" fill="solid" @click="goEdit(c.id)">Editar</ion-button>
              <ion-button size="small" fill="outline" color="medium" @click="toggleActivo(c)">
                {{ c.activo ? 'Desactivar' : 'Activar' }}
              </ion-button>
              <ion-button size="small" fill="clear" color="danger" @click="remove(c.id)">Eliminar</ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Estado vacío -->
      <div v-if="!loading && filtrados.length === 0" class="empty">
        <ion-icon name="people-outline" class="empty-icon" />
        <p>No hay clientes que coincidan.</p>
        <ion-button size="default" @click="goNew">Crear cliente</ion-button>
      </div>

      <!-- FAB -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="goNew">
          <ion-icon name="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardHeader, IonCardContent, IonBadge, IonButton, IonIcon,
  IonSkeletonText, IonFab, IonFabButton
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

const router = useRouter()
const loading = ref(true)
const q = ref('')
const filtro = ref<'activos' | 'todos'>('activos')
const list = ref<Cliente[]>([])

function seedIfEmpty() {
  if (getList().length === 0) {
    const seed: Cliente[] = [
      { id: uuid(), nombre: 'Juan Pérez',   email:'juan@demo.com', telefono:'11-5555-1111', direccion:'Av. Siempreviva 123', doc:'20-12345678-9', activo:true,  creadoEl:new Date().toISOString() },
      { id: uuid(), nombre: 'María López',  email:'',              telefono:'',             direccion:'',                    doc:'',            activo:false, creadoEl:new Date().toISOString() },
      { id: uuid(), nombre: 'Kiosco Romi',  email:'kiosco@romi.ar',telefono:'11-4444-2222', direccion:'Mitre 450',           doc:'',            activo:true,  creadoEl:new Date().toISOString() },
    ]
    setList(seed)
  }
}
function load() { list.value = getList() }

function goNew() { router.push('/app/cliente/new') }
function goEdit(id: string) { router.push(`/app/cliente/${id}`) }

function remove(id: string) {
  if (!confirm('¿Eliminar cliente?')) return
  setList(getList().filter(x => x.id !== id)); load()
}
function toggleActivo(c: Cliente) {
  const arr = getList()
  const i = arr.findIndex(x => x.id === c.id)
  if (i > -1) { arr[i].activo = !arr[i].activo; setList(arr); load() }
}

const filtrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  const items = list.value.filter(c => {
    const txt = (c.nombre + ' ' + (c.email||'')).toLowerCase()
    const match = term === '' || txt.includes(term)
    const act = filtro.value === 'todos' ? true : c.activo
    return match && act
  })
  return items.sort((x,y) => Number(y.activo) - Number(x.activo) || x.nombre.localeCompare(y.nombre))
})

onMounted(() => {
  seedIfEmpty()
  load()
  setTimeout(() => (loading.value = false), 400)
})
</script>

<style scoped>
.title { margin: 0 0 6px; font-weight: 700; }
.header-row { display: grid; grid-template-columns: 1fr; gap: 8px; }
@media (min-width: 520px) {
  .header-row { grid-template-columns: minmax(140px, 280px) 1fr; align-items: end; }
  .search { margin-left: auto; }
}
.segment { margin: 6px 0 12px; }

.grid { display: grid; gap: 12px; }
@media (min-width: 720px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }

.card { border-radius: 16px; overflow: hidden; }
.card-header { display: flex; flex-direction: column; gap: 6px; }
.card-title { display: flex; gap: 8px; align-items: center; }
.muted { color: rgba(0,0,0,.55); }
.label { font-size: 12px; color: rgba(0,0,0,.55); }
.info { display: grid; grid-template-columns: repeat(2, minmax(120px, 1fr)); gap: 10px 12px; margin: 6px 0 10px; }
.txt { font-weight: 600; }
.actions { display: flex; gap: 6px; flex-wrap: wrap; }
.empty { margin-top: 32px; display: grid; place-items: center; gap: 12px; text-align: center; color: rgba(0,0,0,.6); }
.empty-icon { font-size: 36px; opacity: .5; }
</style>
