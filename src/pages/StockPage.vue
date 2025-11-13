<template>
  <ion-page>
    <!-- Header dentro de la página -->
    <ion-header>
      <Toolbar />
    </ion-header>
    <ion-content class="ion-padding">
      <h2 class="title">Stock</h2>

      <!-- Controles -->
      <div class="controls">
        <ion-searchbar v-model="q" placeholder="Buscar artículo…" debounce="250" class="search"/>
        <ion-segment v-model="filtro" value="todos" class="segment">
          <ion-segment-button value="todos"><ion-label>Todos</ion-label></ion-segment-button>
          <ion-segment-button value="bajo"><ion-label>Bajo stock</ion-label></ion-segment-button>
          <ion-segment-button value="cero"><ion-label>Sin stock</ion-label></ion-segment-button>
        </ion-segment>
        <ion-segment v-model="orden" value="desc" class="segment">
          <ion-segment-button value="desc"><ion-label>Descripción</ion-label></ion-segment-button>
          <ion-segment-button value="stk"><ion-label>Stock</ion-label></ion-segment-button>
        </ion-segment>
      </div>

      <!-- KPIs -->
      <div class="kpi-row">
        <ion-chip color="primary" outline>
          <strong>{{ filtrados.length }}</strong>&nbsp; artículos
        </ion-chip>
        <ion-chip color="success" outline>
          <strong>{{ unidadesTotales }}</strong>&nbsp; unidades totales
        </ion-chip>
      </div>

      <!-- Grid -->
      <div class="grid">
        <ion-card v-for="a in filtrados" :key="a.id" class="card" :class="badgeClass(a)">
          <ion-card-header>
            <div class="card-header">
              <div class="card-title">
                <strong>{{ a.descripcion }}</strong>
                <ion-badge :color="a.activo ? 'success' : 'medium'">{{ a.activo ? 'Activo' : 'Inactivo' }}</ion-badge>
              </div>
              <small class="muted">
                Int: {{ a.codigointerno }} · EAN: {{ a.ean || '-' }}
              </small>
            </div>
          </ion-card-header>

          <ion-card-content>
            <div class="row">
              <div class="col">
                <span class="label">Stock</span>
                <div class="stock">{{ a.stock ?? 0 }}</div>
              </div>
              <div class="col">
                <span class="label">Venta</span>
                <div class="price">${{ (a.precioventa||0).toFixed(2) }}</div>
              </div>
              <div class="col">
                <span class="label">Costo</span>
                <div class="price muted2">${{ (a.preciocosto||0).toFixed(2) }}</div>
              </div>
            </div>

            <div class="actions">
              <ion-button size="small" color="success" @click="openMovimiento(a, 'ingreso')">Ingreso</ion-button>
              <ion-button size="small" color="warning" fill="outline" @click="openMovimiento(a, 'egreso')">Egreso</ion-button>
              <ion-button size="small" fill="clear" @click="goArticulo(a.id)">Ver</ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Modal movimiento -->
      <ion-modal :is-open="showModal" @didDismiss="closeModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ modalTitle }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeModal">Cerrar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <div class="mov-info">
            <div class="mov-desc">{{ current?.descripcion }}</div>
            <div class="mov-stock">Stock actual: <strong>{{ current?.stock ?? 0 }}</strong></div>
          </div>
          <ion-list inset>
            <ion-item>
              <ion-input
                v-model.number="mov.cantidad"
                type="number"
                inputmode="numeric"
                min="1"
                label="Cantidad"
                label-placement="floating"
                required
              />
            </ion-item>
            <ion-item>
              <ion-input
                v-model="mov.motivo"
                label="Motivo"
                label-placement="floating"
                placeholder="Ej: compra proveedor, ajuste, venta, rotura…"
              />
            </ion-item>
          </ion-list>
          <div class="actions">
            <ion-button expand="block" @click="confirmMovimiento">Confirmar</ion-button>
          </div>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonSearchbar, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardHeader, IonCardContent, IonBadge, IonButton,
  IonChip, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonItem, IonInput, IonList
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
}

const KEY = 'romi_articulos'
const getList = (): Articulo[] => JSON.parse(localStorage.getItem(KEY) || '[]')
const setList = (arr: Articulo[]) => localStorage.setItem(KEY, JSON.stringify(arr))

const router = useRouter()
const q = ref('')
const filtro = ref<'todos'|'bajo'|'cero'>('todos')
const orden = ref<'desc'|'stk'>('desc')
const list = ref<Articulo[]>([])

function load(){ list.value = getList() }
function save(arr: Articulo[]){ setList(arr); load() }

const LOW = 5 // umbral de bajo stock (podemos hacerlo configurable)

const filtrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  let items = list.value.filter(a => {
    const txt = (a.descripcion + ' ' + a.codigointerno + ' ' + (a.ean||'')).toLowerCase()
    const match = term === '' || txt.includes(term)
    let cond = true
    const st = a.stock ?? 0
    if (filtro.value === 'bajo') cond = st > 0 && st <= LOW
    if (filtro.value === 'cero') cond = st === 0
    return match && cond
  })
  if (orden.value === 'desc') items = items.sort((a,b)=> a.descripcion.localeCompare(b.descripcion))
  if (orden.value === 'stk') items = items.sort((a,b)=> (b.stock??0) - (a.stock??0))
  return items
})

const unidadesTotales = computed(() => filtrados.value.reduce((acc,a)=> acc + (a.stock||0), 0))

function badgeClass(a:Articulo){
  const st = a.stock ?? 0
  return st === 0 ? 'card-zero' : st <= LOW ? 'card-low' : ''
}

function goArticulo(id:string){
  router.push(`/app/articulo/${id}`)
}

/* —— Movimiento —— */
const showModal = ref(false)
const tipo = ref<'ingreso'|'egreso'>('ingreso')
const current = ref<Articulo | null>(null)
const mov = reactive({ cantidad: 1 as number, motivo: '' })

const modalTitle = computed(()=> (tipo.value === 'ingreso' ? 'Ingreso de stock' : 'Egreso de stock'))

function openMovimiento(a:Articulo, t:'ingreso'|'egreso'){
  current.value = a
  tipo.value = t
  mov.cantidad = 1
  mov.motivo = ''
  showModal.value = true
}
function closeModal(){ showModal.value = false }

function confirmMovimiento(){
  if (!current.value) return
  const cant = Math.max(1, Math.floor(Number(mov.cantidad)||0))
  const arr = getList()
  const i = arr.findIndex(x=> x.id === current.value!.id)
  if (i>-1){
    const prev = arr[i].stock ?? 0
    const next = tipo.value === 'ingreso' ? prev + cant : Math.max(0, prev - cant)
    arr[i].stock = next
    // Futuro: persistir movimiento en tabla 'stock_movimientos' con {articulo_id, tipo, cantidad, motivo, fecha}
    setList(arr)
    load()
  }
  closeModal()
}

onMounted(load)
</script>

<style scoped>
.title { margin: 0 0 12px; font-weight: 800; }
.controls { display: grid; gap: 8px; }
.search { }
.segment { }
.kpi-row { display:flex; gap:8px; align-items:center; margin:8px 0 10px; flex-wrap: wrap; }

.grid { display: grid; gap: 12px; }
@media (min-width: 720px){ .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px){ .grid { grid-template-columns: repeat(3, 1fr); } }

.card { border-radius: 16px; overflow: hidden; }
.card-low { outline: 2px dashed #f5a62344; }
.card-zero { outline: 2px solid #e74c3c44; }
.card-header { display: flex; flex-direction: column; gap: 6px; }
.card-title { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.muted { color: rgba(0,0,0,.55); }

.row { display: grid; grid-template-columns: repeat(3, minmax(100px, 1fr)); gap: 10px; margin: 6px 0 10px; }
.col { display: grid; gap: 4px; }
.label { font-size: 12px; color: rgba(0,0,0,.55); }
.stock { font-size: 20px; font-weight: 800; }
.price { font-size: 16px; font-weight: 700; }
.muted2 { color: #666; }

.actions { display:flex; gap:6px; flex-wrap: wrap; margin-top: 6px; }

.mov-info { display:grid; gap:4px; margin-bottom: 10px; }
.mov-desc { font-weight: 700; }
.mov-stock { color: rgba(0,0,0,.65); }
</style>
